---
{"dg-publish":true,"permalink":"/docs/python/polars/polars-guide/","tags":["polars","python","dataframe","etl","introduction"]}
---

# Polars Guide for SQL Developers

## Introduction

Polars is a high-performance DataFrame library written in Rust with Python bindings. It's designed as a faster, more memory-efficient alternative to pandas, making it ideal for ETL processes in Apache Airflow.

For SQL Server developers, Polars provides a familiar SQL-like interface while offering significant performance benefits through lazy evaluation and parallel execution.

---

## Why Polars for ETL?

| Feature | Benefit |
|---------|---------|
| **Lazy Evaluation** | Optimizes query plans before execution |
| **Parallel Execution** | Automatically uses all CPU cores |
| **Memory Efficient** | Uses Apache Arrow columnar format |
| **SQL Interface** | Familiar syntax for SQL developers |
| **Streaming** | Handles datasets larger than RAM |

---

## Installation

```bash
# Basic installation
pip install polars

# With SQL Server support (via ODBC)
pip install polars pyodbc

# For Airflow integration
pip install apache-airflow polars pyodbc
```

---

## Quick Comparison: SQL vs Polars

### SQL Server Query

```sql
SELECT
    customer_id,
    customer_name,
    SUM(order_total) as total_spent
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY customer_id, customer_name
HAVING SUM(order_total) > 1000
ORDER BY total_spent DESC
```

### Polars Equivalent

```python
import polars as pl

result = (
    df
    .filter(pl.col("order_date") >= "2024-01-01")
    .group_by(["customer_id", "customer_name"])
    .agg(pl.col("order_total").sum().alias("total_spent"))
    .filter(pl.col("total_spent") > 1000)
    .sort("total_spent", descending=True)
)
```

### Polars SQL Context (Native SQL)

```python
import polars as pl

ctx = pl.SQLContext(orders=df)
result = ctx.execute("""
    SELECT
        customer_id,
        customer_name,
        SUM(order_total) as total_spent
    FROM orders
    WHERE order_date >= '2024-01-01'
    GROUP BY customer_id, customer_name
    HAVING SUM(order_total) > 1000
    ORDER BY total_spent DESC
""").collect()
```

---

## Core Concepts

### Eager vs Lazy Execution

| Mode | Description | When to Use |
|------|-------------|-------------|
| **Eager** | Executes immediately | Small datasets, debugging |
| **Lazy** | Builds query plan, executes on `.collect()` | Large datasets, production ETL |

```python
# Eager - executes immediately
df = pl.DataFrame({"a": [1, 2, 3]})
result = df.filter(pl.col("a") > 1)

# Lazy - builds plan, optimizes, then executes
lf = pl.LazyFrame({"a": [1, 2, 3]})
result = lf.filter(pl.col("a") > 1).collect()
```

### Expressions

Expressions are the building blocks of Polars operations:

```python
# Column reference
pl.col("column_name")

# Literal value
pl.lit(100)

# All columns
pl.all()

# Multiple columns
pl.cols(["col1", "col2"])

# Columns by pattern
pl.col("^sales_.*$")  # Regex pattern
```

---

## Documentation Topics

### Getting Started
- [[docs/python/polars/SQLServerConnection\|Connecting to SQL Server]]
- [[docs/python/polars/SQLContext\|SQL Context Interface]]

### Data Operations
- [[docs/python/polars/SelectingData\|Selecting and Reading Data]]
- [[docs/python/polars/FilteringData\|Filtering DataFrames]]
- [[docs/python/polars/JoiningData\|Joining DataFrames]]
- [[docs/python/polars/TransformingData\|Data Transformations]]

### Writing Data
- [[docs/python/polars/WritingToSQLServer\|INSERT, UPDATE, DELETE Operations]]

### ETL Patterns
- [[docs/python/polars/AirflowETL\|ETL with Apache Airflow]]
- [[docs/python/polars/ETLPatterns\|Common ETL Patterns]]

---

## Best Practices for ETL

1. **Use Lazy Evaluation** for large datasets to benefit from query optimization
2. **Leverage SQL Context** when queries are complex or team is more SQL-familiar
3. **Stream Large Files** using `scan_*` functions instead of `read_*`
4. **Batch Write Operations** to SQL Server for better performance
5. **Use Connection Pooling** in Airflow for database connections

---

## Key Takeaways

1. Polars offers both **DataFrame API** and **SQL Context** for flexibility
2. **Lazy evaluation** optimizes queries before execution
3. Native **parallel processing** without additional configuration
4. **SQL-like syntax** makes transition easy for SQL Server developers
5. Excellent for **ETL pipelines** in Apache Airflow

---

## Related Topics

- [[docs/python/polars/SQLServerConnection\|Connecting to SQL Server]]
- [[docs/python/polars/SQLContext\|SQL Context Interface]]
- [[docs/python/polars/AirflowETL\|ETL with Apache Airflow]]

---

## Sources

- [Polars Official Documentation](https://pola.rs/)
- [Polars Python API Reference](https://docs.pola.rs/py-polars/html/reference/)
- [Polars SQL Context](https://docs.pola.rs/user-guide/sql/intro/)

---

#polars #python #dataframe #etl #sql #introduction
