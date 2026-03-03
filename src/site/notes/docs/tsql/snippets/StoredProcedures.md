---
{"dg-publish":true,"permalink":"/docs/tsql/snippets/stored-procedures/","tags":["tsql","sql-server","stored-procedures","schema"]}
---

# Stored Procedures

## Overview

Stored procedures are precompiled SQL code blocks stored in the database. These snippets help you inspect, audit, and manage stored procedures — including finding dependencies, last execution times, and references to specific tables or columns.

---

## Check if a Stored Procedure Is Used by Other Objects

```sql
SELECT
    SCHEMA_NAME(o.schema_id) + '.' + o.name          AS [Procedure],
    'is used by'                                      AS Ref,
    SCHEMA_NAME(ref_o.schema_id) + '.' + ref_o.name  AS [ReferencedBy],
    ref_o.type_desc                                   AS ObjectType
FROM sys.objects o
JOIN sys.sql_expression_dependencies dep ON o.object_id = dep.referenced_id
JOIN sys.objects ref_o ON dep.referencing_id = ref_o.object_id
WHERE o.type IN ('P', 'X')           -- P = Stored Procedure, X = Extended SP
    AND SCHEMA_NAME(o.schema_id) = 'shipping'
    AND o.name = 'sto_DeleteOrderItemById'
ORDER BY [ReferencedBy];
```

---

## Last Execution Date of a Stored Procedure

Requires the procedure to still be in the plan cache (cleared on SQL Server restart):

```sql
SELECT
    SCHEMA_NAME(obj.schema_id)  AS SchemaName,
    OBJECT_NAME(stats.object_id) AS ProcedureName,
    stats.last_execution_time,
    stats.execution_count,
    stats.total_elapsed_time / stats.execution_count AS avg_elapsed_us
FROM sys.dm_exec_procedure_stats stats
INNER JOIN sys.objects obj ON obj.object_id = stats.object_id
WHERE obj.type = 'P'
ORDER BY stats.last_execution_time DESC;
```

---

## Find All Stored Procedures That Reference a Table

Use when you need to know which procedures touch a given table before modifying it:

```sql
SELECT
    CONCAT(SCHEMA_NAME(schema_id), '.', name) AS ProcedureName
FROM sys.procedures
WHERE OBJECT_DEFINITION(OBJECT_ID) LIKE '%Trade%'
ORDER BY ProcedureName;
```

---

## Find All Stored Procedures That Reference a Column

Useful when renaming or removing a column:

```sql
SELECT
    OBJECT_NAME(object_id)  AS ProcedureName,
    SUBSTRING(definition, 1, 200) AS DefinitionPreview
FROM sys.sql_modules
WHERE definition LIKE '%CreatedDate%'
ORDER BY ProcedureName;
```

---

## List All Stored Procedures in a Schema

```sql
SELECT
    SCHEMA_NAME(schema_id) AS SchemaName,
    name                   AS ProcedureName,
    create_date,
    modify_date
FROM sys.procedures
WHERE SCHEMA_NAME(schema_id) = 'dbo'
ORDER BY name;
```

---

## Search Procedure Definition for Keywords

```sql
SELECT
    SCHEMA_NAME(p.schema_id)  AS SchemaName,
    p.name                    AS ProcedureName,
    m.definition
FROM sys.procedures p
INNER JOIN sys.sql_modules m ON p.object_id = m.object_id
WHERE m.definition LIKE '%OPENQUERY%'   -- Replace with your keyword
ORDER BY SchemaName, ProcedureName;
```

---

## Identify Procedures Not Executed in X Days

```sql
SELECT
    SCHEMA_NAME(obj.schema_id)   AS SchemaName,
    OBJECT_NAME(s.object_id)     AS ProcedureName,
    s.last_execution_time,
    DATEDIFF(DAY, s.last_execution_time, GETDATE()) AS DaysSinceLastRun
FROM sys.dm_exec_procedure_stats s
INNER JOIN sys.objects obj ON obj.object_id = s.object_id
WHERE obj.type = 'P'
  AND s.last_execution_time < DATEADD(DAY, -90, GETDATE())
ORDER BY DaysSinceLastRun DESC;
```

---

## Key Takeaways

1. `sys.sql_expression_dependencies` is the most reliable source for procedure-to-object relationships
2. `sys.dm_exec_procedure_stats` only has data while the plan is in cache — cleared on restart
3. `OBJECT_DEFINITION()` returns the procedure's full T-SQL body for text search
4. When searching by column name, use `sys.sql_modules.definition` for broader coverage (includes views, functions, triggers)
5. Always check dependencies before modifying or dropping a stored procedure

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/Dependencies\|Object Dependencies]]
- [[docs/tsql/DynamicSQL\|Dynamic SQL]]
- [[docs/tsql/snippets/SysTables\|Sys Tables & Schema Queries]]

---

## Sources

- [sys.procedures](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-procedures-transact-sql)
- [sys.dm_exec_procedure_stats](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-procedure-stats-transact-sql)
- [sys.sql_modules](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-sql-modules-transact-sql)

---

#tsql #sql-server #stored-procedures #schema #dependencies
