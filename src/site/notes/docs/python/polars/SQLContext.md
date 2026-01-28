---
{"dg-publish":true,"permalink":"/docs/python/polars/sql-context/","tags":["polars","sql","sql-context","query"]}
---

# SQL Context Interface

## Overview

Polars provides a **SQLContext** that allows you to write SQL queries directly against DataFrames. This is particularly useful for teams familiar with SQL Server, as it provides a familiar syntax while leveraging Polars' performance benefits.

---

## Creating a SQL Context

### Basic Setup

```python
import polars as pl

# Create DataFrames
customers = pl.DataFrame({
    "customer_id": [1, 2, 3, 4],
    "name": ["Alice", "Bob", "Charlie", "Diana"],
    "city": ["New York", "Boston", "Chicago", "Boston"]
})

orders = pl.DataFrame({
    "order_id": [101, 102, 103, 104, 105],
    "customer_id": [1, 2, 1, 3, 2],
    "amount": [150.00, 200.00, 75.50, 300.00, 125.00]
})

# Create SQL Context and register tables
ctx = pl.SQLContext(
    customers=customers,
    orders=orders
)
```

### Registering Tables Dynamically

```python
ctx = pl.SQLContext()

# Register individual tables
ctx.register("customers", customers)
ctx.register("orders", orders)

# Register multiple at once
ctx.register_many({
    "products": products_df,
    "categories": categories_df
})
```

### Using LazyFrames (Recommended)

```python
# LazyFrames enable query optimization
customers_lf = customers.lazy()
orders_lf = orders.lazy()

ctx = pl.SQLContext(
    customers=customers_lf,
    orders=orders_lf,
    eager=False  # Return LazyFrame
)

# Query returns LazyFrame - call .collect() to execute
result = ctx.execute("SELECT * FROM customers").collect()
```

---

## Executing SQL Queries

### Basic SELECT

```python
result = ctx.execute("""
    SELECT customer_id, name, city
    FROM customers
    WHERE city = 'Boston'
""").collect()

print(result)
# shape: (2, 3)
# ┌─────────────┬───────┬────────┐
# │ customer_id │ name  │ city   │
# │ ---         │ ---   │ ---    │
# │ i64         │ str   │ str    │
# ╞═════════════╪═══════╪════════╡
# │ 2           │ Bob   │ Boston │
# │ 4           │ Diana │ Boston │
# └─────────────┴───────┴────────┘
```

### SELECT with Expressions

```python
result = ctx.execute("""
    SELECT
        customer_id,
        name,
        UPPER(city) as city_upper,
        LENGTH(name) as name_length
    FROM customers
""").collect()
```

---

## SQL Features Comparison

### Supported SQL Features

| Feature | SQL Server Syntax | Polars SQLContext |
|---------|------------------|-------------------|
| SELECT | `SELECT col1, col2` | Supported |
| WHERE | `WHERE col > 10` | Supported |
| GROUP BY | `GROUP BY col` | Supported |
| HAVING | `HAVING COUNT(*) > 1` | Supported |
| ORDER BY | `ORDER BY col DESC` | Supported |
| LIMIT/TOP | `TOP 10` / `LIMIT 10` | Use `LIMIT` |
| JOIN | `INNER JOIN`, `LEFT JOIN` | Supported |
| UNION | `UNION ALL` | Supported |
| Subqueries | `(SELECT ...)` | Supported |
| CTEs | `WITH cte AS (...)` | Supported |
| CASE | `CASE WHEN ... END` | Supported |
| Window Functions | `ROW_NUMBER() OVER()` | Supported |

### Differences from SQL Server

| SQL Server | Polars SQLContext | Notes |
|------------|-------------------|-------|
| `TOP 10` | `LIMIT 10` | Use ANSI syntax |
| `ISNULL(col, val)` | `COALESCE(col, val)` | Standard SQL |
| `GETDATE()` | Not available | Use Polars expressions |
| `CONVERT()` | `CAST()` | Standard SQL |
| `LEN()` | `LENGTH()` | Standard SQL |
| `CHARINDEX()` | `POSITION()` | Standard SQL |

---

## Common Query Patterns

### Filtering (WHERE)

```python
# Simple filter
result = ctx.execute("""
    SELECT * FROM orders WHERE amount > 100
""").collect()

# Multiple conditions
result = ctx.execute("""
    SELECT * FROM customers
    WHERE city IN ('Boston', 'Chicago')
    AND customer_id > 1
""").collect()

# BETWEEN
result = ctx.execute("""
    SELECT * FROM orders
    WHERE amount BETWEEN 100 AND 200
""").collect()

# LIKE pattern matching
result = ctx.execute("""
    SELECT * FROM customers
    WHERE name LIKE 'A%'
""").collect()
```

### Aggregations (GROUP BY)

```python
result = ctx.execute("""
    SELECT
        customer_id,
        COUNT(*) as order_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        MIN(amount) as min_amount,
        MAX(amount) as max_amount
    FROM orders
    GROUP BY customer_id
""").collect()
```

### HAVING Clause

```python
result = ctx.execute("""
    SELECT
        customer_id,
        COUNT(*) as order_count,
        SUM(amount) as total_amount
    FROM orders
    GROUP BY customer_id
    HAVING SUM(amount) > 200
""").collect()
```

### Sorting (ORDER BY)

```python
result = ctx.execute("""
    SELECT * FROM orders
    ORDER BY amount DESC, customer_id ASC
""").collect()

# With LIMIT
result = ctx.execute("""
    SELECT * FROM orders
    ORDER BY amount DESC
    LIMIT 3
""").collect()
```

---

## Joins

### INNER JOIN

```python
result = ctx.execute("""
    SELECT
        c.customer_id,
        c.name,
        o.order_id,
        o.amount
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
""").collect()
```

### LEFT JOIN

```python
result = ctx.execute("""
    SELECT
        c.customer_id,
        c.name,
        COALESCE(SUM(o.amount), 0) as total_spent
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id, c.name
""").collect()
```

### Multiple Joins

```python
# Register additional table
products = pl.DataFrame({
    "product_id": [1, 2, 3],
    "product_name": ["Widget", "Gadget", "Gizmo"],
    "price": [29.99, 49.99, 19.99]
})

order_items = pl.DataFrame({
    "order_id": [101, 101, 102, 103],
    "product_id": [1, 2, 1, 3],
    "quantity": [2, 1, 3, 1]
})

ctx.register("products", products)
ctx.register("order_items", order_items)

result = ctx.execute("""
    SELECT
        c.name as customer_name,
        p.product_name,
        oi.quantity,
        p.price * oi.quantity as line_total
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    INNER JOIN products p ON oi.product_id = p.product_id
""").collect()
```

---

## Common Table Expressions (CTEs)

```python
result = ctx.execute("""
    WITH customer_totals AS (
        SELECT
            customer_id,
            SUM(amount) as total_spent
        FROM orders
        GROUP BY customer_id
    ),
    high_value AS (
        SELECT customer_id
        FROM customer_totals
        WHERE total_spent > 200
    )
    SELECT
        c.name,
        ct.total_spent
    FROM customers c
    INNER JOIN customer_totals ct ON c.customer_id = ct.customer_id
    WHERE c.customer_id IN (SELECT customer_id FROM high_value)
""").collect()
```

---

## Window Functions

```python
result = ctx.execute("""
    SELECT
        customer_id,
        order_id,
        amount,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) as rank,
        SUM(amount) OVER (PARTITION BY customer_id) as customer_total,
        AVG(amount) OVER () as overall_avg
    FROM orders
""").collect()
```

### Supported Window Functions

| Function | Description |
|----------|-------------|
| `ROW_NUMBER()` | Sequential row number |
| `RANK()` | Rank with gaps |
| `DENSE_RANK()` | Rank without gaps |
| `LAG(col, n)` | Value from n rows before |
| `LEAD(col, n)` | Value from n rows after |
| `FIRST_VALUE(col)` | First value in partition |
| `LAST_VALUE(col)` | Last value in partition |
| `SUM() OVER()` | Running/window sum |
| `AVG() OVER()` | Running/window average |
| `COUNT() OVER()` | Running/window count |

---

## CASE Expressions

```python
result = ctx.execute("""
    SELECT
        customer_id,
        amount,
        CASE
            WHEN amount >= 200 THEN 'High'
            WHEN amount >= 100 THEN 'Medium'
            ELSE 'Low'
        END as order_tier
    FROM orders
""").collect()
```

---

## Subqueries

```python
# Subquery in WHERE
result = ctx.execute("""
    SELECT * FROM customers
    WHERE customer_id IN (
        SELECT DISTINCT customer_id
        FROM orders
        WHERE amount > 150
    )
""").collect()

# Subquery in FROM (Derived Table)
result = ctx.execute("""
    SELECT
        customer_id,
        avg_amount
    FROM (
        SELECT
            customer_id,
            AVG(amount) as avg_amount
        FROM orders
        GROUP BY customer_id
    ) as customer_averages
    WHERE avg_amount > 100
""").collect()
```

---

## UNION Operations

```python
# Combine results from multiple queries
result = ctx.execute("""
    SELECT customer_id, name, 'Active' as status
    FROM customers
    WHERE customer_id IN (SELECT DISTINCT customer_id FROM orders)

    UNION ALL

    SELECT customer_id, name, 'Inactive' as status
    FROM customers
    WHERE customer_id NOT IN (SELECT DISTINCT customer_id FROM orders)
""").collect()
```

---

## Mixing SQL and Polars API

You can combine SQL queries with Polars expressions:

```python
# Start with SQL
result = ctx.execute("""
    SELECT customer_id, name, city
    FROM customers
    WHERE city = 'Boston'
""").collect()

# Continue with Polars API
final = (
    result
    .with_columns(
        pl.col("name").str.to_uppercase().alias("name_upper")
    )
    .sort("customer_id")
)
```

---

## Performance Tips

### 1. Use LazyFrames

```python
# Better performance with lazy evaluation
ctx = pl.SQLContext(
    customers=customers.lazy(),
    orders=orders.lazy(),
    eager=False
)

# Query plan is optimized before execution
result = ctx.execute("...").collect()
```

### 2. Select Only Needed Columns

```python
# Good - select specific columns
result = ctx.execute("SELECT customer_id, name FROM customers")

# Avoid - selecting all columns when not needed
result = ctx.execute("SELECT * FROM customers")
```

### 3. Push Filters Early

```python
# Filters in subqueries reduce data early
result = ctx.execute("""
    SELECT c.name, o.total
    FROM customers c
    INNER JOIN (
        SELECT customer_id, SUM(amount) as total
        FROM orders
        WHERE amount > 50  -- Filter early
        GROUP BY customer_id
    ) o ON c.customer_id = o.customer_id
""")
```

---

## Key Takeaways

1. **SQLContext** provides familiar SQL syntax for Polars DataFrames
2. Use **ANSI SQL** syntax (LIMIT instead of TOP)
3. Register tables using **LazyFrames** for query optimization
4. **CTEs and Window Functions** are fully supported
5. **Mix SQL and Polars API** for maximum flexibility
6. Use **parameterized queries** in production for security

---

## Related Topics

- [[docs/python/polars/PolarsGuide\|Polars Guide]]
- [[docs/python/polars/SQLServerConnection\|Connecting to SQL Server]]
- [[docs/python/polars/FilteringData\|Filtering DataFrames]]
- [[docs/python/polars/JoiningData\|Joining DataFrames]]

---

## Sources

- [Polars SQL Context Documentation](https://docs.pola.rs/user-guide/sql/intro/)
- [Polars SQL API Reference](https://docs.pola.rs/py-polars/html/reference/sql.html)

---

#polars #python #sql #sql-context #query #dataframe
