---
{"dg-publish":true,"permalink":"/docs/python/polars/transforming-data/","tags":["polars","transform","data-manipulation","expressions"]}
---

# Data Transformations

## Overview

This guide covers common data transformation patterns in Polars, from basic column operations to complex aggregations. Each transformation is shown with its SQL Server equivalent for easy reference.

---

## SQL to Polars Mapping

| SQL Server | Polars |
|------------|--------|
| `CAST(col AS INT)` | `pl.col("col").cast(pl.Int64)` |
| `ISNULL(col, default)` | `pl.col("col").fill_null(default)` |
| `COALESCE(a, b, c)` | `pl.coalesce([pl.col("a"), pl.col("b"), pl.col("c")])` |
| `UPPER(col)` | `pl.col("col").str.to_uppercase()` |
| `TRIM(col)` | `pl.col("col").str.strip_chars()` |
| `CONCAT(a, b)` | `pl.concat_str([pl.col("a"), pl.col("b")])` |
| `DATEPART(YEAR, date)` | `pl.col("date").dt.year()` |
| `DATEDIFF(DAY, a, b)` | `(pl.col("b") - pl.col("a")).dt.total_days()` |

---

## Sample Data

```python
import polars as pl
from datetime import date, datetime

df = pl.DataFrame({
    "customer_id": [1, 2, 3, 4, 5],
    "name": ["  Alice  ", "bob", "CHARLIE", "Diana", None],
    "email": ["alice@test.com", "BOB@TEST.COM", None, "diana@test.com", "eve@test.com"],
    "amount": [1500.50, 2300.00, None, 1800.75, 950.25],
    "quantity": ["10", "20", "15", None, "5"],
    "order_date": [
        date(2024, 1, 15),
        date(2024, 2, 20),
        date(2024, 3, 10),
        date(2024, 1, 25),
        None
    ],
    "status": ["active", "pending", "active", "inactive", "active"]
})
```

---

## Adding and Modifying Columns

### with_columns (Add/Modify)

```python
# Add new columns or modify existing ones
result = df.with_columns([
    # New column from expression
    (pl.col("amount") * 1.1).alias("amount_with_tax"),

    # Modify existing column
    pl.col("name").str.to_uppercase().alias("name"),

    # Constant value
    pl.lit("USD").alias("currency")
])
```

### Rename Columns

```python
# Rename specific columns
result = df.rename({
    "customer_id": "id",
    "order_date": "purchase_date"
})

# Rename all columns (e.g., to lowercase)
result = df.rename(lambda col: col.lower())

# Add prefix/suffix
result = df.rename(lambda col: f"src_{col}")
```

### Drop Columns

```python
# Drop specific columns
result = df.drop(["status", "email"])

# Drop columns matching pattern
result = df.select(pl.all().exclude("^temp_.*$"))
```

---

## Type Casting

### Basic Casting

```python
# SQL: CAST(quantity AS INT)
result = df.with_columns([
    pl.col("quantity").cast(pl.Int64).alias("quantity_int")
])

# Multiple casts
result = df.with_columns([
    pl.col("quantity").cast(pl.Int64),
    pl.col("amount").cast(pl.Float32),
    pl.col("customer_id").cast(pl.Utf8).alias("customer_id_str")
])
```

### Common Type Conversions

| From | To | Polars |
|------|-------|--------|
| String | Integer | `pl.col("col").cast(pl.Int64)` |
| String | Float | `pl.col("col").cast(pl.Float64)` |
| Integer | String | `pl.col("col").cast(pl.Utf8)` |
| String | Date | `pl.col("col").str.to_date()` |
| String | Datetime | `pl.col("col").str.to_datetime()` |
| Date | String | `pl.col("col").dt.to_string("%Y-%m-%d")` |

### Safe Casting

```python
# Cast with null on failure (instead of error)
result = df.with_columns([
    pl.col("quantity").cast(pl.Int64, strict=False)
])
```

---

## Null Handling

### Fill Null Values

```python
# SQL: ISNULL(amount, 0)
result = df.with_columns([
    pl.col("amount").fill_null(0),
    pl.col("name").fill_null("Unknown"),
    pl.col("order_date").fill_null(date(1900, 1, 1))
])

# Fill with column mean
result = df.with_columns([
    pl.col("amount").fill_null(pl.col("amount").mean())
])

# Fill with forward/backward fill
result = df.with_columns([
    pl.col("amount").forward_fill(),
    pl.col("quantity").backward_fill()
])
```

### Coalesce

```python
# SQL: COALESCE(email, 'no-email@default.com')
result = df.with_columns([
    pl.coalesce([pl.col("email"), pl.lit("no-email@default.com")]).alias("email")
])

# Multiple columns
result = df.with_columns([
    pl.coalesce([
        pl.col("primary_phone"),
        pl.col("secondary_phone"),
        pl.col("mobile_phone"),
        pl.lit("No phone")
    ]).alias("contact_phone")
])
```

### Drop Nulls

```python
# Drop rows with any null
result = df.drop_nulls()

# Drop rows with null in specific columns
result = df.drop_nulls(subset=["name", "amount"])
```

---

## String Transformations

### Case Conversion

```python
result = df.with_columns([
    pl.col("name").str.to_uppercase().alias("name_upper"),
    pl.col("name").str.to_lowercase().alias("name_lower"),
    pl.col("name").str.to_titlecase().alias("name_title")
])
```

### Trimming and Padding

```python
result = df.with_columns([
    # Remove whitespace
    pl.col("name").str.strip_chars().alias("name_trimmed"),
    pl.col("name").str.strip_chars_start().alias("name_ltrim"),
    pl.col("name").str.strip_chars_end().alias("name_rtrim"),

    # Pad strings
    pl.col("customer_id").cast(pl.Utf8).str.pad_start(10, "0").alias("padded_id")
])
```

### String Concatenation

```python
# SQL: CONCAT(first_name, ' ', last_name)
result = df.with_columns([
    pl.concat_str([
        pl.col("first_name"),
        pl.lit(" "),
        pl.col("last_name")
    ]).alias("full_name")
])

# With separator
result = df.with_columns([
    pl.concat_str(["city", "state", "zip"], separator=", ").alias("full_address")
])
```

### Substring and Replace

```python
result = df.with_columns([
    # SQL: SUBSTRING(col, 1, 5)
    pl.col("name").str.slice(0, 5).alias("name_short"),

    # SQL: REPLACE(col, 'old', 'new')
    pl.col("email").str.replace("test.com", "example.com").alias("email_fixed"),

    # Replace all occurrences
    pl.col("notes").str.replace_all(r"\s+", " ").alias("notes_clean")
])
```

### Extract and Split

```python
result = df.with_columns([
    # Extract domain from email
    pl.col("email").str.extract(r"@(.+)$", 1).alias("domain"),

    # Split and get first part
    pl.col("email").str.split("@").list.first().alias("username")
])
```

---

## Date and Time Transformations

### Extract Date Parts

```python
# SQL: DATEPART(YEAR, order_date)
result = df.with_columns([
    pl.col("order_date").dt.year().alias("year"),
    pl.col("order_date").dt.month().alias("month"),
    pl.col("order_date").dt.day().alias("day"),
    pl.col("order_date").dt.weekday().alias("weekday"),  # 0=Monday
    pl.col("order_date").dt.week().alias("week_number"),
    pl.col("order_date").dt.quarter().alias("quarter")
])
```

### Date Arithmetic

```python
# SQL: DATEADD(DAY, 30, order_date)
result = df.with_columns([
    (pl.col("order_date") + pl.duration(days=30)).alias("due_date"),
    (pl.col("order_date") - pl.duration(days=7)).alias("week_before")
])

# Date difference
result = df.with_columns([
    (pl.col("end_date") - pl.col("start_date")).dt.total_days().alias("days_diff")
])
```

### Date Formatting

```python
result = df.with_columns([
    # Format as string
    pl.col("order_date").dt.to_string("%Y-%m-%d").alias("date_str"),
    pl.col("order_date").dt.to_string("%B %d, %Y").alias("date_formatted"),

    # ISO format
    pl.col("order_date").dt.to_string("%Y-%m-%dT%H:%M:%S").alias("iso_format")
])
```

### Parse Dates from Strings

```python
df_with_strings = pl.DataFrame({
    "date_str": ["2024-01-15", "2024-02-20", "2024-03-10"]
})

result = df_with_strings.with_columns([
    pl.col("date_str").str.to_date("%Y-%m-%d").alias("date"),
    pl.col("date_str").str.to_datetime("%Y-%m-%d").alias("datetime")
])
```

---

## Numeric Transformations

### Mathematical Operations

```python
result = df.with_columns([
    # Basic math
    (pl.col("amount") * 1.1).alias("with_tax"),
    (pl.col("amount") / pl.col("quantity").cast(pl.Float64)).alias("unit_price"),

    # Rounding
    pl.col("amount").round(0).alias("amount_rounded"),
    pl.col("amount").floor().alias("amount_floor"),
    pl.col("amount").ceil().alias("amount_ceil"),

    # Absolute value
    pl.col("amount").abs().alias("amount_abs"),

    # Power and log
    pl.col("amount").pow(2).alias("amount_squared"),
    pl.col("amount").log().alias("amount_log")
])
```

### Binning (Bucketing)

```python
# SQL: CASE WHEN approach
result = df.with_columns([
    pl.when(pl.col("amount") < 1000).then(pl.lit("Low"))
        .when(pl.col("amount") < 2000).then(pl.lit("Medium"))
        .otherwise(pl.lit("High"))
        .alias("amount_tier")
])

# Using cut for fixed bins
result = df.with_columns([
    pl.col("amount").cut(
        breaks=[0, 1000, 2000, 3000],
        labels=["Low", "Medium", "High"]
    ).alias("amount_bucket")
])
```

---

## Conditional Transformations

### CASE WHEN

```python
# Simple case
result = df.with_columns([
    pl.when(pl.col("status") == "active")
        .then(pl.lit(1))
        .otherwise(pl.lit(0))
        .alias("is_active")
])

# Multiple conditions
result = df.with_columns([
    pl.when(pl.col("amount") >= 2000).then(pl.lit("Premium"))
        .when(pl.col("amount") >= 1000).then(pl.lit("Standard"))
        .when(pl.col("amount") >= 500).then(pl.lit("Basic"))
        .otherwise(pl.lit("Minimal"))
        .alias("tier")
])

# Nested conditions
result = df.with_columns([
    pl.when((pl.col("status") == "active") & (pl.col("amount") > 1500))
        .then(pl.lit("Priority"))
        .when(pl.col("status") == "active")
        .then(pl.lit("Normal"))
        .otherwise(pl.lit("Inactive"))
        .alias("priority")
])
```

### If-Else with Columns

```python
# Use value from different column based on condition
result = df.with_columns([
    pl.when(pl.col("status") == "active")
        .then(pl.col("amount"))
        .otherwise(pl.lit(0))
        .alias("active_amount")
])
```

---

## Aggregation Transformations

### Group By Aggregations

```python
# SQL: SELECT status, COUNT(*), SUM(amount), AVG(amount) FROM df GROUP BY status
result = df.group_by("status").agg([
    pl.count().alias("count"),
    pl.col("amount").sum().alias("total_amount"),
    pl.col("amount").mean().alias("avg_amount"),
    pl.col("amount").min().alias("min_amount"),
    pl.col("amount").max().alias("max_amount"),
    pl.col("amount").std().alias("std_amount")
])
```

### Window Functions

```python
# SQL: SUM(amount) OVER (PARTITION BY status ORDER BY order_date)
result = df.with_columns([
    pl.col("amount").sum().over("status").alias("status_total"),
    pl.col("amount").mean().over("status").alias("status_avg"),
    pl.col("amount").rank().over("status").alias("rank_in_status"),
    pl.col("amount").cum_sum().over("status").alias("running_total")
])
```

### Row Number and Ranking

```python
result = df.with_columns([
    # Row number within partition
    pl.col("amount").rank(method="ordinal").over("status").alias("row_num"),

    # Rank (with ties)
    pl.col("amount").rank(method="min").over("status").alias("rank"),

    # Dense rank
    pl.col("amount").rank(method="dense").over("status").alias("dense_rank"),

    # Lead and Lag
    pl.col("amount").shift(-1).over("status").alias("next_amount"),
    pl.col("amount").shift(1).over("status").alias("prev_amount")
])
```

---

## Pivot and Unpivot

### Pivot (Wide Format)

```python
# Transform rows to columns
sales_data = pl.DataFrame({
    "customer": ["A", "A", "B", "B"],
    "product": ["Widget", "Gadget", "Widget", "Gadget"],
    "amount": [100, 200, 150, 300]
})

pivoted = sales_data.pivot(
    values="amount",
    index="customer",
    on="product",
    aggregate_function="sum"
)
# Result: customer | Widget | Gadget
#         A        | 100    | 200
#         B        | 150    | 300
```

### Unpivot (Long Format)

```python
# Transform columns to rows
wide_data = pl.DataFrame({
    "customer": ["A", "B"],
    "jan_sales": [100, 150],
    "feb_sales": [200, 180],
    "mar_sales": [150, 220]
})

unpivoted = wide_data.unpivot(
    index="customer",
    on=["jan_sales", "feb_sales", "mar_sales"],
    variable_name="month",
    value_name="sales"
)
```

---

## Combining Transformations (ETL Pipeline)

```python
def transform_customer_data(df: pl.DataFrame) -> pl.DataFrame:
    return (
        df
        # Clean strings
        .with_columns([
            pl.col("name").str.strip_chars().str.to_titlecase(),
            pl.col("email").str.to_lowercase()
        ])
        # Handle nulls
        .with_columns([
            pl.col("amount").fill_null(0),
            pl.coalesce([pl.col("email"), pl.lit("unknown@example.com")]).alias("email")
        ])
        # Cast types
        .with_columns([
            pl.col("quantity").cast(pl.Int64, strict=False).fill_null(0)
        ])
        # Add computed columns
        .with_columns([
            (pl.col("amount") * pl.col("quantity")).alias("total_value"),
            pl.col("order_date").dt.year().alias("order_year"),
            pl.when(pl.col("status") == "active")
                .then(pl.lit(True))
                .otherwise(pl.lit(False))
                .alias("is_active")
        ])
        # Filter valid records
        .filter(pl.col("customer_id").is_not_null())
        # Select final columns
        .select([
            "customer_id",
            "name",
            "email",
            "total_value",
            "order_year",
            "is_active"
        ])
    )


# Apply transformation
clean_df = transform_customer_data(df)
```

---

## Key Takeaways

1. Use **`with_columns()`** to add or modify columns without losing existing ones
2. Use **`cast()`** with `strict=False` for safe type conversions
3. Use **`fill_null()`** and **`coalesce()`** for null handling
4. String operations are in **`.str`** namespace, date in **`.dt`**
5. Use **`when().then().otherwise()`** for conditional logic
6. Window functions use **`.over()`** for partitioning
7. Chain operations for clean, readable ETL pipelines

---

## Related Topics

- [[docs/python/polars/PolarsGuide\|Polars Guide]]
- [[docs/python/polars/SelectingData\|Selecting and Reading Data]]
- [[docs/python/polars/FilteringData\|Filtering DataFrames]]
- [[docs/python/polars/WritingToSQLServer\|Writing to SQL Server]]

---

## Sources

- [Polars Expressions Documentation](https://docs.pola.rs/user-guide/expressions/)
- [Polars API Reference](https://docs.pola.rs/py-polars/html/reference/)

---

#polars #python #transform #data-manipulation #expressions #dataframe
