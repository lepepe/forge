---
{"dg-publish":true,"permalink":"/docs/tsql/dependencies/","tags":["tsql","sql-server","dependencies","objects"]}
---

# Object Dependencies

## Overview

Understanding object dependencies is essential before modifying or dropping any database object. SQL Server provides several tools to identify which objects depend on a given table, view, procedure, or function.

---

## sp_depends (Legacy)

`sp_depends` is a system stored procedure that finds objects depending on a specified database object.

```sql
-- Syntax
EXEC sp_depends 'ObjectName';

-- Example: find what depends on a table
EXEC sp_depends 'audit.ItemNumberIds';
```

**Result columns:**

| Column | Description |
|--------|-------------|
| `name` | Name of the dependent object |
| `type` | Type of object (VIEW, PROCEDURE, FUNCTION, etc.) |
| `updated` | Whether the definition has been updated since creation |
| `selected` | Whether the object is referenced in a SELECT |
| `column` | Referenced column, if applicable |

> **Warning:** `sp_depends` has limitations — it may miss dependencies created via dynamic SQL or cross-database references. Use the DMVs below for a more complete picture.

---

## sys.dm_sql_referenced_entities (Recommended)

Returns all objects that a given object **references** (what it depends on):

```sql
-- What does this stored procedure depend on?
SELECT
    referenced_schema_name,
    referenced_entity_name,
    referenced_minor_name AS ColumnName
FROM sys.dm_sql_referenced_entities('dbo.MyStoredProcedure', 'OBJECT');
```

---

## sys.dm_sql_referencing_entities (Recommended)

Returns all objects that **reference** (depend on) a given object:

```sql
-- What objects reference this table?
SELECT
    referencing_schema_name,
    referencing_entity_name,
    referencing_class_desc
FROM sys.dm_sql_referencing_entities('dbo.MyTable', 'OBJECT');
```

---

## sys.sql_expression_dependencies

Query the dependency catalog view directly for more detail:

```sql
-- All objects that reference 'MyTable'
SELECT DISTINCT
    OBJECT_SCHEMA_NAME(referencing_id)  AS ReferencingSchema,
    OBJECT_NAME(referencing_id)         AS ReferencingObject,
    o.type_desc                         AS ObjectType,
    referenced_schema_name,
    referenced_entity_name
FROM sys.sql_expression_dependencies dep
JOIN sys.objects o ON dep.referencing_id = o.object_id
WHERE referenced_entity_name = 'MyTable'
ORDER BY ReferencingSchema, ReferencingObject;
```

---

## Find All Objects Dependent on a Schema

```sql
-- All stored procedures, views, functions referencing objects in a schema
SELECT DISTINCT
    OBJECT_SCHEMA_NAME(dep.referencing_id) AS ReferencingSchema,
    OBJECT_NAME(dep.referencing_id)        AS ReferencingObject,
    o.type_desc                            AS ObjectType,
    dep.referenced_schema_name,
    dep.referenced_entity_name
FROM sys.sql_expression_dependencies dep
JOIN sys.objects o ON dep.referencing_id = o.object_id
WHERE dep.referenced_schema_name = 'audit'
ORDER BY ReferencingSchema, ReferencingObject;
```

---

## Check if a Stored Procedure Is Used by Other Objects

```sql
SELECT
    schema_name(o.schema_id) + '.' + o.name  AS [Procedure],
    'is used by'                              AS Ref,
    schema_name(ref_o.schema_id) + '.' + ref_o.name AS [Object],
    ref_o.type_desc                           AS ObjectType
FROM sys.objects o
JOIN sys.sql_expression_dependencies dep ON o.object_id = dep.referenced_id
JOIN sys.objects ref_o ON dep.referencing_id = ref_o.object_id
WHERE o.type IN ('P', 'X')
ORDER BY [Object];
```

---

## Quick Comparison

| Tool | Direction | Limitation |
|------|-----------|------------|
| `sp_depends` | Both | Legacy, misses dynamic SQL |
| `dm_sql_referenced_entities` | What does X depend on? | Requires valid object |
| `dm_sql_referencing_entities` | What depends on X? | Current DB only |
| `sys.sql_expression_dependencies` | Both | Best for catalog queries |

---

## Key Takeaways

1. Use `sys.dm_sql_referencing_entities` to find all objects that **use** a given table or procedure before dropping it
2. Use `sys.dm_sql_referenced_entities` to see what a stored procedure or view **depends on**
3. `sp_depends` is legacy — prefer the DMVs for accurate results
4. Dynamic SQL dependencies are **not tracked** by any of these tools
5. Always check dependencies before renaming or dropping objects in production

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/snippets/StoredProcedures\|Stored Procedures]]
- [[docs/tsql/DynamicSQL\|Dynamic SQL]]

---

## Sources

- [sys.dm_sql_referencing_entities](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-sql-referencing-entities-transact-sql)
- [sys.dm_sql_referenced_entities](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-sql-referenced-entities-transact-sql)

---

#tsql #sql-server #dependencies #objects
