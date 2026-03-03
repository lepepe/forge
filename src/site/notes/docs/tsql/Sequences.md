---
{"dg-publish":true,"permalink":"/docs/tsql/sequences/","tags":["tsql","sql-server","sequences","identity"]}
---

# Sequences

## Overview

A **sequence** is a database object that generates numeric values in a defined order. Introduced in SQL Server 2012, sequences are similar to `IDENTITY` columns but are **independent of any table** — making them reusable across multiple tables or in any context where a sequential number is needed.

---

## Sequence vs IDENTITY

| Feature | IDENTITY | SEQUENCE |
|---------|----------|----------|
| Attached to a table | Yes | No |
| Shared across tables | No | Yes |
| Obtain value before INSERT | No | Yes (`NEXT VALUE FOR`) |
| Use in UPDATE | No | Yes |
| Use in multi-table inserts | No | Yes |
| Gap handling | Cannot avoid gaps | Cannot avoid gaps |
| Cycle support | No | Yes |

---

## Create a Sequence

```sql
CREATE SEQUENCE dbo.OrderNumberSeq
    AS INT
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    MAXVALUE 9999999
    NO CYCLE
    CACHE 50;
```

**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `AS` | Data type (`TINYINT`, `SMALLINT`, `INT`, `BIGINT`, `DECIMAL`) |
| `START WITH` | First value generated |
| `INCREMENT BY` | Step between values (negative = descending) |
| `MINVALUE / MAXVALUE` | Bounds for the sequence |
| `CYCLE / NO CYCLE` | Whether to restart at MINVALUE when MAXVALUE is reached |
| `CACHE n` | Pre-allocate n values in memory for performance |

---

## Using NEXT VALUE FOR

Generate the next sequence value:

```sql
-- Get next value in a SELECT
SELECT NEXT VALUE FOR dbo.OrderNumberSeq AS NextOrderNumber;

-- Use in an INSERT
INSERT INTO dbo.Orders (OrderNumber, CustomerId, OrderDate)
VALUES (NEXT VALUE FOR dbo.OrderNumberSeq, 42, GETDATE());

-- Use in multiple rows at once
INSERT INTO dbo.Orders (OrderNumber, CustomerId)
SELECT NEXT VALUE FOR dbo.OrderNumberSeq OVER (ORDER BY CustomerId), CustomerId
FROM dbo.Customers
WHERE IsActive = 1;
```

---

## Set as Column Default

```sql
ALTER TABLE dbo.Orders
ADD CONSTRAINT DF_Orders_OrderNumber
    DEFAULT (NEXT VALUE FOR dbo.OrderNumberSeq) FOR OrderNumber;
```

---

## View All Sequences and Their Current Values

```sql
SELECT
    s.name          AS SequenceName,
    SCHEMA_NAME(s.schema_id) AS SchemaName,
    s.current_value,
    s.start_value,
    s.increment,
    s.minimum_value,
    s.maximum_value,
    s.is_cycling,
    s.is_cached,
    s.cache_size
FROM sys.sequences s
ORDER BY SchemaName, SequenceName;
```

---

## Find All Tables Using a Sequence as Default

```sql
SELECT
    OBJECT_NAME(c.object_id) AS TableName,
    c.name                   AS ColumnName,
    DC.definition            AS DefaultDefinition
FROM sys.columns c
INNER JOIN sys.default_constraints DC
    ON c.default_object_id = DC.object_id
WHERE DC.definition LIKE '%NEXT VALUE FOR%'
ORDER BY TableName, ColumnName;
```

---

## Reset or Alter a Sequence

```sql
-- Restart at a specific value
ALTER SEQUENCE dbo.OrderNumberSeq
    RESTART WITH 1000;

-- Change increment
ALTER SEQUENCE dbo.OrderNumberSeq
    INCREMENT BY 5;

-- Change cache size
ALTER SEQUENCE dbo.OrderNumberSeq
    CACHE 100;
```

---

## Drop a Sequence

```sql
DROP SEQUENCE IF EXISTS dbo.OrderNumberSeq;
```

---

## Key Takeaways

1. Sequences are **table-independent** — share them across multiple tables or use them anywhere a number is needed
2. Use `NEXT VALUE FOR` to get the next value before, during, or after an INSERT
3. Use `CACHE` to improve performance in high-concurrency scenarios (cached values are lost on restart)
4. Unlike `IDENTITY`, sequences can be used in **UPDATE** statements and **multi-table inserts**
5. Neither `IDENTITY` nor sequences **guarantee gap-free** sequences — gaps occur on rollbacks or restarts

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/Transactions\|Transactions]]

---

## Sources

- [CREATE SEQUENCE (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql)
- [NEXT VALUE FOR (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/functions/next-value-for-transact-sql)
- [Sequences in SQL Server (SQL Shack)](https://www.sqlshack.com/sequence-objects-in-sql-server/)

---

#tsql #sql-server #sequences #identity #auto-increment
