---
{"dg-publish":true,"permalink":"/docs/tsql/snippets/foreign-keys/","tags":["tsql","sql-server","foreign-keys","indexes","schema"]}
---

# Foreign Keys & Indexes

## Overview

Foreign keys enforce referential integrity between tables. Understanding all FK relationships for a given table is essential before making schema changes, dropping tables, or redesigning data models.

---

## List All Foreign Keys Related to a Table

Find all tables that reference a given set of tables via foreign keys:

```sql
SELECT DISTINCT
    CONCAT(SCHEMA_NAME(FK_TABLE.schema_id), '.', FK_TABLE.name)  AS ChildTable,
    CONCAT(SCHEMA_NAME(PK_TABLE.schema_id), '.', PK_TABLE.name)  AS ParentTable
FROM sys.foreign_keys FK
    INNER JOIN sys.tables FK_TABLE
        ON FK_TABLE.object_id = FK.parent_object_id
    INNER JOIN sys.tables PK_TABLE
        ON PK_TABLE.object_id = FK.referenced_object_id
WHERE PK_TABLE.name IN ('Table1', 'Table2', 'Table3', 'Table4')
    AND SCHEMA_NAME(PK_TABLE.schema_id) IN ('Scheam1', 'Schema2')
ORDER BY
    CONCAT(SCHEMA_NAME(FK_TABLE.schema_id), '.', FK_TABLE.name),
    CONCAT(SCHEMA_NAME(PK_TABLE.schema_id), '.', PK_TABLE.name);
```

---

## List All Foreign Keys in the Database

```sql
SELECT
    CONCAT(SCHEMA_NAME(FK_TABLE.schema_id), '.', FK_TABLE.name)  AS ChildTable,
    FK_COL.name                                                   AS ChildColumn,
    CONCAT(SCHEMA_NAME(PK_TABLE.schema_id), '.', PK_TABLE.name)  AS ParentTable,
    PK_COL.name                                                   AS ParentColumn,
    FK.name                                                       AS ForeignKeyName,
    FK.delete_referential_action_desc                             AS OnDelete,
    FK.update_referential_action_desc                             AS OnUpdate
FROM sys.foreign_keys FK
    INNER JOIN sys.tables FK_TABLE
        ON FK_TABLE.object_id = FK.parent_object_id
    INNER JOIN sys.tables PK_TABLE
        ON PK_TABLE.object_id = FK.referenced_object_id
    INNER JOIN sys.foreign_key_columns FKC
        ON FKC.constraint_object_id = FK.object_id
    INNER JOIN sys.columns FK_COL
        ON FK_COL.object_id = FKC.parent_object_id
       AND FK_COL.column_id = FKC.parent_column_id
    INNER JOIN sys.columns PK_COL
        ON PK_COL.object_id = FKC.referenced_object_id
       AND PK_COL.column_id = FKC.referenced_column_id
ORDER BY ChildTable, ParentTable;
```

---

## Check for Missing Indexes on Foreign Key Columns

Foreign key columns without an index can cause locking and performance issues during DELETE/UPDATE on the parent table:

```sql
SELECT
    CONCAT(SCHEMA_NAME(FK_TABLE.schema_id), '.', FK_TABLE.name) AS ChildTable,
    FK_COL.name                                                  AS FKColumn,
    FK.name                                                      AS ForeignKeyName
FROM sys.foreign_keys FK
    INNER JOIN sys.tables FK_TABLE
        ON FK_TABLE.object_id = FK.parent_object_id
    INNER JOIN sys.foreign_key_columns FKC
        ON FKC.constraint_object_id = FK.object_id
    INNER JOIN sys.columns FK_COL
        ON FK_COL.object_id = FKC.parent_object_id
       AND FK_COL.column_id = FKC.parent_column_id
WHERE NOT EXISTS (
    SELECT 1
    FROM sys.index_columns IC
    INNER JOIN sys.indexes I ON IC.object_id = I.object_id AND IC.index_id = I.index_id
    WHERE IC.object_id = FK_TABLE.object_id
      AND IC.column_id = FK_COL.column_id
      AND IC.key_ordinal = 1
)
ORDER BY ChildTable, FKColumn;
```

---

## Disable / Enable Foreign Key Constraints

Useful during large data loads or migrations:

```sql
-- Disable a specific FK
ALTER TABLE dbo.OrderItems NOCHECK CONSTRAINT FK_OrderItems_Orders;

-- Re-enable and verify existing data
ALTER TABLE dbo.OrderItems WITH CHECK CHECK CONSTRAINT FK_OrderItems_Orders;

-- Disable ALL FK constraints on a table
ALTER TABLE dbo.OrderItems NOCHECK CONSTRAINT ALL;

-- Re-enable ALL FK constraints
ALTER TABLE dbo.OrderItems WITH CHECK CHECK CONSTRAINT ALL;
```

> **Warning:** `WITH CHECK` verifies existing data against the constraint. Always use it when re-enabling to ensure data integrity.

---

## List All Indexes on a Table

```sql
SELECT
    i.name            AS IndexName,
    i.type_desc       AS IndexType,
    i.is_unique,
    i.is_primary_key,
    STRING_AGG(c.name, ', ')
        WITHIN GROUP (ORDER BY ic.key_ordinal) AS IndexColumns
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE OBJECT_NAME(i.object_id) = 'YourTableName'
  AND i.type > 0  -- exclude heap
GROUP BY i.name, i.type_desc, i.is_unique, i.is_primary_key
ORDER BY i.is_primary_key DESC, i.is_unique DESC, i.name;
```

---

## Key Takeaways

1. Always check FK relationships **before dropping or renaming** a table or column
2. Foreign key columns on the **child table** should always be indexed to avoid lock escalation
3. Use `NOCHECK CONSTRAINT` during bulk loads, then re-enable with `WITH CHECK CHECK CONSTRAINT`
4. `STRING_AGG` requires SQL Server 2017+ — use `FOR XML PATH` as an alternative on older versions
5. `delete_referential_action_desc` shows whether the FK uses CASCADE, SET NULL, SET DEFAULT, or NO ACTION

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/Dependencies\|Object Dependencies]]
- [[docs/tsql/snippets/SysTables\|Sys Tables & Schema Queries]]

---

## Sources

- [sys.foreign_keys](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-foreign-keys-transact-sql)
- [sys.indexes](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-indexes-transact-sql)
- [ALTER TABLE (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-transact-sql)

---

#tsql #sql-server #foreign-keys #indexes #schema
