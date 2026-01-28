---
{"dg-publish":true,"permalink":"/docs/python/polars/filtering-data/","tags":["polars","filter","where","conditions","sql"]}
---

# Filtering DataFrames

## Overview

Filtering in Polars corresponds to the `WHERE` clause in SQL. This guide covers all filtering techniques using **both the Polars API and the SQL Interface**, making it easy for SQL Server developers to choose their preferred approach.

---

## Two Ways to Filter in Polars

Polars offers two approaches to filter data:

| Approach | Method | Best For |
|----------|--------|----------|
| **Polars API** | `df.filter(pl.col("x") > 10)` | Programmatic, chainable operations |
| **SQL Interface** | `df.sql("SELECT * FROM self WHERE x > 10")` | Familiar SQL syntax |

> **Note:** In the SQL interface, use `self` to reference the current DataFrame.

---

## Sample Data

```python
import polars as pl
from datetime import date

df = pl.DataFrame({
    "customer_id": [1, 2, 3, 4, 5, 6],
    "name": ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"],
    "city": ["NYC", "Boston", "Chicago", "Boston", "NYC", None],
    "status": ["active", "active", "inactive", "active", "pending", "active"],
    "sales": [1500, 2300, 1800, None, 1950, 2100],
    "signup_date": [
        date(2023, 1, 15),
        date(2023, 3, 22),
        date(2023, 6, 10),
        date(2024, 1, 5),
        date(2024, 2, 18),
        date(2024, 4, 30)
    ]
})
```

---

## Basic Comparison Operators

### Equality and Inequality

**Polars API:**
```python
# WHERE status = 'active'
result = df.filter(pl.col("status") == "active")

# WHERE status != 'inactive'
result = df.filter(pl.col("status") != "inactive")
```

**SQL Interface:**
```python
# WHERE status = 'active'
result = df.sql("SELECT * FROM self WHERE status = 'active'")

# WHERE status != 'inactive'
result = df.sql("SELECT * FROM self WHERE status <> 'inactive'")
```

### Numeric Comparisons

**Polars API:**
```python
# WHERE sales > 2000
result = df.filter(pl.col("sales") > 2000)

# WHERE sales >= 2000
result = df.filter(pl.col("sales") >= 2000)

# WHERE sales < 2000
result = df.filter(pl.col("sales") < 2000)

# WHERE sales <= 2000
result = df.filter(pl.col("sales") <= 2000)
```

**SQL Interface:**
```python
# WHERE sales > 2000
result = df.sql("SELECT * FROM self WHERE sales > 2000")

# WHERE sales >= 2000
result = df.sql("SELECT * FROM self WHERE sales >= 2000")

# WHERE sales < 2000
result = df.sql("SELECT * FROM self WHERE sales < 2000")

# WHERE sales <= 2000
result = df.sql("SELECT * FROM self WHERE sales <= 2000")
```

### Date Comparisons

**Polars API:**
```python
# WHERE signup_date >= '2024-01-01'
result = df.filter(pl.col("signup_date") >= date(2024, 1, 1))

# WHERE signup_date BETWEEN '2023-01-01' AND '2023-12-31'
result = df.filter(
    pl.col("signup_date").is_between(date(2023, 1, 1), date(2023, 12, 31))
)

# Filter by year
result = df.filter(pl.col("signup_date").dt.year() == 2024)
```

**SQL Interface:**
```python
# WHERE signup_date >= '2024-01-01'
result = df.sql("SELECT * FROM self WHERE signup_date >= '2024-01-01'")

# WHERE signup_date BETWEEN dates
result = df.sql("""
    SELECT * FROM self
    WHERE signup_date BETWEEN '2023-01-01' AND '2023-12-31'
""")

# Filter by year using EXTRACT
result = df.sql("SELECT * FROM self WHERE EXTRACT(YEAR FROM signup_date) = 2024")
```

---

## Null Handling

### Check for NULL

**Polars API:**
```python
# WHERE city IS NULL
result = df.filter(pl.col("city").is_null())

# WHERE city IS NOT NULL
result = df.filter(pl.col("city").is_not_null())

# WHERE sales IS NULL
result = df.filter(pl.col("sales").is_null())
```

**SQL Interface:**
```python
# WHERE city IS NULL
result = df.sql("SELECT * FROM self WHERE city IS NULL")

# WHERE city IS NOT NULL
result = df.sql("SELECT * FROM self WHERE city IS NOT NULL")

# WHERE sales IS NULL
result = df.sql("SELECT * FROM self WHERE sales IS NULL")
```

### Filter and Handle NULL

**Polars API:**
```python
# Filter out nulls before comparison
result = df.filter(
    pl.col("sales").is_not_null() & (pl.col("sales") > 2000)
)

# Replace NULL then filter
result = df.with_columns(
    pl.col("sales").fill_null(0)
).filter(pl.col("sales") > 2000)
```

**SQL Interface:**
```python
# Filter out nulls before comparison
result = df.sql("""
    SELECT * FROM self
    WHERE sales IS NOT NULL AND sales > 2000
""")

# Use COALESCE to handle NULL
result = df.sql("""
    SELECT * FROM self
    WHERE COALESCE(sales, 0) > 2000
""")
```

---

## IN and NOT IN

### IN Clause

**Polars API:**
```python
# WHERE city IN ('NYC', 'Boston')
result = df.filter(pl.col("city").is_in(["NYC", "Boston"]))

# WHERE customer_id IN (1, 3, 5)
result = df.filter(pl.col("customer_id").is_in([1, 3, 5]))
```

**SQL Interface:**
```python
# WHERE city IN ('NYC', 'Boston')
result = df.sql("SELECT * FROM self WHERE city IN ('NYC', 'Boston')")

# WHERE customer_id IN (1, 3, 5)
result = df.sql("SELECT * FROM self WHERE customer_id IN (1, 3, 5)")
```

### NOT IN Clause

**Polars API:**
```python
# WHERE status NOT IN ('inactive', 'pending')
result = df.filter(~pl.col("status").is_in(["inactive", "pending"]))

# Alternative syntax
result = df.filter(pl.col("status").is_in(["inactive", "pending"]).not_())
```

**SQL Interface:**
```python
# WHERE status NOT IN ('inactive', 'pending')
result = df.sql("SELECT * FROM self WHERE status NOT IN ('inactive', 'pending')")
```

---

## BETWEEN

**Polars API:**
```python
# WHERE sales BETWEEN 1500 AND 2000
result = df.filter(pl.col("sales").is_between(1500, 2000))

# Exclusive bounds
result = df.filter(pl.col("sales").is_between(1500, 2000, closed="none"))

# Options: "both" (default), "left", "right", "none"
result = df.filter(pl.col("sales").is_between(1500, 2000, closed="left"))
```

**SQL Interface:**
```python
# WHERE sales BETWEEN 1500 AND 2000
result = df.sql("SELECT * FROM self WHERE sales BETWEEN 1500 AND 2000")

# Exclusive bounds (greater than / less than)
result = df.sql("SELECT * FROM self WHERE sales > 1500 AND sales < 2000")
```

---

## String Pattern Matching

### LIKE Patterns

**Polars API:**
```python
# WHERE name LIKE 'A%' (starts with A)
result = df.filter(pl.col("name").str.starts_with("A"))

# WHERE name LIKE '%e' (ends with e)
result = df.filter(pl.col("name").str.ends_with("e"))

# WHERE name LIKE '%li%' (contains 'li')
result = df.filter(pl.col("name").str.contains("li"))

# Case insensitive contains
result = df.filter(pl.col("name").str.to_lowercase().str.contains("alice"))
```

**SQL Interface:**
```python
# WHERE name LIKE 'A%' (starts with A)
result = df.sql("SELECT * FROM self WHERE name LIKE 'A%'")

# WHERE name LIKE '%e' (ends with e)
result = df.sql("SELECT * FROM self WHERE name LIKE '%e'")

# WHERE name LIKE '%li%' (contains 'li')
result = df.sql("SELECT * FROM self WHERE name LIKE '%li%'")

# Case insensitive (use ILIKE or LOWER)
result = df.sql("SELECT * FROM self WHERE LOWER(name) LIKE '%alice%'")
```

### Regular Expressions

**Polars API:**
```python
# Names starting with A, B, or C
result = df.filter(pl.col("name").str.contains("^[A-C]"))

# Names with exactly 3 characters
result = df.filter(pl.col("name").str.contains("^.{3}$"))
```

**SQL Interface:**
```python
# Using SIMILAR TO (PostgreSQL-style regex)
result = df.sql("SELECT * FROM self WHERE name SIMILAR TO '[A-C]%'")

# Using regexp functions if available
result = df.sql("SELECT * FROM self WHERE LENGTH(name) = 3")
```

---

## Logical Operators

### AND Conditions

**Polars API:**
```python
# WHERE status = 'active' AND sales > 2000
result = df.filter(
    (pl.col("status") == "active") & (pl.col("sales") > 2000)
)

# Multiple AND conditions
result = df.filter(
    (pl.col("status") == "active") &
    (pl.col("city") == "Boston") &
    (pl.col("sales") > 1500)
)
```

**SQL Interface:**
```python
# WHERE status = 'active' AND sales > 2000
result = df.sql("""
    SELECT * FROM self
    WHERE status = 'active' AND sales > 2000
""")

# Multiple AND conditions
result = df.sql("""
    SELECT * FROM self
    WHERE status = 'active'
    AND city = 'Boston'
    AND sales > 1500
""")
```

### OR Conditions

**Polars API:**
```python
# WHERE city = 'NYC' OR city = 'Boston'
result = df.filter(
    (pl.col("city") == "NYC") | (pl.col("city") == "Boston")
)

# Better approach for OR on same column
result = df.filter(pl.col("city").is_in(["NYC", "Boston"]))
```

**SQL Interface:**
```python
# WHERE city = 'NYC' OR city = 'Boston'
result = df.sql("SELECT * FROM self WHERE city = 'NYC' OR city = 'Boston'")

# Better approach using IN
result = df.sql("SELECT * FROM self WHERE city IN ('NYC', 'Boston')")
```

### Complex Conditions (AND + OR)

**Polars API:**
```python
# WHERE (status = 'active' AND sales > 2000) OR city = 'NYC'
result = df.filter(
    ((pl.col("status") == "active") & (pl.col("sales") > 2000)) |
    (pl.col("city") == "NYC")
)

# WHERE status = 'active' AND (city = 'NYC' OR city = 'Boston')
result = df.filter(
    (pl.col("status") == "active") &
    (pl.col("city").is_in(["NYC", "Boston"]))
)
```

**SQL Interface:**
```python
# WHERE (status = 'active' AND sales > 2000) OR city = 'NYC'
result = df.sql("""
    SELECT * FROM self
    WHERE (status = 'active' AND sales > 2000) OR city = 'NYC'
""")

# WHERE status = 'active' AND (city = 'NYC' OR city = 'Boston')
result = df.sql("""
    SELECT * FROM self
    WHERE status = 'active' AND city IN ('NYC', 'Boston')
""")
```

### NOT Operator

**Polars API:**
```python
# WHERE NOT (status = 'inactive')
result = df.filter(~(pl.col("status") == "inactive"))

# Equivalent to
result = df.filter(pl.col("status") != "inactive")
```

**SQL Interface:**
```python
# WHERE NOT (status = 'inactive')
result = df.sql("SELECT * FROM self WHERE NOT (status = 'inactive')")

# Equivalent to
result = df.sql("SELECT * FROM self WHERE status <> 'inactive'")
```

---

## CASE WHEN in Filters

**Polars API:**
```python
# Filter based on conditional logic
result = df.filter(
    pl.when(pl.col("city") == "NYC")
        .then(pl.col("sales") > 1500)
        .otherwise(pl.col("sales") > 2000)
)
```

**SQL Interface:**
```python
# CASE WHEN in WHERE clause
result = df.sql("""
    SELECT * FROM self
    WHERE CASE
        WHEN city = 'NYC' THEN sales > 1500
        ELSE sales > 2000
    END
""")
```

---

## LIMIT and TOP

**Polars API:**
```python
# First 10 rows meeting condition (like TOP 10 with WHERE)
result = df.filter(pl.col("status") == "active").head(10)

# Last 5 rows
result = df.filter(pl.col("status") == "active").tail(5)
```

**SQL Interface:**
```python
# SELECT TOP 10 equivalent
result = df.sql("""
    SELECT * FROM self
    WHERE status = 'active'
    LIMIT 10
""")

# With OFFSET
result = df.sql("""
    SELECT * FROM self
    WHERE status = 'active'
    LIMIT 10 OFFSET 5
""")
```

---

## Subqueries

**SQL Interface:**
```python
# Using SQLContext for subqueries across tables
ctx = pl.SQLContext(customers=df, high_value=df.filter(pl.col("sales") > 2000))

# Subquery with IN
result = ctx.execute("""
    SELECT * FROM customers
    WHERE customer_id IN (SELECT customer_id FROM high_value)
""").collect()
```

**Polars API:**
```python
# Same logic with semi join
high_value_ids = df.filter(pl.col("sales") > 2000).select("customer_id")
result = df.join(high_value_ids, on="customer_id", how="semi")
```

---

## Filtering Across Columns

### Any Column Matches

**Polars API:**
```python
# Any string column contains 'Boston'
result = df.filter(
    pl.any_horizontal(
        pl.col(pl.Utf8).str.contains("Boston")
    )
)
```

### All Conditions Must Match

**Polars API:**
```python
# Multiple columns must all be non-null
result = df.filter(
    pl.all_horizontal(
        pl.col(["city", "sales"]).is_not_null()
    )
)
```

**SQL Interface:**
```python
# Multiple columns must all be non-null
result = df.sql("""
    SELECT * FROM self
    WHERE city IS NOT NULL AND sales IS NOT NULL
""")
```

---

## Chaining Filters

**Polars API:**
```python
# Multiple filter calls (equivalent to AND)
result = (
    df
    .filter(pl.col("status") == "active")
    .filter(pl.col("city").is_not_null())
    .filter(pl.col("sales") > 1500)
)

# More efficient - single filter with multiple conditions
result = df.filter(
    (pl.col("status") == "active") &
    (pl.col("city").is_not_null()) &
    (pl.col("sales") > 1500)
)
```

**SQL Interface:**
```python
# All conditions in one query
result = df.sql("""
    SELECT * FROM self
    WHERE status = 'active'
    AND city IS NOT NULL
    AND sales > 1500
""")
```

---

## Using SQLContext for Multiple Tables

```python
# Create SQL context with multiple DataFrames
orders = pl.DataFrame({
    "order_id": [1, 2, 3],
    "customer_id": [1, 2, 1],
    "amount": [100, 200, 150]
})

ctx = pl.SQLContext(customers=df, orders=orders)

# Complex query with joins and filters
result = ctx.execute("""
    SELECT c.name, c.city, o.amount
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    WHERE c.status = 'active'
    AND o.amount > 100
    ORDER BY o.amount DESC
""").collect()
```

---

## Dynamic Filtering

### Building Filters Programmatically (Polars API)

```python
def build_filter(
    status: str | None = None,
    min_sales: float | None = None,
    cities: list[str] | None = None
) -> pl.Expr:
    conditions = []

    if status is not None:
        conditions.append(pl.col("status") == status)

    if min_sales is not None:
        conditions.append(pl.col("sales") >= min_sales)

    if cities is not None:
        conditions.append(pl.col("city").is_in(cities))

    if not conditions:
        return pl.lit(True)

    combined = conditions[0]
    for cond in conditions[1:]:
        combined = combined & cond

    return combined


# Usage
filter_expr = build_filter(status="active", min_sales=1800)
result = df.filter(filter_expr)
```

### Building SQL Dynamically

```python
def build_sql_filter(
    status: str | None = None,
    min_sales: float | None = None,
    cities: list[str] | None = None
) -> str:
    conditions = []

    if status is not None:
        conditions.append(f"status = '{status}'")

    if min_sales is not None:
        conditions.append(f"sales >= {min_sales}")

    if cities is not None:
        city_list = ", ".join([f"'{c}'" for c in cities])
        conditions.append(f"city IN ({city_list})")

    where_clause = " AND ".join(conditions) if conditions else "1=1"
    return f"SELECT * FROM self WHERE {where_clause}"


# Usage
sql = build_sql_filter(status="active", cities=["NYC", "Boston"])
result = df.sql(sql)
```

---

## Performance Tips

### 1. Use Lazy Evaluation

**Polars API:**
```python
lf = df.lazy()
result = (
    lf
    .filter(pl.col("status") == "active")
    .select(["customer_id", "name"])
    .collect()
)
```

**SQL Interface with LazyFrame:**
```python
lf = df.lazy()
result = lf.sql("SELECT customer_id, name FROM self WHERE status = 'active'").collect()
```

### 2. Use is_in() for Multiple Values

```python
# Good - single check
result = df.filter(pl.col("city").is_in(["NYC", "Boston", "Chicago"]))

# SQL equivalent
result = df.sql("SELECT * FROM self WHERE city IN ('NYC', 'Boston', 'Chicago')")
```

---

## Common ETL Patterns

### Incremental Load Filter

**Polars API:**
```python
last_run = date(2024, 1, 1)
new_records = df.filter(pl.col("signup_date") > last_run)
```

**SQL Interface:**
```python
new_records = df.sql("SELECT * FROM self WHERE signup_date > '2024-01-01'")
```

### Data Quality Filter

**Polars API:**
```python
valid_records = df.filter(
    (pl.col("customer_id").is_not_null()) &
    (pl.col("name").str.len_chars() > 0) &
    (pl.col("sales") >= 0)
)
```

**SQL Interface:**
```python
valid_records = df.sql("""
    SELECT * FROM self
    WHERE customer_id IS NOT NULL
    AND LENGTH(name) > 0
    AND sales >= 0
""")
```

---

## Quick Reference: SQL to Polars

| SQL Server | Polars API | SQL Interface |
|------------|------------|---------------|
| `WHERE col = 'x'` | `df.filter(pl.col("col") == "x")` | `df.sql("...WHERE col = 'x'")` |
| `WHERE col > 10` | `df.filter(pl.col("col") > 10)` | `df.sql("...WHERE col > 10")` |
| `WHERE col IS NULL` | `df.filter(pl.col("col").is_null())` | `df.sql("...WHERE col IS NULL")` |
| `WHERE col IN (1,2)` | `df.filter(pl.col("col").is_in([1,2]))` | `df.sql("...WHERE col IN (1,2)")` |
| `WHERE col LIKE '%x%'` | `df.filter(pl.col("col").str.contains("x"))` | `df.sql("...WHERE col LIKE '%x%'")` |
| `WHERE a AND b` | `df.filter((a) & (b))` | `df.sql("...WHERE a AND b")` |
| `WHERE a OR b` | `df.filter((a) \| (b))` | `df.sql("...WHERE a OR b")` |
| `TOP 10` | `df.head(10)` | `df.sql("SELECT ... LIMIT 10")` |

---

## Key Takeaways

1. **Two approaches**: Use Polars API for programmatic chaining, SQL Interface for familiar SQL syntax
2. Use `self` to reference the current DataFrame in `df.sql()` queries
3. Use **SQLContext** when working with multiple tables
4. **Parentheses required** in Polars API when combining with `&` and `|`
5. Use `is_in()` or `IN` instead of multiple OR conditions
6. Use `is_null()`/`IS NULL` and `is_not_null()`/`IS NOT NULL` for NULL checks
7. Combine with **lazy evaluation** for query optimization

---

## Related Topics

- [[docs/python/polars/PolarsGuide\|Polars Guide]]
- [[docs/python/polars/SQLContext\|SQL Context Interface]]
- [[docs/python/polars/SelectingData\|Selecting and Reading Data]]
- [[docs/python/polars/JoiningData\|Joining DataFrames]]

---

## Sources

- [Polars SQL Interface](https://docs.pola.rs/api/python/stable/reference/sql/index.html)
- [Polars Filter Documentation](https://docs.pola.rs/user-guide/expressions/operators/)
- [Polars String Operations](https://docs.pola.rs/user-guide/expressions/strings/)

---

#polars #python #filter #where #conditions #sql #dataframe
