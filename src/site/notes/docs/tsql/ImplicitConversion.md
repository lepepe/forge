---
{"dg-publish":true,"permalink":"/docs/tsql/implicit-conversion/","tags":["tsql","sql-server","implicit-conversion","performance","indexes"]}
---

# Implicit Conversion

## Overview

**Implicit conversion** is SQL Server's automatic data type coercion when comparing or combining values of different types. While convenient, it can silently destroy query performance by forcing the optimizer to perform an **index scan instead of an index seek**.

---

## The Problem

When a column's data type does not match the value being compared, SQL Server must convert one side of the expression. If it converts the **column**, no index can be used efficiently — the optimizer must scan every row.

```sql
-- Example: NumericColumn is INT, but compared to a string '42'
SELECT * FROM dbo.Orders WHERE OrderId = '12345'
--                                       ^^^^^^ VARCHAR being compared to INT
-- SQL Server implicitly converts '12345' to INT → seek still works here

-- Dangerous: comparing VARCHAR column to NVARCHAR literal
SELECT * FROM dbo.Products WHERE ProductCode = N'ABC'
--                               ^^^^^^^^^^^ VARCHAR column vs NVARCHAR literal
-- SQL Server converts the column → INDEX SCAN (all rows)
```

---

## VARCHAR vs NVARCHAR (Most Common Pitfall)

The most frequent implicit conversion in practice is between `VARCHAR` and `NVARCHAR`:

```sql
-- Table: ProductCode VARCHAR(50), indexed
-- This causes an implicit conversion and an INDEX SCAN:
SELECT * FROM dbo.Products WHERE ProductCode = N'ABC-123';
--                                             ^ N prefix = NVARCHAR

-- Fix: match the data type exactly
SELECT * FROM dbo.Products WHERE ProductCode = 'ABC-123';
--                                             ^ no N prefix = VARCHAR
```

**Why?** `NVARCHAR` has a higher data type precedence than `VARCHAR`. SQL Server converts the `VARCHAR` column to `NVARCHAR` — but since it's the column being converted, the index becomes unusable.

---

## Checking for Implicit Conversions

### Via Execution Plan

Look for a **yellow warning triangle** on operators, or inspect the XML plan for `CONVERT_IMPLICIT`:

```sql
-- Find queries with implicit conversions in the plan cache
SELECT TOP 20
    SUBSTRING(st.text, 1, 200)        AS QueryText,
    qp.query_plan
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle)  st
CROSS APPLY sys.dm_exec_query_plan(qs.plan_handle) qp
WHERE CAST(qp.query_plan AS NVARCHAR(MAX)) LIKE '%CONVERT_IMPLICIT%'
ORDER BY qs.total_logical_reads DESC;
```

---

## Data Type Precedence (Partial)

SQL Server converts the **lower-precedence** type to match the higher-precedence type:

| Precedence | Type |
|-----------|------|
| High | `datetime2`, `datetime`, `float` |
| Medium | `int`, `bigint`, `smallint` |
| Low | `nvarchar`, `nchar` |
| Lower | `varchar`, `char` |

> Rule: When `VARCHAR` meets `NVARCHAR`, `VARCHAR` is converted → column conversion → scan.

---

## Explicit Conversion (Fix)

Use `CAST` or `CONVERT` to explicitly coerce the **parameter** (not the column):

```sql
-- Column is VARCHAR, parameter is NVARCHAR -- convert the parameter
SELECT * FROM dbo.Products
WHERE ProductCode = CAST(N'ABC-123' AS VARCHAR(50));

-- Column is INT, your variable is VARCHAR -- convert the variable
DECLARE @Id VARCHAR(10) = '42';
SELECT * FROM dbo.Orders
WHERE OrderId = CAST(@Id AS INT);
```

---

## Prevention Checklist

| Practice | Why |
|----------|-----|
| Match parameter types to column types | Prevents column-side conversion |
| Avoid `N''` prefix for `VARCHAR` columns | NVARCHAR literal forces conversion |
| Use strongly-typed application parameters | ORM/ADO.NET sends correct types |
| Review execution plans after changes | Spot `CONVERT_IMPLICIT` warnings early |
| Keep statistics updated | Optimizer needs accurate type info |

---

## Key Takeaways

1. Implicit conversions on **indexed columns** cause index **scans** instead of **seeks**
2. The most common case is `VARCHAR` column compared to an `NVARCHAR` value (`N''` prefix)
3. Always match the parameter data type to the column data type
4. Use `CAST` or `CONVERT` on the **value/parameter**, never the column
5. Search execution plan XML for `CONVERT_IMPLICIT` to find affected queries

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/ExecutionPlans\|Execution Plans]]
- [[docs/tsql/Cardinality\|Cardinality]]
- [[docs/tsql/Collation\|Collation]]

---

## Sources

- [Implicit Conversions That Cause Index Scans](https://www.mssqltips.com/sqlservertip/7732/implicit-conversions-in-sql-affect-query-performance/)
- [Data Type Conversion (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-type-conversion-database-engine)

---

#tsql #sql-server #implicit-conversion #performance #indexes
