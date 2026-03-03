---
{"dg-publish":true,"permalink":"/docs/tsql/collation/","tags":["tsql","sql-server","collation","encoding"]}
---

# Collation

## Overview

Collation in SQL Server defines the rules for sorting and comparing character data. It determines **case sensitivity**, **accent sensitivity**, and the **character set** used for string comparisons. Mismatched collations between columns or databases are a common source of join errors and unexpected results.

---

## Collation Naming Convention

```
SQL_Latin1_General_CP1_CI_AS
                        │  │
                        │  └─ AS = Accent Sensitive
                        └──── CI = Case Insensitive

Other suffixes:
  CS = Case Sensitive
  AI = Accent Insensitive
  KS = Kana Sensitive
  WS = Width Sensitive
  BIN = Binary sort
```

---

## Check Collation of a Table/Column

```sql
USE DatabaseName;
GO

SELECT
    c.name          AS ColumnName,
    t.name          AS TableName,
    c.collation_name AS Collation
FROM sys.columns c
JOIN sys.tables t ON t.object_id = c.object_id
WHERE t.name = 'MyTabelName';
```

---

## Check Database Collation

```sql
SELECT
    name,
    collation_name
FROM sys.databases
WHERE name = DB_NAME();
```

---

## Check Server Default Collation

```sql
SELECT SERVERPROPERTY('Collation') AS ServerCollation;
```

---

## Collation Mismatch in JOINs

A common error when joining tables from different databases:

```
Cannot resolve the collation conflict between "Latin1_General_CI_AS"
and "SQL_Latin1_General_CP1_CI_AS" in the equal to operation.
```

**Fix — use `COLLATE` to explicitly match:**

```sql
SELECT a.Name, b.Description
FROM DatabaseA.dbo.TableA a
JOIN DatabaseB.dbo.TableB b
    ON a.Name = b.Name COLLATE Latin1_General_CI_AS;
```

---

## Change Column Collation

```sql
ALTER TABLE dbo.products
ALTER COLUMN VendorName NVARCHAR(255)
    COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL;
```

---

## Common Collations

| Collation | Description |
|-----------|-------------|
| `SQL_Latin1_General_CP1_CI_AS` | SQL Server default (most common) |
| `Latin1_General_CI_AS` | Windows collation, case insensitive |
| `Latin1_General_CS_AS` | Case sensitive, accent sensitive |
| `Latin1_General_BIN` | Binary sort order |

---

## Key Takeaways

1. Collation affects **string comparisons, sorts, and joins**
2. Mismatched collations between joined columns cause runtime errors
3. Use `COLLATE` in the `JOIN` or `WHERE` clause to resolve conflicts at query time
4. Server, database, and column collations can all differ — check all three when troubleshooting
5. `CI` (case insensitive) is the most common setting in enterprise SQL Server environments

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/ImplicitConversion\|Implicit Conversion]]

---

## Sources

- [Collation and Unicode Support](https://learn.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support)
- [ALTER TABLE (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-transact-sql)

---

#tsql #sql-server #collation #encoding #string-comparison
