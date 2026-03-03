---
{"dg-publish":true,"permalink":"/docs/tsql/cardinality/","tags":["tsql","sql-server","cardinality","indexes","performance"]}
---

# Cardinality (Column/Index Cardinality)

## Overview

In SQL Server, **cardinality** refers to the uniqueness of data values in a column of a database table. It is a critical concept in database design and query optimization — it helps determine how many rows a query will return and which indexes the query optimizer should use.

---

## Types of Cardinality

### 1. High Cardinality
A column has high cardinality when it has a **large number of unique values**.

Examples:
- Primary key or unique constraint columns
- Columns with many distinct values (e.g., full name, email)

### 2. Low Cardinality
A column has low cardinality when it has a **small number of unique values**.

Examples:
- Boolean flags (`IsActive`, `IsDeleted`)
- Gender, status, category columns

### 3. No Cardinality
A column has no cardinality when **all values are the same**.

Examples:
- Columns populated with a single default value
- Columns containing only NULL values

---

## Example

| Id  | FirstName | LastName  | Gender | Title                   |
| --- | --------- | --------- | ------ | ----------------------- |
| 1   | Jose      | Perez     | M      | Database Developer 1    |
| 2   | John      | Doe       | M      | Database Developer 3    |
| 3   | Mary      | Poppins   | F      | Database Developer 1    |
| 4   | Olivia    | Martinez  | F      | Database Developer 3    |
| 5   | Amelia    | Johnson   | F      | Database Developer 3    |
| 6   | Harper    | Davis     | M      | Jr Database Developer 3 |
| 7   | Daniel    | Hernandez | M      | Database Developer 1    |

| Column | Cardinality | Reason |
|--------|-------------|--------|
| `Id` | **High** | Every value is unique |
| `FirstName` | **High** | Mostly unique values |
| `LastName` | **High** | Mostly unique values |
| `Title` | **Normal** | Some repeated values, but several distinct ones |
| `Gender` | **Low** | Only two possible values (M / F) |

---

## Impact on Query Performance

```
High Cardinality  →  More selective  →  Index SEEK  →  Fast
Low Cardinality   →  Less selective  →  Index SCAN  →  Slower
```

- **High cardinality columns** are more selective and make excellent index candidates. The query optimizer can efficiently narrow down rows.
- **Low cardinality columns** (like `Gender`) are poor index candidates. The optimizer often prefers a table scan because it would need to visit most rows anyway.

---

## Checking Column Cardinality

```sql
-- Approximate distinct values per column
SELECT
    'Id'        AS ColumnName, COUNT(DISTINCT Id)        AS DistinctValues FROM Employees
UNION ALL
SELECT 'Gender', COUNT(DISTINCT Gender) FROM Employees
UNION ALL
SELECT 'Title',  COUNT(DISTINCT Title)  FROM Employees;
```

```sql
-- Using sys.dm_db_stats_properties for index stats
SELECT
    OBJECT_NAME(s.object_id)   AS TableName,
    c.name                     AS ColumnName,
    s.name                     AS StatName,
    sp.rows                    AS TotalRows,
    sp.rows_sampled            AS RowsSampled,
    sp.modification_counter    AS Modifications
FROM sys.stats s
JOIN sys.stats_columns sc ON s.object_id = sc.object_id AND s.stats_id = sc.stats_id
JOIN sys.columns c ON sc.object_id = c.object_id AND sc.column_id = c.column_id
CROSS APPLY sys.dm_db_stats_properties(s.object_id, s.stats_id) sp
WHERE OBJECT_NAME(s.object_id) = 'YourTable';
```

---

## Key Takeaways

1. **High cardinality** columns are the best candidates for indexes
2. **Low cardinality** columns on their own are poor index candidates — consider composite indexes instead
3. The query optimizer uses cardinality estimates to choose between **index seeks** and **index scans**
4. Keep statistics up to date with `UPDATE STATISTICS` so the optimizer has accurate cardinality data
5. Use filtered indexes for low-cardinality columns when querying a specific subset (e.g., `WHERE IsActive = 1`)

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/ExecutionPlans\|Execution Plans]]
- [[docs/tsql/ImplicitConversion\|Implicit Conversion]]

---

## Sources

- [SQL Server Index Design Guide](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide)
- [Statistics in SQL Server](https://learn.microsoft.com/en-us/sql/relational-databases/statistics/statistics)

---

#tsql #sql-server #cardinality #indexes #performance
