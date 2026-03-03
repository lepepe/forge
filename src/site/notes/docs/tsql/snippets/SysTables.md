---
{"dg-publish":true,"permalink":"/docs/tsql/snippets/sys-tables/","tags":["tsql","sql-server","sys-tables","schema","metadata"]}
---

# Sys Tables & Schema Queries

## Overview

SQL Server's system catalog views (`sys.*`) expose metadata about all database objects. These snippets cover common administrative and diagnostic queries against the catalog.

---

## Check When an Object Was Created or Modified

```sql
SELECT
    name,
    object_id,
    SCHEMA_NAME(schema_id) AS SchemaName,
    type_desc,
    create_date,
    modify_date
FROM sys.tables
WHERE name = 'products';
```

---

## List All Tables in the Database

```sql
SELECT
    SCHEMA_NAME(schema_id) AS SchemaName,
    name                   AS TableName,
    create_date,
    modify_date
FROM sys.tables
ORDER BY SchemaName, TableName;
```

---

## List All Schemas and Their Owners

```sql
SELECT
    s.name          AS SchemaName,
    s.schema_id     AS SchemaId,
    u.name          AS SchemaOwner
FROM sys.schemas s
INNER JOIN sys.sysusers u ON u.uid = s.principal_id
ORDER BY s.name;
```

---

## List All Columns for a Table

```sql
SELECT
    c.column_id,
    c.name                          AS ColumnName,
    t.name                          AS DataType,
    c.max_length,
    c.precision,
    c.scale,
    c.is_nullable,
    c.is_identity,
    c.collation_name,
    dc.definition                   AS DefaultValue
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN sys.default_constraints dc ON dc.object_id = c.default_object_id
WHERE OBJECT_NAME(c.object_id) = 'YourTableName'
  AND SCHEMA_NAME(OBJECTPROPERTY(c.object_id, 'SchemaId')) = 'dbo'
ORDER BY c.column_id;
```

---

## List All Views

```sql
SELECT
    SCHEMA_NAME(schema_id) AS SchemaName,
    name                   AS ViewName,
    create_date,
    modify_date
FROM sys.views
ORDER BY SchemaName, ViewName;
```

---

## Find Objects by Name Pattern

```sql
-- Find any object (table, view, procedure, function) containing a keyword
SELECT
    SCHEMA_NAME(schema_id) AS SchemaName,
    name                   AS ObjectName,
    type_desc
FROM sys.objects
WHERE name LIKE '%Invoice%'
  AND type IN ('U', 'V', 'P', 'FN', 'IF', 'TF')
ORDER BY type_desc, SchemaName, ObjectName;
```

**Object type codes:**

| Code | Type |
|------|------|
| `U` | User Table |
| `V` | View |
| `P` | Stored Procedure |
| `FN` | Scalar Function |
| `IF` | Inline Table-Valued Function |
| `TF` | Table-Valued Function |
| `TR` | Trigger |

---

## Check Table Row Counts

```sql
SELECT
    SCHEMA_NAME(t.schema_id)               AS SchemaName,
    t.name                                 AS TableName,
    SUM(p.rows)                            AS RowCount
FROM sys.tables t
JOIN sys.partitions p ON t.object_id = p.object_id
WHERE p.index_id IN (0, 1)  -- 0=heap, 1=clustered index
GROUP BY t.schema_id, t.name
ORDER BY RowCount DESC;
```

---

## Check Table and Index Size

```sql
SELECT
    SCHEMA_NAME(t.schema_id)               AS SchemaName,
    t.name                                 AS TableName,
    SUM(a.total_pages) * 8 / 1024          AS TotalMB,
    SUM(a.used_pages)  * 8 / 1024          AS UsedMB,
    SUM(a.data_pages)  * 8 / 1024          AS DataMB
FROM sys.tables t
JOIN sys.indexes i ON t.object_id = i.object_id
JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
JOIN sys.allocation_units a ON p.partition_id = a.container_id
GROUP BY t.schema_id, t.name
ORDER BY TotalMB DESC;
```

---

## List All User-Defined Functions

```sql
SELECT
    SCHEMA_NAME(schema_id) AS SchemaName,
    name                   AS FunctionName,
    type_desc,
    create_date,
    modify_date
FROM sys.objects
WHERE type IN ('FN', 'IF', 'TF')
ORDER BY SchemaName, FunctionName;
```

---

## List All Triggers

```sql
SELECT
    SCHEMA_NAME(o.schema_id) AS SchemaName,
    OBJECT_NAME(t.parent_id) AS TableName,
    t.name                   AS TriggerName,
    t.type_desc,
    t.is_disabled,
    t.is_instead_of_trigger,
    o.create_date,
    o.modify_date
FROM sys.triggers t
JOIN sys.objects o ON t.object_id = o.object_id
ORDER BY SchemaName, TableName, TriggerName;
```

---

## Key Takeaways

1. `sys.tables`, `sys.views`, `sys.procedures` are the primary catalog views for object metadata
2. `sys.objects` covers **all** object types — use `type` or `type_desc` to filter
3. `sys.partitions` with `index_id IN (0,1)` gives accurate row counts (heap or clustered)
4. Use `SCHEMA_NAME()` and `OBJECT_NAME()` to convert IDs to readable names
5. Combine `sys.columns` + `sys.types` to inspect table structure programmatically

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/snippets/ForeignKeys\|Foreign Keys & Indexes]]
- [[docs/tsql/snippets/Permissions\|Permissions]]
- [[docs/tsql/snippets/StoredProcedures\|Stored Procedures]]

---

## Sources

- [sys.tables](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-tables-transact-sql)
- [sys.objects](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-objects-transact-sql)
- [sys.schemas](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-schemas-transact-sql)

---

#tsql #sql-server #sys-tables #schema #metadata #catalog
