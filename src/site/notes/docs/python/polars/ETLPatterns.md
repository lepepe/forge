---
{"dg-publish":true,"permalink":"/docs/python/polars/etl-patterns/","tags":["polars","etl","patterns","best-practices"]}
---

# Common ETL Patterns

## Overview

This guide covers common ETL patterns implemented with Polars for SQL Server data pipelines. These patterns are battle-tested approaches for handling various data loading scenarios.

---

## Pattern 1: Full Load (Truncate and Load)

Best for small dimension tables or when complete refresh is required.

```python
import polars as pl
from dataclasses import dataclass


@dataclass
class FullLoadResult:
    source_count: int
    loaded_count: int
    success: bool


def full_load(
    source_query: str,
    source_conn: str,
    dest_table: str,
    dest_conn: str,
    transform_func: callable = None
) -> FullLoadResult:
    """
    Full load pattern: Extract all, truncate destination, load all.

    Best for:
    - Small dimension tables (< 1M rows)
    - Tables requiring complete refresh
    - Simple data without complex history tracking
    """
    # Extract
    df = pl.read_database(query=source_query, connection=source_conn)
    source_count = df.height

    # Transform (optional)
    if transform_func:
        df = transform_func(df)

    # Load
    import pyodbc
    conn = pyodbc.connect(dest_conn)
    cursor = conn.cursor()

    try:
        # Truncate destination
        cursor.execute(f"TRUNCATE TABLE {dest_table}")

        # Bulk insert
        columns = df.columns
        placeholders = ", ".join(["?" for _ in columns])
        sql = f"INSERT INTO {dest_table} ({', '.join(columns)}) VALUES ({placeholders})"

        cursor.fast_executemany = True
        cursor.executemany(sql, df.rows())
        conn.commit()

        return FullLoadResult(source_count, df.height, True)
    except Exception as e:
        conn.rollback()
        raise
    finally:
        conn.close()


# Usage
result = full_load(
    source_query="SELECT * FROM dbo.Products",
    source_conn=SOURCE_CONN,
    dest_table="dbo.DimProduct",
    dest_conn=DEST_CONN,
    transform_func=lambda df: df.with_columns([
        pl.col("ProductName").str.to_titlecase(),
        pl.lit(True).alias("IsActive")
    ])
)
```

---

## Pattern 2: Incremental Load (Delta)

Best for large tables with identifiable new/changed records.

```python
from datetime import datetime


@dataclass
class IncrementalLoadResult:
    extracted: int
    inserted: int
    updated: int
    deleted: int


def incremental_load(
    source_conn: str,
    dest_conn: str,
    source_table: str,
    dest_table: str,
    key_columns: list[str],
    timestamp_column: str,
    last_run: datetime
) -> IncrementalLoadResult:
    """
    Incremental load pattern: Only process changed records.

    Best for:
    - Large fact tables
    - Tables with reliable timestamp columns
    - Minimizing data movement
    """
    # Extract only changed records
    query = f"""
        SELECT *
        FROM {source_table}
        WHERE {timestamp_column} > '{last_run.isoformat()}'
    """
    df = pl.read_database(query=query, connection=source_conn)

    if df.height == 0:
        return IncrementalLoadResult(0, 0, 0, 0)

    # Get existing keys from destination
    keys_str = ", ".join(key_columns)
    existing = pl.read_database(
        query=f"SELECT {keys_str} FROM {dest_table}",
        connection=dest_conn
    )

    # Identify inserts vs updates
    new_records = df.join(
        existing,
        on=key_columns,
        how="anti"
    )

    updated_records = df.join(
        existing,
        on=key_columns,
        how="semi"
    )

    # Load
    import pyodbc
    conn = pyodbc.connect(dest_conn)
    cursor = conn.cursor()
    cursor.fast_executemany = True

    try:
        # Insert new records
        if new_records.height > 0:
            columns = new_records.columns
            placeholders = ", ".join(["?" for _ in columns])
            insert_sql = f"INSERT INTO {dest_table} ({', '.join(columns)}) VALUES ({placeholders})"
            cursor.executemany(insert_sql, new_records.rows())

        # Update existing records
        if updated_records.height > 0:
            update_cols = [c for c in updated_records.columns if c not in key_columns]
            set_clause = ", ".join([f"{c} = ?" for c in update_cols])
            where_clause = " AND ".join([f"{c} = ?" for c in key_columns])
            update_sql = f"UPDATE {dest_table} SET {set_clause} WHERE {where_clause}"

            for row in updated_records.iter_rows(named=True):
                params = [row[c] for c in update_cols] + [row[c] for c in key_columns]
                cursor.execute(update_sql, params)

        conn.commit()

        return IncrementalLoadResult(
            extracted=df.height,
            inserted=new_records.height,
            updated=updated_records.height,
            deleted=0
        )
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
```

---

## Pattern 3: Change Data Capture (CDC)

For detecting and processing all types of changes.

```python
from enum import Enum


class ChangeType(Enum):
    INSERT = "I"
    UPDATE = "U"
    DELETE = "D"


def detect_changes(
    source_df: pl.DataFrame,
    target_df: pl.DataFrame,
    key_columns: list[str],
    compare_columns: list[str] | None = None
) -> dict[str, pl.DataFrame]:
    """
    Detect inserts, updates, and deletes between source and target.

    Returns dict with keys: 'inserts', 'updates', 'deletes'
    """
    if compare_columns is None:
        compare_columns = [c for c in source_df.columns if c not in key_columns]

    # Inserts: in source, not in target
    inserts = source_df.join(
        target_df.select(key_columns),
        on=key_columns,
        how="anti"
    )

    # Deletes: in target, not in source
    deletes = target_df.join(
        source_df.select(key_columns),
        on=key_columns,
        how="anti"
    )

    # Updates: in both, but values differ
    # Create hash of compare columns for efficient comparison
    source_with_hash = source_df.with_columns([
        pl.concat_str(compare_columns, separator="|").hash().alias("_row_hash")
    ])

    target_with_hash = target_df.with_columns([
        pl.concat_str(compare_columns, separator="|").hash().alias("_row_hash")
    ])

    updates = (
        source_with_hash
        .join(
            target_with_hash.select(key_columns + ["_row_hash"]),
            on=key_columns,
            how="inner",
            suffix="_target"
        )
        .filter(pl.col("_row_hash") != pl.col("_row_hash_target"))
        .drop(["_row_hash", "_row_hash_target"])
    )

    return {
        "inserts": inserts,
        "updates": updates,
        "deletes": deletes
    }


def apply_changes(
    changes: dict[str, pl.DataFrame],
    dest_table: str,
    key_columns: list[str],
    dest_conn: str
) -> dict[str, int]:
    """Apply detected changes to destination table."""
    import pyodbc
    conn = pyodbc.connect(dest_conn)
    cursor = conn.cursor()
    cursor.fast_executemany = True

    results = {"inserted": 0, "updated": 0, "deleted": 0}

    try:
        # Inserts
        inserts = changes["inserts"]
        if inserts.height > 0:
            columns = inserts.columns
            placeholders = ", ".join(["?" for _ in columns])
            sql = f"INSERT INTO {dest_table} ({', '.join(columns)}) VALUES ({placeholders})"
            cursor.executemany(sql, inserts.rows())
            results["inserted"] = inserts.height

        # Updates
        updates = changes["updates"]
        if updates.height > 0:
            update_cols = [c for c in updates.columns if c not in key_columns]
            set_clause = ", ".join([f"{c} = ?" for c in update_cols])
            where_clause = " AND ".join([f"{c} = ?" for c in key_columns])
            sql = f"UPDATE {dest_table} SET {set_clause} WHERE {where_clause}"

            for row in updates.iter_rows(named=True):
                params = [row[c] for c in update_cols] + [row[c] for c in key_columns]
                cursor.execute(sql, params)
            results["updated"] = updates.height

        # Deletes (soft delete or hard delete)
        deletes = changes["deletes"]
        if deletes.height > 0:
            where_clause = " AND ".join([f"{c} = ?" for c in key_columns])
            # Soft delete
            sql = f"UPDATE {dest_table} SET IsDeleted = 1, DeletedDate = GETDATE() WHERE {where_clause}"
            # Hard delete: sql = f"DELETE FROM {dest_table} WHERE {where_clause}"

            for row in deletes.select(key_columns).iter_rows():
                cursor.execute(sql, row)
            results["deleted"] = deletes.height

        conn.commit()
        return results
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# Usage
source_df = pl.read_database(query="SELECT * FROM source.Customers", connection=SOURCE_CONN)
target_df = pl.read_database(query="SELECT * FROM dest.DimCustomer", connection=DEST_CONN)

changes = detect_changes(
    source_df=source_df,
    target_df=target_df,
    key_columns=["CustomerID"],
    compare_columns=["Name", "Email", "Phone", "Address"]
)

print(f"Inserts: {changes['inserts'].height}")
print(f"Updates: {changes['updates'].height}")
print(f"Deletes: {changes['deletes'].height}")

results = apply_changes(changes, "dest.DimCustomer", ["CustomerID"], DEST_CONN)
```

---

## Pattern 4: Slowly Changing Dimension Type 2

For tracking historical changes to dimension data.

```python
from datetime import date


def scd_type_2_load(
    source_df: pl.DataFrame,
    target_conn: str,
    target_table: str,
    business_key: list[str],
    tracked_columns: list[str]
) -> dict[str, int]:
    """
    SCD Type 2: Track historical changes with effective dates.

    Maintains history by:
    - Expiring old records (set EffectiveTo, IsCurrent = 0)
    - Inserting new records with current dates
    """
    # Get current records from target
    business_key_str = ", ".join(business_key)
    target_df = pl.read_database(
        query=f"""
            SELECT *
            FROM {target_table}
            WHERE IsCurrent = 1
        """,
        connection=target_conn
    )

    today = date.today()
    yesterday = date.today().replace(day=date.today().day - 1)

    # Identify changes
    if target_df.height == 0:
        # All records are new
        new_records = source_df.with_columns([
            pl.lit(today).alias("EffectiveFrom"),
            pl.lit(date(9999, 12, 31)).alias("EffectiveTo"),
            pl.lit(True).alias("IsCurrent")
        ])
        expired_keys = pl.DataFrame()
    else:
        # Create hash for comparison
        source_hashed = source_df.with_columns([
            pl.concat_str(tracked_columns, separator="|").hash().alias("_hash")
        ])

        target_hashed = target_df.with_columns([
            pl.concat_str(tracked_columns, separator="|").hash().alias("_hash")
        ])

        # New records (not in target)
        truly_new = source_df.join(
            target_df.select(business_key),
            on=business_key,
            how="anti"
        ).with_columns([
            pl.lit(today).alias("EffectiveFrom"),
            pl.lit(date(9999, 12, 31)).alias("EffectiveTo"),
            pl.lit(True).alias("IsCurrent")
        ])

        # Changed records (in both, hash differs)
        changed = (
            source_hashed
            .join(
                target_hashed.select(business_key + ["_hash"]),
                on=business_key,
                suffix="_target"
            )
            .filter(pl.col("_hash") != pl.col("_hash_target"))
            .drop(["_hash", "_hash_target"])
            .with_columns([
                pl.lit(today).alias("EffectiveFrom"),
                pl.lit(date(9999, 12, 31)).alias("EffectiveTo"),
                pl.lit(True).alias("IsCurrent")
            ])
        )

        new_records = pl.concat([truly_new, changed])

        # Keys to expire
        expired_keys = changed.select(business_key)

    # Apply changes
    import pyodbc
    conn = pyodbc.connect(target_conn)
    cursor = conn.cursor()

    results = {"expired": 0, "inserted": 0}

    try:
        # Expire old versions
        if expired_keys.height > 0:
            where_clause = " AND ".join([f"{c} = ?" for c in business_key])
            expire_sql = f"""
                UPDATE {target_table}
                SET EffectiveTo = ?, IsCurrent = 0
                WHERE {where_clause} AND IsCurrent = 1
            """

            for row in expired_keys.iter_rows():
                cursor.execute(expire_sql, (yesterday,) + row)
            results["expired"] = expired_keys.height

        # Insert new versions
        if new_records.height > 0:
            columns = new_records.columns
            placeholders = ", ".join(["?" for _ in columns])
            insert_sql = f"INSERT INTO {target_table} ({', '.join(columns)}) VALUES ({placeholders})"

            cursor.fast_executemany = True
            cursor.executemany(insert_sql, new_records.rows())
            results["inserted"] = new_records.height

        conn.commit()
        return results
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# Usage
source = pl.DataFrame({
    "CustomerID": [1, 2, 3],
    "Name": ["Alice Smith", "Bob Jones", "Charlie Brown"],  # Alice changed name
    "Email": ["alice@new.com", "bob@example.com", "charlie@example.com"],
    "Status": ["Active", "Active", "Active"]
})

results = scd_type_2_load(
    source_df=source,
    target_conn=DEST_CONN,
    target_table="dbo.DimCustomer",
    business_key=["CustomerID"],
    tracked_columns=["Name", "Email", "Status"]
)
```

---

## Pattern 5: Lookup Enrichment

For enriching fact data with dimension attributes.

```python
def enrich_with_lookups(
    fact_df: pl.DataFrame,
    lookup_configs: list[dict],
    conn: str
) -> pl.DataFrame:
    """
    Enrich fact table with dimension lookups.

    lookup_configs: list of {
        "table": "dbo.DimProduct",
        "key": "ProductID",
        "fact_key": "product_id",
        "columns": ["ProductName", "Category"]
    }
    """
    result = fact_df

    for config in lookup_configs:
        # Load lookup table
        columns = [config["key"]] + config["columns"]
        lookup_df = pl.read_database(
            query=f"SELECT {', '.join(columns)} FROM {config['table']}",
            connection=conn
        )

        # Rename key column if different
        if config["key"] != config["fact_key"]:
            lookup_df = lookup_df.rename({config["key"]: config["fact_key"]})

        # Join
        result = result.join(
            lookup_df,
            on=config["fact_key"],
            how="left"
        )

    return result


# Usage
fact_orders = pl.DataFrame({
    "order_id": [1, 2, 3],
    "customer_id": [101, 102, 101],
    "product_id": [1, 2, 1],
    "quantity": [5, 3, 2],
    "amount": [100.0, 150.0, 40.0]
})

enriched = enrich_with_lookups(
    fact_df=fact_orders,
    lookup_configs=[
        {
            "table": "dbo.DimCustomer",
            "key": "CustomerID",
            "fact_key": "customer_id",
            "columns": ["CustomerName", "Segment"]
        },
        {
            "table": "dbo.DimProduct",
            "key": "ProductID",
            "fact_key": "product_id",
            "columns": ["ProductName", "Category"]
        }
    ],
    conn=DEST_CONN
)
```

---

## Pattern 6: Data Validation

For ensuring data quality before loading.

```python
from dataclasses import dataclass, field


@dataclass
class ValidationResult:
    is_valid: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    stats: dict = field(default_factory=dict)


def validate_dataframe(
    df: pl.DataFrame,
    rules: dict
) -> ValidationResult:
    """
    Validate DataFrame against rules.

    rules = {
        "required_columns": ["id", "name", "email"],
        "not_null": ["id", "name"],
        "unique": ["id"],
        "min_rows": 1,
        "custom": [
            ("email", lambda s: s.str.contains("@"), "Invalid email format")
        ]
    }
    """
    result = ValidationResult(is_valid=True)
    result.stats["row_count"] = df.height

    # Check required columns
    if "required_columns" in rules:
        missing = set(rules["required_columns"]) - set(df.columns)
        if missing:
            result.errors.append(f"Missing required columns: {missing}")
            result.is_valid = False

    # Check not null
    if "not_null" in rules:
        for col in rules["not_null"]:
            if col in df.columns:
                null_count = df.filter(pl.col(col).is_null()).height
                if null_count > 0:
                    result.errors.append(f"Column '{col}' has {null_count} null values")
                    result.is_valid = False

    # Check unique
    if "unique" in rules:
        for col in rules["unique"]:
            if col in df.columns:
                total = df.height
                unique = df.select(col).unique().height
                if total != unique:
                    result.errors.append(f"Column '{col}' has {total - unique} duplicate values")
                    result.is_valid = False

    # Check minimum rows
    if "min_rows" in rules:
        if df.height < rules["min_rows"]:
            result.errors.append(f"Expected at least {rules['min_rows']} rows, got {df.height}")
            result.is_valid = False

    # Custom validations
    if "custom" in rules:
        for col, check_func, message in rules["custom"]:
            if col in df.columns:
                invalid_count = df.filter(~check_func(pl.col(col))).height
                if invalid_count > 0:
                    result.warnings.append(f"{message}: {invalid_count} rows affected")

    return result


# Usage
df = pl.DataFrame({
    "id": [1, 2, 2, 4],  # Duplicate!
    "name": ["Alice", "Bob", None, "Diana"],  # Null!
    "email": ["alice@test.com", "invalid", "charlie@test.com", "diana@test.com"]
})

rules = {
    "required_columns": ["id", "name", "email"],
    "not_null": ["id", "name"],
    "unique": ["id"],
    "min_rows": 1,
    "custom": [
        ("email", lambda s: s.str.contains("@"), "Invalid email format")
    ]
}

result = validate_dataframe(df, rules)
print(f"Valid: {result.is_valid}")
print(f"Errors: {result.errors}")
print(f"Warnings: {result.warnings}")
```

---

## Pattern 7: Chunked Processing

For processing very large files in memory-efficient chunks.

```python
def process_large_file_chunked(
    file_path: str,
    chunk_size: int,
    transform_func: callable,
    output_path: str
) -> int:
    """
    Process large file in chunks to manage memory.

    Best for:
    - Files larger than available memory
    - Streaming transformations
    - Append-only destinations
    """
    total_rows = 0
    first_chunk = True

    # Use lazy scanning with batched reading
    lf = pl.scan_csv(file_path)

    # Get total row count for progress
    total_count = lf.select(pl.count()).collect().item()

    for offset in range(0, total_count, chunk_size):
        # Read chunk
        chunk = (
            lf
            .slice(offset, chunk_size)
            .collect()
        )

        # Transform
        transformed = transform_func(chunk)

        # Write (append mode after first chunk)
        if first_chunk:
            transformed.write_parquet(output_path)
            first_chunk = False
        else:
            # Append to existing file
            existing = pl.read_parquet(output_path)
            combined = pl.concat([existing, transformed])
            combined.write_parquet(output_path)

        total_rows += transformed.height
        print(f"Processed {total_rows}/{total_count} rows")

    return total_rows


# Alternative: Stream directly to database
def stream_to_database(
    file_path: str,
    chunk_size: int,
    transform_func: callable,
    dest_table: str,
    dest_conn: str
) -> int:
    """Stream large file directly to database in chunks."""
    import pyodbc

    conn = pyodbc.connect(dest_conn)
    cursor = conn.cursor()
    cursor.fast_executemany = True

    total_rows = 0

    # Scan lazily
    lf = pl.scan_csv(file_path)
    total_count = lf.select(pl.count()).collect().item()

    for offset in range(0, total_count, chunk_size):
        chunk = lf.slice(offset, chunk_size).collect()
        transformed = transform_func(chunk)

        # Insert chunk
        columns = transformed.columns
        placeholders = ", ".join(["?" for _ in columns])
        sql = f"INSERT INTO {dest_table} ({', '.join(columns)}) VALUES ({placeholders})"

        cursor.executemany(sql, transformed.rows())
        conn.commit()

        total_rows += transformed.height
        print(f"Loaded {total_rows}/{total_count} rows")

    conn.close()
    return total_rows
```

---

## Pattern Summary

| Pattern | Use Case | Complexity |
|---------|----------|------------|
| **Full Load** | Small tables, complete refresh | Low |
| **Incremental** | Large tables with timestamps | Medium |
| **CDC** | Track all change types | Medium |
| **SCD Type 2** | Historical tracking | High |
| **Lookup Enrichment** | Fact table enrichment | Low |
| **Validation** | Data quality checks | Low |
| **Chunked Processing** | Very large files | Medium |

---

## Key Takeaways

1. Choose the **right pattern** based on data size and requirements
2. Use **anti-join** for efficient insert detection
3. Use **hash columns** for efficient change detection
4. Implement **validation** before loading to catch issues early
5. Use **chunked processing** for memory-constrained environments
6. Always include **error handling** and **rollback** capability
7. Track **watermarks** for reliable incremental loads

---

## Related Topics

- [[docs/python/polars/PolarsGuide\|Polars Guide]]
- [[docs/python/polars/WritingToSQLServer\|Writing to SQL Server]]
- [[docs/python/polars/AirflowETL\|ETL with Apache Airflow]]
- [[docs/python/polars/JoiningData\|Joining DataFrames]]

---

## Sources

- [Kimball Group ETL Patterns](https://www.kimballgroup.com/)
- [Polars Documentation](https://docs.pola.rs/)
- [Microsoft SQL Server Best Practices](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/indexes)

---

#polars #python #etl #patterns #best-practices
