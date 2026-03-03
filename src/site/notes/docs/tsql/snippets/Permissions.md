---
{"dg-publish":true,"permalink":"/docs/tsql/snippets/permissions/","tags":["tsql","sql-server","permissions","security","grant","revoke"]}
---

# Permissions (GRANT / REVOKE)

## Overview

SQL Server manages permissions at two levels: **server level** (logins and server roles) and **database level** (database users and database roles). Every securable has associated permissions that can be granted, denied, or revoked from a principal.

---

## GRANT

Grants a permission on a securable to a principal:

```sql
-- Syntax: GRANT <permission> ON <object> TO <principal>
USE DatabaseName;
GO

GRANT SELECT ON dbo.products TO User;
GO
```

### Common Permissions

| Permission | Description |
|------------|-------------|
| `SELECT` | Read data |
| `INSERT` | Add rows |
| `UPDATE` | Modify rows |
| `DELETE` | Remove rows |
| `EXECUTE` | Run stored procedures / functions |
| `VIEW DEFINITION` | See object definitions |
| `CONTROL` | Full control (like ownership) |

---

## REVOKE

Removes a previously granted or denied permission:

```sql
REVOKE SELECT ON dbo.products FROM User;
```

---

## DENY

Explicitly denies a permission (overrides GRANT, even through role membership):

```sql
DENY DELETE ON dbo.Orders TO ReadOnlyUser;
```

---

## Check Permissions on a Specific Table

```sql
DECLARE @TableName NVARCHAR(128) = 'dbo.products';

SELECT
    dp.name                                            AS Principal,
    dp.type_desc                                       AS PrincipalType,
    CONCAT(SCHEMA_NAME(o.schema_id), '.', o.name)      AS ObjectName,
    o.type_desc                                        AS ObjectType,
    p.permission_name,
    p.state_desc                                       AS PermissionState
FROM sys.database_permissions p
    JOIN sys.objects o
        ON p.major_id = o.object_id
    JOIN sys.database_principals dp
        ON p.grantee_principal_id = dp.principal_id
WHERE CONCAT(SCHEMA_NAME(o.schema_id), '.', o.name) = @TableName
ORDER BY dp.name, p.permission_name;
```

---

## Check All Permissions for a Specific User

```sql
USE DatabaseName;
GO

SELECT
    s.name           AS SchemaName,
    o.name           AS ObjectName,
    dp.name          AS UserName,
    p.permission_name,
    p.state_desc     AS PermissionState
FROM sys.database_permissions p
    INNER JOIN sys.objects o
        ON p.major_id = o.object_id
    INNER JOIN sys.schemas s
        ON o.schema_id = s.schema_id
    INNER JOIN sys.database_principals dp
        ON p.grantee_principal_id = dp.principal_id
WHERE dp.name = 'SQL_User'
ORDER BY SchemaName, ObjectName;
```

---

## Find All Logins with Permissions on a Stored Procedure

```sql
USE DatabaseName;
GO

SELECT
    sp.name  AS StoredProcedureName,
    p.name   AS PrincipalName,
    pe.permission_name,
    pe.state_desc AS PermissionState
FROM sys.procedures sp
    INNER JOIN sys.database_permissions pe
        ON sp.object_id = pe.major_id
    INNER JOIN sys.database_principals p
        ON pe.grantee_principal_id = p.principal_id
WHERE sp.name = 'YourStoredProcedureName'
ORDER BY p.name;
```

---

## Check Permissions via Built-in Procedure

```sql
USE DatabaseName;
GO

EXEC sp_table_privileges
    @table_name = 'products';
```

---

## Create a Database User from a Login

```sql
USE [ContentCatalog];
GO

CREATE USER [CatalogAuthoring_rp] FOR LOGIN [CatalogAuthoring_rp];
GO
```

---

## Impersonate (EXECUTE AS)

Test permissions or execute code under a different security context:

```sql
-- Execute as a different user
EXECUTE AS USER = 'testUser';

    SELECT * FROM dbo.SomeTable;   -- runs as testUser

REVERT;  -- returns to original context
```

```sql
-- Execute as a different login (requires IMPERSONATE permission)
EXECUTE AS LOGIN = 'DomainUser';

    -- code runs under DomainUser's permissions

REVERT;
```

### Grant Impersonate Permission

```sql
GRANT IMPERSONATE ON USER::[testUser] TO [yourAdminUser];
```

> **Security note:** Use `EXECUTE AS` only for testing or scoped admin tasks. Always `REVERT` after use and audit impersonation usage.

---

## Key Takeaways

1. Use `GRANT` to assign permissions, `REVOKE` to remove them, `DENY` to explicitly block them
2. `DENY` overrides `GRANT` — even if a user is a member of a role that has `GRANT`, a direct `DENY` wins
3. Query `sys.database_permissions` for a complete, programmatic view of all permissions
4. Use `EXECUTE AS` to test permissions without logging in as the target user
5. Always `REVERT` after using `EXECUTE AS` to restore the original security context

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/snippets/SysTables\|Sys Tables & Schema Queries]]

---

## Sources

- [GRANT (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/statements/grant-transact-sql)
- [REVOKE (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/statements/revoke-transact-sql)
- [EXECUTE AS (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/statements/execute-as-transact-sql)
- [Permissions (Database Engine)](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine)

---

#tsql #sql-server #permissions #security #grant #revoke
