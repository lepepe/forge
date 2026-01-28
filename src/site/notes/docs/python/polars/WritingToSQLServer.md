---
{"dg-publish":true,"permalink":"/docs/python/polars/writing-to-sql-server/","tags":["polars","sql-server","insert","update","delete","etl"]}
---

# Writing to SQL Server (INSERT, UPDATE, DELETE)

## Overview

This guide covers how to write data from Polars DataFrames to SQL Server, including INSERT, UPDATE, and DELETE operations. We'll use `pyodbc` for direct database operations and explore patterns for efficient bulk data loading.

---

## Prerequisites

```bash
pip install polars pyodbc sqlalchemy
```

---

## Connection Setup

```python
import polars as pl
import pyodbc
from contextlib import contextmanager


@contextmanager
def get_connection(conn_str: str):
    """Context manager for database connections."""
    conn = pyodbc.connect(conn_str)
    try:
        yield conn
    finally:
        conn.close()


# Connection string
CONN_STR = (
    "Driver={ODBC Driver 18 for SQL Server};"
    "Server=localhost;"
    "Database=SalesDB;"
    "UID=sa;"
    "PWD=YourPassword123;"
    "TrustServerCertificate=yes;"
)
```

---

## INSERT Operations

### Basic INSERT (Row by Row)

```python
def insert_rows(df: pl.DataFrame, table: str, conn_str: str) -> int:
    """Insert DataFrame rows into SQL Server table."""
    columns = df.columns
    placeholders = ", ".join(["?" for _ in columns])
    column_list = ", ".join(columns)

    sql = f"INSERT INTO {table} ({column_list}) VALUES ({placeholders})"

    rows_inserted = 0
    with get_connection(conn_str) as conn:
        cursor = conn.cursor()
        for row in df.iter_rows():
            cursor.execute(sql, row)
            rows_inserted += 1
        conn.commit()

    return rows_inserted


# Usage
df = pl.DataFrame({
    "customer_id": [1, 2, 3],
    "name": ["Alice", "Bob", "Charlie"],
    "amount": [1500.50, 2300.00, 1800.75]
})

inserted = insert_rows(df, "Customers", CONN_STR)
print(f"Inserted {inserted} rows")
```

### Bulk INSERT (executemany)

```python
def bulk_insert(df: pl.DataFrame, table: str, conn_str: str, batch_size: int = 1000) -> int:
    """Bulk insert DataFrame rows into SQL Server table."""
    columns = df.columns
    placeholders = ", ".join(["?" for _ in columns])
    column_list = ", ".join(columns)

    sql = f"INSERT INTO {table} ({column_list}) VALUES ({placeholders})"

    # Convert to list of tuples
    rows = df.rows()

    total_inserted = 0
    with get_connection(conn_str) as conn:
        cursor = conn.cursor()
        cursor.fast_executemany = True  # Enable fast bulk insert

        # Process in batches
        for i in range(0, len(rows), batch_size):
            batch = rows[i:i + batch_size]
            cursor.executemany(sql, batch)
            total_inserted += len(batch)

        conn.commit()

    return total_inserted


# Usage
inserted = bulk_insert(df, "Customers", CONN_STR, batch_size=5000)
```

### INSERT with Identity Column

```python
def insert_with_identity(df: pl.DataFrame, table: str, conn_str: str) -> pl.DataFrame:
    """Insert rows and return the generated identity values."""
    columns = df.columns
    placeholders = ", ".join(["?" for _ in columns])
    column_list = ", ".join(columns)

    # Use OUTPUT clause to get inserted identity
    sql = f"""
        INSERT INTO {table} ({column_list})
        OUTPUT INSERTED.id
        VALUES ({placeholders})
    """

    ids = []
    with get_connection(conn_str) as conn:
        cursor = conn.cursor()
        for row in df.iter_rows():
            cursor.execute(sql, row)
            identity = cursor.fetchone()[0]
            ids.append(identity)
        conn.commit()

    return df.with_columns(pl.Series("id", ids))
```

---

## UPDATE Operations

### Basic UPDATE

```python
def update_rows(
    df: pl.DataFrame,
    table: str,
    key_columns: list[str],
    update_columns: list[str],
    conn_str: str
) -> int:
    """Update rows in SQL Server based on key columns."""
    set_clause = ", ".join([f"{col} = ?" for col in update_columns])
    where_clause = " AND ".join([f"{col} = ?" for col in key_columns])

    sql = f"UPDATE {table} SET {set_clause} WHERE {where_clause}"

    rows_updated = 0
    with get_connection(conn_str) as conn:
        cursor = conn.cursor()

        for row in df.iter_rows(named=True):
            # Values for SET clause, then WHERE clause
            params = [row[col] for col in update_columns] + [row[col] for col in key_columns]
            cursor.execute(sql, params)
            rows_updated += cursor.rowcount

        conn.commit()

    return rows_updated


# Usage
updates_df = pl.DataFrame({
    "customer_id": [1, 2],
    "name": ["Alice Updated", "Bob Updated"],
    "amount": [1600.00, 2400.00]
})

updated = update_rows(
    df=updates_df,
    table="Customers",
    key_columns=["customer_id"],
    update_columns=["name", "amount"],
    conn_str=CONN_STR
)
print(f"Updated {updated} rows")
```

### Bulk UPDATE with Temporary Table

For large updates, use a staging table approach:

```python
def bulk_update_via_staging(
    df: pl.DataFrame,
    table: str,
    key_columns: list[str],
    update_columns: list[str],
    conn_str: str
) -> int:
    """Bulk update using staging table pattern."""
    staging_table = f"#staging_{table}"

    with get_connection(conn_str) as conn:
        cursor = conn.cursor()

        # Create temporary staging table
        columns_def = ", ".join([f"{col} NVARCHAR(MAX)" for col in df.columns])
        cursor.execute(f"CREATE TABLE {staging_table} ({columns_def})")

        # Bulk insert into staging
        placeholders = ", ".join(["?" for _ in df.columns])
        insert_sql = f"INSERT INTO {staging_table} VALUES ({placeholders})"
        cursor.fast_executemany = True
        cursor.executemany(insert_sql, df.rows())

        # Build UPDATE from staging
        set_clause = ", ".join([f"t.{col} = s.{col}" for col in update_columns])
        join_clause = " AND ".join([f"t.{col} = s.{col}" for col in key_columns])

        update_sql = f"""
            UPDATE t
            SET {set_clause}
            FROM {table} t
            INNER JOIN {staging_table} s ON {join_clause}
        """

        cursor.execute(update_sql)
        rows_updated = cursor.rowcount

        conn.commit()

    return rows_updated
```

---

## DELETE Operations

### Basic DELETE

```python
def delete_rows(
    df: pl.DataFrame,
    table: str,
    key_columns: list[str],
    conn_str: str
) -> int:
    """Delete rows from SQL Server based on key columns."""
    where_clause = " AND ".join([f"{col} = ?" for col in key_columns])
    sql = f"DELETE FROM {table} WHERE {where_clause}"

    rows_deleted = 0
    with get_connection(conn_str) as conn:
        cursor = conn.cursor()

        for row in df.select(key_columns).iter_rows():
            cursor.execute(sql, row)
            rows_deleted += cursor.rowcount

        conn.commit()

    return rows_deleted


# Usage
to_delete = pl.DataFrame({
    "customer_id": [3, 4, 5]
})

deleted = delete_rows(to_delete, "Customers", ["customer_id"], CONN_STR)
print(f"Deleted {deleted} rows")
```

### Bulk DELETE with IN Clause

```python
def bulk_delete_by_ids(
    ids: list,
    table: str,
    id_column: str,
    conn_str: str,
    batch_size: int = 1000
) -> int:
    """Delete rows by ID list using batched IN clause."""
    total_deleted = 0

    with get_connection(conn_str) as conn:
        cursor = conn.cursor()

        for i in range(0, len(ids), batch_size):
            batch = ids[i:i + batch_size]
            placeholders = ", ".join(["?" for _ in batch])
            sql = f"DELETE FROM {table} WHERE {id_column} IN ({placeholders})"
            cursor.execute(sql, batch)
            total_deleted += cursor.rowcount

        conn.commit()

    return total_deleted
```

---

## UPSERT (MERGE) Operations

### SQL Server MERGE Pattern

```python
def upsert_dataframe(
    df: pl.DataFrame,
    table: str,
    key_columns: list[str],
    conn_str: str
) -> dict:
    """Upsert DataFrame using SQL Server MERGE statement."""
    staging_table = f"#staging_{table}"
    all_columns = df.columns
    update_columns = [c for c in all_columns if c not in key_columns]

    with get_connection(conn_str) as conn:
        cursor = conn.cursor()

        # Create staging table
        columns_def = ", ".join([f"{col} NVARCHAR(MAX)" for col in all_columns])
        cursor.execute(f"CREATE TABLE {staging_table} ({columns_def})")

        # Insert data into staging
        placeholders = ", ".join(["?" for _ in all_columns])
        insert_sql = f"INSERT INTO {staging_table} VALUES ({placeholders})"
        cursor.fast_executemany = True
        cursor.executemany(insert_sql, df.rows())

        # Build MERGE statement
        join_clause = " AND ".join([f"t.{col} = s.{col}" for col in key_columns])
        update_set = ", ".join([f"t.{col} = s.{col}" for col in update_columns])
        insert_cols = ", ".join(all_columns)
        insert_vals = ", ".join([f"s.{col}" for col in all_columns])

        merge_sql = f"""
            MERGE INTO {table} AS t
            USING {staging_table} AS s
            ON {join_clause}
            WHEN MATCHED THEN
                UPDATE SET {update_set}
            WHEN NOT MATCHED THEN
                INSERT ({insert_cols})
                VALUES ({insert_vals})
            OUTPUT $action;
        """

        cursor.execute(merge_sql)

        # Count actions
        actions = [row[0] for row in cursor.fetchall()]
        result = {
            "inserted": actions.count("INSERT"),
            "updated": actions.count("UPDATE")
        }

        conn.commit()

    return result


# Usage
data = pl.DataFrame({
    "customer_id": [1, 2, 6],  # 1,2 exist; 6 is new
    "name": ["Alice New", "Bob New", "Frank"],
    "amount": [1700.00, 2500.00, 900.00]
})

result = upsert_dataframe(data, "Customers", ["customer_id"], CONN_STR)
print(f"Inserted: {result['inserted']}, Updated: {result['updated']}")
```

---

## Full ETL Writer Class

```python
import polars as pl
import pyodbc
from dataclasses import dataclass
from typing import Literal
from contextlib import contextmanager


@dataclass
class WriteResult:
    operation: str
    rows_affected: int
    success: bool
    error: str | None = None


class SQLServerWriter:
    def __init__(self, conn_str: str, batch_size: int = 5000):
        self.conn_str = conn_str
        self.batch_size = batch_size

    @contextmanager
    def _connection(self):
        conn = pyodbc.connect(self.conn_str)
        try:
            yield conn
        finally:
            conn.close()

    def truncate_table(self, table: str) -> WriteResult:
        """Truncate table before full load."""
        try:
            with self._connection() as conn:
                cursor = conn.cursor()
                cursor.execute(f"TRUNCATE TABLE {table}")
                conn.commit()
            return WriteResult("TRUNCATE", 0, True)
        except Exception as e:
            return WriteResult("TRUNCATE", 0, False, str(e))

    def insert(self, df: pl.DataFrame, table: str) -> WriteResult:
        """Bulk insert DataFrame into table."""
        try:
            columns = df.columns
            placeholders = ", ".join(["?" for _ in columns])
            column_list = ", ".join(columns)
            sql = f"INSERT INTO {table} ({column_list}) VALUES ({placeholders})"

            rows = df.rows()
            total = 0

            with self._connection() as conn:
                cursor = conn.cursor()
                cursor.fast_executemany = True

                for i in range(0, len(rows), self.batch_size):
                    batch = rows[i:i + self.batch_size]
                    cursor.executemany(sql, batch)
                    total += len(batch)

                conn.commit()

            return WriteResult("INSERT", total, True)
        except Exception as e:
            return WriteResult("INSERT", 0, False, str(e))

    def upsert(
        self,
        df: pl.DataFrame,
        table: str,
        key_columns: list[str]
    ) -> WriteResult:
        """MERGE (upsert) DataFrame into table."""
        try:
            staging = f"#stg_{table.replace('.', '_')}"
            all_cols = df.columns
            update_cols = [c for c in all_cols if c not in key_columns]

            with self._connection() as conn:
                cursor = conn.cursor()

                # Create staging table matching target structure
                cursor.execute(f"""
                    SELECT TOP 0 * INTO {staging} FROM {table}
                """)

                # Insert to staging
                placeholders = ", ".join(["?" for _ in all_cols])
                cursor.fast_executemany = True
                cursor.executemany(
                    f"INSERT INTO {staging} VALUES ({placeholders})",
                    df.rows()
                )

                # MERGE
                join_on = " AND ".join([f"t.{c} = s.{c}" for c in key_columns])
                update_set = ", ".join([f"t.{c} = s.{c}" for c in update_cols])
                ins_cols = ", ".join(all_cols)
                ins_vals = ", ".join([f"s.{c}" for c in all_cols])

                merge_sql = f"""
                    MERGE INTO {table} AS t
                    USING {staging} AS s ON {join_on}
                    WHEN MATCHED THEN UPDATE SET {update_set}
                    WHEN NOT MATCHED THEN INSERT ({ins_cols}) VALUES ({ins_vals});
                """

                cursor.execute(merge_sql)
                affected = cursor.rowcount
                conn.commit()

            return WriteResult("UPSERT", affected, True)
        except Exception as e:
            return WriteResult("UPSERT", 0, False, str(e))

    def delete_by_keys(
        self,
        df: pl.DataFrame,
        table: str,
        key_columns: list[str]
    ) -> WriteResult:
        """Delete rows matching key columns in DataFrame."""
        try:
            staging = f"#del_{table.replace('.', '_')}"

            with self._connection() as conn:
                cursor = conn.cursor()

                # Create staging with just keys
                keys_df = df.select(key_columns)
                cols_def = ", ".join([f"{c} NVARCHAR(MAX)" for c in key_columns])
                cursor.execute(f"CREATE TABLE {staging} ({cols_def})")

                # Insert keys to staging
                placeholders = ", ".join(["?" for _ in key_columns])
                cursor.fast_executemany = True
                cursor.executemany(
                    f"INSERT INTO {staging} VALUES ({placeholders})",
                    keys_df.rows()
                )

                # Delete using staging
                join_on = " AND ".join([f"t.{c} = s.{c}" for c in key_columns])
                cursor.execute(f"""
                    DELETE t FROM {table} t
                    INNER JOIN {staging} s ON {join_on}
                """)

                affected = cursor.rowcount
                conn.commit()

            return WriteResult("DELETE", affected, True)
        except Exception as e:
            return WriteResult("DELETE", 0, False, str(e))


# Usage
writer = SQLServerWriter(CONN_STR, batch_size=10000)

# Full load (truncate + insert)
writer.truncate_table("Sales.Customers")
result = writer.insert(customers_df, "Sales.Customers")
print(f"Inserted {result.rows_affected} rows")

# Incremental load (upsert)
result = writer.upsert(updates_df, "Sales.Customers", ["customer_id"])
print(f"Upserted {result.rows_affected} rows")

# Delete removed records
result = writer.delete_by_keys(deleted_df, "Sales.Customers", ["customer_id"])
print(f"Deleted {result.rows_affected} rows")
```

---

## Performance Tips

### 1. Use fast_executemany

```python
cursor.fast_executemany = True  # Significant speedup for bulk operations
```

### 2. Batch Operations

```python
# Process in batches to manage memory and transaction size
for i in range(0, len(rows), batch_size):
    batch = rows[i:i + batch_size]
    cursor.executemany(sql, batch)
```

### 3. Use Staging Tables for Large Operations

```python
# Insert to staging, then MERGE/UPDATE/DELETE in single statement
# Much faster than row-by-row operations
```

### 4. Disable Indexes During Bulk Load

```python
cursor.execute("ALTER INDEX ALL ON MyTable DISABLE")
# ... bulk insert ...
cursor.execute("ALTER INDEX ALL ON MyTable REBUILD")
```

### 5. Use TABLOCK Hint for Minimal Logging

```python
sql = "INSERT INTO MyTable WITH (TABLOCK) SELECT * FROM #staging"
```

---

## Key Takeaways

1. Use **`fast_executemany = True`** for bulk operations
2. Use **staging tables** for large UPDATE/DELETE/MERGE operations
3. Use **MERGE** statement for efficient upserts
4. **Batch operations** to manage memory and transaction size
5. Implement **retry logic** for production reliability
6. Use **context managers** for proper connection handling
7. Return **WriteResult** objects for operation tracking

---

## Related Topics

- [[docs/python/polars/PolarsGuide\|Polars Guide]]
- [[docs/python/polars/SQLServerConnection\|Connecting to SQL Server]]
- [[docs/python/polars/AirflowETL\|ETL with Apache Airflow]]
- [[docs/python/polars/ETLPatterns\|Common ETL Patterns]]

---

## Sources

- [PyODBC Documentation](https://github.com/mkleehammer/pyodbc/wiki)
- [SQL Server MERGE Statement](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql)
- [Bulk Loading Best Practices](https://learn.microsoft.com/en-us/sql/relational-databases/import-export/prerequisites-for-minimal-logging-in-bulk-import)

---

#polars #python #sql-server #insert #update #delete #etl
