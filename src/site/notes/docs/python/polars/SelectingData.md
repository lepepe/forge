---
{"dg-publish":true,"permalink":"/docs/python/polars/selecting-data/","tags":["polars","select","columns","reading"]}
---

# Selecting and Reading Data

## Overview

This guide covers how to select columns and read data using Polars, with comparisons to SQL Server syntax. Polars provides multiple ways to select and manipulate columns, from simple column selection to complex expressions.

---

## SQL to Polars Mapping

| SQL Server | Polars |
|------------|--------|
| `SELECT *` | `df.select(pl.all())` or just `df` |
| `SELECT col1, col2` | `df.select(["col1", "col2"])` |
| `SELECT col1 AS alias` | `df.select(pl.col("col1").alias("alias"))` |
| `SELECT TOP 10 *` | `df.head(10)` |
| `SELECT DISTINCT col` | `df.select("col").unique()` |

---

## Basic Column Selection

### Select Specific Columns

```python
import polars as pl

df = pl.DataFrame({
    "customer_id": [1, 2, 3, 4, 5],
    "name": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
    "city": ["NYC", "Boston", "Chicago", "Boston", "NYC"],
    "sales_2023": [1500, 2300, 1800, 2100, 1950],
    "sales_2024": [1700, 2500, 1900, 2400, 2100]
})

# Select by column names (list of strings)
result = df.select(["customer_id", "name"])

# Select using pl.col
result = df.select([pl.col("customer_id"), pl.col("name")])

# Shorthand for single column
result = df.select("name")
```

### Select All Columns

```python
# All columns
result = df.select(pl.all())

# All columns except specific ones
result = df.select(pl.all().exclude(["city"]))

# All columns except by pattern
result = df.select(pl.all().exclude("^sales_.*$"))
```

### Select by Pattern

```python
# Columns matching regex pattern
result = df.select(pl.col("^sales_.*$"))

# Columns by data type
result = df.select(pl.col(pl.Int64))  # All integer columns
result = df.select(pl.col(pl.Utf8))   # All string columns

# Multiple patterns
result = df.select([
    pl.col("customer_id"),
    pl.col("^sales_.*$")
])
```

---

## Column Aliases

### Renaming in Selection

```python
# SQL: SELECT customer_id AS id, name AS customer_name
result = df.select([
    pl.col("customer_id").alias("id"),
    pl.col("name").alias("customer_name")
])

# Rename multiple columns
result = df.select([
    pl.col("customer_id").alias("id"),
    pl.col("name"),
    pl.col("sales_2023").alias("last_year_sales"),
    pl.col("sales_2024").alias("current_year_sales")
])
```

### Using rename()

```python
# Rename columns in place
result = df.rename({
    "customer_id": "id",
    "sales_2023": "last_year"
})
```

---

## Computed Columns

### Arithmetic Operations

```python
# SQL: SELECT *, sales_2024 - sales_2023 AS growth
result = df.select([
    pl.all(),
    (pl.col("sales_2024") - pl.col("sales_2023")).alias("growth")
])

# Multiple computations
result = df.select([
    pl.col("customer_id"),
    pl.col("name"),
    pl.col("sales_2023"),
    pl.col("sales_2024"),
    (pl.col("sales_2024") - pl.col("sales_2023")).alias("growth"),
    ((pl.col("sales_2024") - pl.col("sales_2023")) / pl.col("sales_2023") * 100).alias("growth_pct")
])
```

### String Operations

```python
# SQL: SELECT UPPER(name), LOWER(city)
result = df.select([
    pl.col("name").str.to_uppercase().alias("name_upper"),
    pl.col("city").str.to_lowercase().alias("city_lower"),
    pl.col("name").str.len_chars().alias("name_length")
])

# Concatenation
result = df.select([
    pl.concat_str([pl.col("name"), pl.lit(" - "), pl.col("city")]).alias("full_desc")
])
```

### Conditional Logic (CASE WHEN)

```python
# SQL: SELECT CASE WHEN sales_2024 > 2000 THEN 'High' ELSE 'Normal' END
result = df.select([
    pl.col("customer_id"),
    pl.col("name"),
    pl.when(pl.col("sales_2024") > 2000)
        .then(pl.lit("High"))
        .otherwise(pl.lit("Normal"))
        .alias("sales_tier")
])

# Multiple conditions
result = df.select([
    pl.col("customer_id"),
    pl.col("name"),
    pl.col("sales_2024"),
    pl.when(pl.col("sales_2024") >= 2500).then(pl.lit("Premium"))
        .when(pl.col("sales_2024") >= 2000).then(pl.lit("High"))
        .when(pl.col("sales_2024") >= 1500).then(pl.lit("Medium"))
        .otherwise(pl.lit("Low"))
        .alias("sales_tier")
])
```

---

## Selecting Rows

### Head and Tail

```python
# SQL: SELECT TOP 10 *
result = df.head(10)

# Last N rows
result = df.tail(5)
```

### Slice (Offset and Limit)

```python
# SQL: SELECT * OFFSET 5 ROWS FETCH NEXT 10 ROWS ONLY
result = df.slice(5, 10)  # offset=5, length=10
```

### Sample Rows

```python
# Random sample of N rows
result = df.sample(n=3)

# Random sample of fraction
result = df.sample(fraction=0.5)

# With seed for reproducibility
result = df.sample(n=3, seed=42)
```

---

## Distinct Values

### Unique Rows

```python
# SQL: SELECT DISTINCT city FROM customers
result = df.select("city").unique()

# Unique combinations
result = df.select(["city", "sales_tier"]).unique()

# Count distinct values
count = df.select("city").unique().height
```

### Unique with Aggregation

```python
# SQL: SELECT COUNT(DISTINCT city) FROM customers
result = df.select(pl.col("city").n_unique())
```

---

## Reading from Different Sources

### From SQL Server

```python
import polars as pl

conn_str = "Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=Sales;UID=sa;PWD=pass;"

# Eager read
df = pl.read_database(
    query="SELECT * FROM Customers WHERE IsActive = 1",
    connection=conn_str
)

# Lazy read (recommended for large datasets)
lf = pl.scan_database(
    query="SELECT customer_id, name, city FROM Customers",
    connection=conn_str
)
result = lf.collect()
```

### From CSV Files

```python
# Eager read
df = pl.read_csv("data/customers.csv")

# Lazy read
lf = pl.scan_csv("data/customers.csv")

# With options
df = pl.read_csv(
    "data/customers.csv",
    separator=",",
    has_header=True,
    skip_rows=0,
    n_rows=1000,  # Read only first 1000 rows
    columns=["customer_id", "name", "city"]  # Select columns
)
```

### From Parquet Files

```python
# Parquet is recommended for large datasets
df = pl.read_parquet("data/customers.parquet")

# Lazy scan with predicate pushdown
lf = pl.scan_parquet("data/customers.parquet")
result = lf.filter(pl.col("city") == "Boston").collect()

# Select specific columns only
df = pl.read_parquet(
    "data/customers.parquet",
    columns=["customer_id", "name"]
)
```

### From Excel Files

```python
# Requires openpyxl or xlrd
df = pl.read_excel(
    "data/customers.xlsx",
    sheet_name="Sheet1"
)
```

### From JSON

```python
# JSON Lines format
df = pl.read_ndjson("data/customers.jsonl")

# Standard JSON
df = pl.read_json("data/customers.json")
```

---

## Lazy vs Eager Evaluation

### Eager (Immediate Execution)

```python
# Executes immediately
df = pl.read_csv("data.csv")
result = df.select(["col1", "col2"]).filter(pl.col("col1") > 10)
```

### Lazy (Deferred Execution)

```python
# Builds query plan, optimizes, then executes
lf = pl.scan_csv("data.csv")
result = (
    lf
    .select(["col1", "col2"])
    .filter(pl.col("col1") > 10)
    .collect()  # Executes here
)

# View query plan
print(lf.select(["col1", "col2"]).filter(pl.col("col1") > 10).explain())
```

### Benefits of Lazy Evaluation

| Benefit | Description |
|---------|-------------|
| **Predicate Pushdown** | Filters applied at source (e.g., SQL, Parquet) |
| **Projection Pushdown** | Only reads needed columns |
| **Query Optimization** | Reorders operations for efficiency |
| **Memory Efficiency** | Streams data instead of loading all at once |

---

## Using with_columns for Adding Columns

```python
# Add columns without replacing existing ones
result = df.with_columns([
    (pl.col("sales_2024") - pl.col("sales_2023")).alias("growth"),
    pl.col("name").str.to_uppercase().alias("name_upper")
])

# Original columns are preserved, new columns are added
```

---

## SQL Context Approach

For those more comfortable with SQL:

```python
ctx = pl.SQLContext(customers=df)

result = ctx.execute("""
    SELECT
        customer_id,
        name,
        city,
        sales_2024 - sales_2023 AS growth,
        CASE
            WHEN sales_2024 >= 2500 THEN 'Premium'
            WHEN sales_2024 >= 2000 THEN 'High'
            ELSE 'Normal'
        END AS tier
    FROM customers
    ORDER BY sales_2024 DESC
    LIMIT 10
""").collect()
```

---

## Practical Examples

### Example 1: Customer Report

```python
report = df.select([
    pl.col("customer_id").alias("ID"),
    pl.col("name").alias("Customer"),
    pl.col("city").alias("Location"),
    pl.col("sales_2024").alias("Current Sales"),
    (pl.col("sales_2024") - pl.col("sales_2023")).alias("YoY Growth"),
    ((pl.col("sales_2024") / pl.col("sales_2023") - 1) * 100)
        .round(2)
        .alias("Growth %")
])
```

### Example 2: ETL Data Selection

```python
# Read from source with specific columns
source_df = pl.read_database(
    query="""
        SELECT
            CustomerID,
            CustomerName,
            Email,
            CreatedDate,
            ModifiedDate
        FROM Customers
        WHERE ModifiedDate >= ?
    """,
    connection=conn_str,
    execute_options={"parameters": ["2024-01-01"]}
)

# Transform for destination
target_df = source_df.select([
    pl.col("CustomerID").alias("customer_id"),
    pl.col("CustomerName").alias("full_name"),
    pl.col("Email").str.to_lowercase().alias("email"),
    pl.col("CreatedDate").alias("created_at"),
    pl.col("ModifiedDate").alias("updated_at"),
    pl.lit("active").alias("status")
])
```

---

## Key Takeaways

1. Use `select()` to choose specific columns
2. Use `pl.col()` for column references and expressions
3. Use `alias()` to rename columns in output
4. Use `with_columns()` to add columns while keeping existing ones
5. Use **lazy evaluation** (`scan_*`) for large datasets
6. Pattern matching (`pl.col("^pattern$")`) is powerful for column selection
7. Combine SQL Context with Polars API for flexibility

---

## Related Topics

- [[docs/python/polars/PolarsGuide\|Polars Guide]]
- [[docs/python/polars/SQLContext\|SQL Context Interface]]
- [[docs/python/polars/FilteringData\|Filtering DataFrames]]
- [[docs/python/polars/TransformingData\|Data Transformations]]

---

## Sources

- [Polars Expressions Documentation](https://docs.pola.rs/user-guide/expressions/)
- [Polars Select Context](https://docs.pola.rs/user-guide/expressions/contexts/#select)

---

#polars #python #select #columns #reading #dataframe
