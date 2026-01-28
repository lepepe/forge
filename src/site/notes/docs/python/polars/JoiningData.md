---
{"dg-publish":true,"permalink":"/docs/python/polars/joining-data/","tags":["polars","join","merge","combining-data","sql"]}
---

# Joining DataFrames

## Overview

Joining DataFrames in Polars is similar to SQL JOINs. This guide covers all join types using **both the Polars API and the SQL Interface**, making it easy for SQL Server developers to choose their preferred approach.

---

## Two Ways to Join in Polars

| Approach | Method | Best For |
|----------|--------|----------|
| **Polars API** | `df1.join(df2, on="key", how="inner")` | Programmatic, chainable operations |
| **SQL Interface** | `ctx.execute("SELECT ... FROM t1 JOIN t2 ON ...")` | Familiar SQL syntax |

> **Note:** For joins, use `SQLContext` to register multiple DataFrames, then use `ctx.execute()`.

---

## SQL to Polars Mapping

| SQL Server | Polars API | SQL Interface |
|------------|------------|---------------|
| `INNER JOIN` | `how="inner"` | `INNER JOIN ... ON` |
| `LEFT JOIN` | `how="left"` | `LEFT JOIN ... ON` |
| `RIGHT JOIN` | `how="right"` | `RIGHT JOIN ... ON` |
| `FULL OUTER JOIN` | `how="full"` | `FULL JOIN ... ON` |
| `CROSS JOIN` | `how="cross"` | `CROSS JOIN` |
| `NOT IN` / `NOT EXISTS` | `how="anti"` | Subquery with `NOT IN` |
| `EXISTS` | `how="semi"` | Subquery with `EXISTS` |

---

## Sample Data

```python
import polars as pl

# Customers table
customers = pl.DataFrame({
    "customer_id": [1, 2, 3, 4, 5],
    "name": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
    "city": ["NYC", "Boston", "Chicago", "Boston", "Seattle"]
})

# Orders table
orders = pl.DataFrame({
    "order_id": [101, 102, 103, 104, 105, 106],
    "customer_id": [1, 2, 1, 3, 2, 6],  # Note: customer_id 6 doesn't exist
    "amount": [150.00, 200.00, 75.50, 300.00, 125.00, 50.00]
})

# Products table
products = pl.DataFrame({
    "product_id": [1, 2, 3],
    "product_name": ["Widget", "Gadget", "Gizmo"],
    "price": [29.99, 49.99, 19.99]
})

# Order items table
order_items = pl.DataFrame({
    "order_id": [101, 101, 102, 103, 104, 105],
    "product_id": [1, 2, 1, 3, 2, 1],
    "quantity": [2, 1, 3, 1, 2, 5]
})

# Create SQL Context for all examples
ctx = pl.SQLContext(
    customers=customers,
    orders=orders,
    products=products,
    order_items=order_items
)
```

---

## INNER JOIN

Returns only rows with matching keys in both DataFrames.

**Polars API:**
```python
result = customers.join(
    orders,
    on="customer_id",
    how="inner"
)

print(result)
# shape: (5, 5)
# ┌─────────────┬─────────┬────────┬──────────┬────────┐
# │ customer_id │ name    │ city   │ order_id │ amount │
# ╞═════════════╪═════════╪════════╪══════════╪════════╡
# │ 1           │ Alice   │ NYC    │ 101      │ 150.0  │
# │ 1           │ Alice   │ NYC    │ 103      │ 75.5   │
# │ 2           │ Bob     │ Boston │ 102      │ 200.0  │
# │ 2           │ Bob     │ Boston │ 105      │ 125.0  │
# │ 3           │ Charlie │ Chicago│ 104      │ 300.0  │
# └─────────────┴─────────┴────────┴──────────┴────────┘
```

**SQL Interface:**
```python
result = ctx.execute("""
    SELECT c.customer_id, c.name, c.city, o.order_id, o.amount
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
""").collect()
```

---

## LEFT JOIN

Returns all rows from the left DataFrame, with matching rows from the right.

**Polars API:**
```python
result = customers.join(
    orders,
    on="customer_id",
    how="left"
)
# Diana and Eve appear with null order_id and amount
```

**SQL Interface:**
```python
result = ctx.execute("""
    SELECT c.customer_id, c.name, c.city, o.order_id, o.amount
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
""").collect()
```

### Handling NULL Values After Left Join

**Polars API:**
```python
result = customers.join(orders, on="customer_id", how="left").with_columns([
    pl.col("amount").fill_null(0).alias("amount"),
    pl.col("order_id").fill_null(-1).alias("order_id")
])
```

**SQL Interface:**
```python
result = ctx.execute("""
    SELECT
        c.customer_id,
        c.name,
        c.city,
        COALESCE(o.order_id, -1) as order_id,
        COALESCE(o.amount, 0) as amount
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
""").collect()
```

---

## RIGHT JOIN

Returns all rows from the right DataFrame, with matching rows from the left.

**Polars API:**
```python
result = customers.join(
    orders,
    on="customer_id",
    how="right"
)
# Order 106 (customer_id=6) appears with null name and city
```

**SQL Interface:**
```python
result = ctx.execute("""
    SELECT c.name, c.city, o.order_id, o.customer_id, o.amount
    FROM customers c
    RIGHT JOIN orders o ON c.customer_id = o.customer_id
""").collect()
```

---

## FULL OUTER JOIN

Returns all rows from both DataFrames, with NULL where there's no match.

**Polars API:**
```python
result = customers.join(
    orders,
    on="customer_id",
    how="full",
    coalesce=True  # Coalesce join keys
)
```

**SQL Interface:**
```python
result = ctx.execute("""
    SELECT
        COALESCE(c.customer_id, o.customer_id) as customer_id,
        c.name,
        c.city,
        o.order_id,
        o.amount
    FROM customers c
    FULL JOIN orders o ON c.customer_id = o.customer_id
""").collect()
```

---

## CROSS JOIN

Returns the Cartesian product of both DataFrames.

**Polars API:**
```python
result = customers.join(
    products,
    how="cross"
)
# Returns 5 customers × 3 products = 15 rows
```

**SQL Interface:**
```python
result = ctx.execute("""
    SELECT c.name, p.product_name, p.price
    FROM customers c
    CROSS JOIN products p
""").collect()
```

---

## ANTI JOIN (NOT IN / NOT EXISTS)

Returns rows from the left DataFrame that have **no match** in the right.

**Polars API:**
```python
# Find customers without orders
customers_without_orders = customers.join(
    orders,
    on="customer_id",
    how="anti"
)
# Returns Diana and Eve (customer_ids 4 and 5)
```

**SQL Interface:**
```python
# Using NOT IN
result = ctx.execute("""
    SELECT * FROM customers
    WHERE customer_id NOT IN (SELECT DISTINCT customer_id FROM orders)
""").collect()

# Using NOT EXISTS
result = ctx.execute("""
    SELECT * FROM customers c
    WHERE NOT EXISTS (
        SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id
    )
""").collect()
```

### Common Use Cases for Anti Join

**Polars API:**
```python
# Find new records to insert (not in destination)
new_records = source_df.join(destination_df, on="id", how="anti")

# Find deleted records (in destination but not in source)
deleted_records = destination_df.join(source_df, on="id", how="anti")
```

**SQL Interface:**
```python
# Find new records to insert
ctx = pl.SQLContext(source=source_df, destination=destination_df)

new_records = ctx.execute("""
    SELECT * FROM source
    WHERE id NOT IN (SELECT id FROM destination)
""").collect()

# Find deleted records
deleted_records = ctx.execute("""
    SELECT * FROM destination
    WHERE id NOT IN (SELECT id FROM source)
""").collect()
```

---

## SEMI JOIN (EXISTS)

Returns rows from the left DataFrame that **have a match** in the right, but without the right's columns.

**Polars API:**
```python
# Find customers with orders
customers_with_orders = customers.join(
    orders,
    on="customer_id",
    how="semi"
)
# Returns customers 1, 2, 3 (those with orders)
# Only customer columns, no order columns
```

**SQL Interface:**
```python
# Using EXISTS
result = ctx.execute("""
    SELECT * FROM customers c
    WHERE EXISTS (
        SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id
    )
""").collect()

# Using IN
result = ctx.execute("""
    SELECT * FROM customers
    WHERE customer_id IN (SELECT DISTINCT customer_id FROM orders)
""").collect()
```

---

## Joining on Multiple Columns

**Polars API:**
```python
df1 = pl.DataFrame({
    "year": [2023, 2023, 2024],
    "month": [1, 2, 1],
    "sales": [100, 200, 150]
})

df2 = pl.DataFrame({
    "year": [2023, 2023, 2024],
    "month": [1, 2, 1],
    "target": [120, 180, 160]
})

result = df1.join(
    df2,
    on=["year", "month"],
    how="inner"
)
```

**SQL Interface:**
```python
ctx = pl.SQLContext(sales=df1, targets=df2)

result = ctx.execute("""
    SELECT s.*, t.target
    FROM sales s
    INNER JOIN targets t ON s.year = t.year AND s.month = t.month
""").collect()
```

---

## Joining with Different Column Names

**Polars API:**
```python
df_left = pl.DataFrame({
    "id": [1, 2, 3],
    "name": ["A", "B", "C"]
})

df_right = pl.DataFrame({
    "customer_id": [1, 2, 4],
    "value": [100, 200, 400]
})

result = df_left.join(
    df_right,
    left_on="id",
    right_on="customer_id",
    how="inner"
)
```

**SQL Interface:**
```python
ctx = pl.SQLContext(left_table=df_left, right_table=df_right)

result = ctx.execute("""
    SELECT l.*, r.value
    FROM left_table l
    INNER JOIN right_table r ON l.id = r.customer_id
""").collect()
```

---

## Handling Duplicate Column Names

### Suffix Strategy (Polars API)

```python
df1 = pl.DataFrame({"id": [1, 2], "name": ["A", "B"]})
df2 = pl.DataFrame({"id": [1, 2], "name": ["X", "Y"]})

result = df1.join(
    df2,
    on="id",
    suffix="_right"  # Default is "_right"
)

print(result.columns)
# ['id', 'name', 'name_right']
```

### SQL Interface (Use Aliases)

```python
ctx = pl.SQLContext(t1=df1, t2=df2)

result = ctx.execute("""
    SELECT
        t1.id,
        t1.name as name_left,
        t2.name as name_right
    FROM t1
    INNER JOIN t2 ON t1.id = t2.id
""").collect()
```

---

## Multiple Joins (Chaining)

**Polars API:**
```python
result = (
    customers
    .join(orders, on="customer_id")
    .join(order_items, on="order_id")
    .join(products, on="product_id")
    .select([
        "name",
        "order_id",
        "quantity",
        "product_name",
        (pl.col("quantity") * pl.col("price")).alias("line_total")
    ])
)
```

**SQL Interface:**
```python
result = ctx.execute("""
    SELECT
        c.name,
        o.order_id,
        oi.quantity,
        p.product_name,
        oi.quantity * p.price as line_total
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    INNER JOIN products p ON oi.product_id = p.product_id
    ORDER BY c.name, o.order_id
""").collect()
```

---

## Common Table Expressions (CTEs)

**SQL Interface:**
```python
result = ctx.execute("""
    WITH customer_totals AS (
        SELECT
            customer_id,
            SUM(amount) as total_spent,
            COUNT(*) as order_count
        FROM orders
        GROUP BY customer_id
    )
    SELECT
        c.name,
        c.city,
        ct.total_spent,
        ct.order_count
    FROM customers c
    INNER JOIN customer_totals ct ON c.customer_id = ct.customer_id
    WHERE ct.total_spent > 100
    ORDER BY ct.total_spent DESC
""").collect()
```

**Polars API Equivalent:**
```python
customer_totals = (
    orders
    .group_by("customer_id")
    .agg([
        pl.col("amount").sum().alias("total_spent"),
        pl.count().alias("order_count")
    ])
)

result = (
    customers
    .join(customer_totals, on="customer_id")
    .filter(pl.col("total_spent") > 100)
    .select(["name", "city", "total_spent", "order_count"])
    .sort("total_spent", descending=True)
)
```

---

## Aggregations with Joins

**SQL Interface:**
```python
result = ctx.execute("""
    SELECT
        c.name,
        c.city,
        COUNT(o.order_id) as order_count,
        SUM(o.amount) as total_amount,
        AVG(o.amount) as avg_amount
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id, c.name, c.city
    HAVING COUNT(o.order_id) > 0
    ORDER BY total_amount DESC
""").collect()
```

**Polars API Equivalent:**
```python
result = (
    customers
    .join(orders, on="customer_id", how="left")
    .group_by(["customer_id", "name", "city"])
    .agg([
        pl.col("order_id").count().alias("order_count"),
        pl.col("amount").sum().alias("total_amount"),
        pl.col("amount").mean().alias("avg_amount")
    ])
    .filter(pl.col("order_count") > 0)
    .sort("total_amount", descending=True)
)
```

---

## Self Joins

**SQL Interface:**
```python
# Find customers in the same city
result = ctx.execute("""
    SELECT
        c1.name as customer1,
        c2.name as customer2,
        c1.city
    FROM customers c1
    INNER JOIN customers c2 ON c1.city = c2.city AND c1.customer_id < c2.customer_id
""").collect()
```

**Polars API Equivalent:**
```python
result = (
    customers.select([
        pl.col("customer_id").alias("id1"),
        pl.col("name").alias("customer1"),
        pl.col("city")
    ])
    .join(
        customers.select([
            pl.col("customer_id").alias("id2"),
            pl.col("name").alias("customer2"),
            pl.col("city")
        ]),
        on="city"
    )
    .filter(pl.col("id1") < pl.col("id2"))
    .select(["customer1", "customer2", "city"])
)
```

---

## Join Strategies (Polars API)

### join_nulls Parameter

```python
# By default, NULL keys don't match
result = df1.join(df2, on="key", how="inner", join_nulls=False)

# Match NULL values as equal
result = df1.join(df2, on="key", how="inner", join_nulls=True)
```

---

## Asof Join (Time-Series Data)

For joining on nearest match (useful for time-series data). Not available in SQL interface.

**Polars API:**
```python
prices = pl.DataFrame({
    "time": [1, 3, 5, 7],
    "price": [100, 102, 101, 103]
})

trades = pl.DataFrame({
    "time": [2, 4, 6],
    "quantity": [10, 20, 15]
})

# Get price at or before each trade time
result = trades.join_asof(
    prices,
    on="time",
    strategy="backward"  # Get most recent price
)

# time=2 gets price=100 (from time=1)
# time=4 gets price=102 (from time=3)
# time=6 gets price=101 (from time=5)
```

### Asof Join Strategies

| Strategy | Description |
|----------|-------------|
| `backward` | Use value from most recent prior row |
| `forward` | Use value from next row |
| `nearest` | Use value from closest row |

---

## ETL Join Patterns

### Lookup/Dimension Join

**Polars API:**
```python
fact_sales = pl.DataFrame({
    "date_key": [20240101, 20240102],
    "product_key": [1, 2],
    "quantity": [10, 20],
    "amount": [100.0, 400.0]
})

dim_product = pl.DataFrame({
    "product_key": [1, 2, 3],
    "product_name": ["Widget", "Gadget", "Gizmo"],
    "category": ["Electronics", "Electronics", "Tools"]
})

enriched = fact_sales.join(dim_product, on="product_key", how="left")
```

**SQL Interface:**
```python
ctx = pl.SQLContext(fact_sales=fact_sales, dim_product=dim_product)

enriched = ctx.execute("""
    SELECT f.*, d.product_name, d.category
    FROM fact_sales f
    LEFT JOIN dim_product d ON f.product_key = d.product_key
""").collect()
```

### Change Detection (Delta)

**Polars API:**
```python
source = pl.DataFrame({
    "id": [1, 2, 3, 4],
    "value": ["A", "B_new", "C", "D"],
    "hash": ["h1", "h2_new", "h3", "h4"]
})

target = pl.DataFrame({
    "id": [1, 2, 3],
    "value": ["A", "B", "C"],
    "hash": ["h1", "h2", "h3"]
})

# New records (in source, not in target)
inserts = source.join(target.select("id"), on="id", how="anti")

# Changed records (in both, but hash different)
updates = (
    source
    .join(target.select(["id", pl.col("hash").alias("target_hash")]), on="id")
    .filter(pl.col("hash") != pl.col("target_hash"))
)

# Deleted records (in target, not in source)
deletes = target.join(source.select("id"), on="id", how="anti")
```

**SQL Interface:**
```python
ctx = pl.SQLContext(source=source, target=target)

# New records
inserts = ctx.execute("""
    SELECT * FROM source
    WHERE id NOT IN (SELECT id FROM target)
""").collect()

# Changed records
updates = ctx.execute("""
    SELECT s.*
    FROM source s
    INNER JOIN target t ON s.id = t.id
    WHERE s.hash <> t.hash
""").collect()

# Deleted records
deletes = ctx.execute("""
    SELECT * FROM target
    WHERE id NOT IN (SELECT id FROM source)
""").collect()
```

---

## Performance Tips

### 1. Use Lazy Evaluation

**Polars API:**
```python
result = (
    customers.lazy()
    .join(orders.lazy(), on="customer_id")
    .filter(pl.col("amount") > 100)
    .select(["name", "amount"])
    .collect()
)
```

**SQL Interface with LazyFrames:**
```python
ctx = pl.SQLContext(
    customers=customers.lazy(),
    orders=orders.lazy()
)

result = ctx.execute("""
    SELECT c.name, o.amount
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.amount > 100
""").collect()
```

### 2. Filter Before Joining

**Polars API:**
```python
# Good - filter first, then join
result = (
    customers.filter(pl.col("city") == "NYC")
    .join(orders, on="customer_id")
)
```

**SQL Interface:**
```python
# Good - filter in subquery or use CTE
result = ctx.execute("""
    WITH nyc_customers AS (
        SELECT * FROM customers WHERE city = 'NYC'
    )
    SELECT nc.*, o.order_id, o.amount
    FROM nyc_customers nc
    INNER JOIN orders o ON nc.customer_id = o.customer_id
""").collect()
```

### 3. Select Only Needed Columns

**Polars API:**
```python
result = (
    customers.select(["customer_id", "name"])
    .join(
        orders.select(["customer_id", "amount"]),
        on="customer_id"
    )
)
```

**SQL Interface:**
```python
# Naturally done in SELECT clause
result = ctx.execute("""
    SELECT c.name, o.amount
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
""").collect()
```

---

## Quick Reference: Join Types

| Join Type | Polars API | SQL Interface | Use Case |
|-----------|------------|---------------|----------|
| Inner | `how="inner"` | `INNER JOIN` | Matching records only |
| Left | `how="left"` | `LEFT JOIN` | All left + matching right |
| Right | `how="right"` | `RIGHT JOIN` | All right + matching left |
| Full | `how="full"` | `FULL JOIN` | All records from both |
| Cross | `how="cross"` | `CROSS JOIN` | Cartesian product |
| Anti | `how="anti"` | `NOT IN` / `NOT EXISTS` | Left without match |
| Semi | `how="semi"` | `EXISTS` / `IN` | Left with match (no cols) |

---

## Key Takeaways

1. **Two approaches**: Polars API for chaining, SQL Interface for familiar syntax
2. Use **SQLContext** to register DataFrames for SQL queries
3. **Anti join** = `NOT IN` / `NOT EXISTS` in SQL
4. **Semi join** = `EXISTS` / `IN` in SQL (returns left columns only)
5. Use **CTEs** in SQL for complex multi-step joins
6. Use **aliases** in SQL to handle duplicate column names
7. **Filter before joining** for better performance
8. Use **lazy evaluation** for optimized query plans
9. **Asof join** (Polars API only) is perfect for time-series lookups

---

## Related Topics

- [[docs/python/polars/PolarsGuide\|Polars Guide]]
- [[docs/python/polars/SQLContext\|SQL Context Interface]]
- [[docs/python/polars/FilteringData\|Filtering DataFrames]]
- [[docs/python/polars/TransformingData\|Data Transformations]]

---

## Sources

- [Polars SQL Interface](https://docs.pola.rs/api/python/stable/reference/sql/index.html)
- [Polars Join Documentation](https://docs.pola.rs/user-guide/expressions/joins/)
- [Polars Join API Reference](https://docs.pola.rs/py-polars/html/reference/dataframe/api/polars.DataFrame.join.html)

---

#polars #python #join #merge #combining-data #sql #dataframe
