---
{"dg-publish":true,"permalink":"/docs/tsql/dynamic-sql/","tags":["tsql","sql-server","dynamic-sql","sp-executesql"]}
---

# Dynamic SQL

## Overview

Dynamic SQL in SQL Server refers to constructing and executing SQL statements **at runtime**, rather than as a pre-defined stored procedure or query. It allows building flexible SQL based on variables, user input, or application logic.

---

## When to Use Dynamic SQL

- Table or column names are determined at runtime
- Conditional `WHERE` clauses or `ORDER BY` columns vary per call
- Building generic admin or ETL utilities
- Executing DDL statements within a procedure

> **Caution:** Dynamic SQL increases complexity, bypasses compile-time validation, and can introduce SQL injection risks if not handled carefully. Always prefer `sp_executesql` with parameters over string concatenation.

---

## sp_executesql (Recommended)

`sp_executesql` is the preferred method for executing dynamic SQL. It supports **parameterized queries**, which protects against SQL injection and enables **plan reuse**.

### Syntax

```sql
EXEC sp_executesql
    @statement          = N'SQL statement with @params',
    @params             = N'@param1 DataType, @param2 DataType',
    @param1             = value1,
    @param2             = value2;
```

---

## Examples

### Dynamic WHERE Clause

```sql
DECLARE @JobTitle NVARCHAR(50) = 'Manager';
DECLARE @SQL      NVARCHAR(MAX);

SET @SQL = N'SELECT * FROM Employees WHERE JobTitle = @JobTitle';

EXEC sp_executesql
    @SQL,
    N'@JobTitle NVARCHAR(50)',
    @JobTitle = @JobTitle;
```

### Dynamic Table Name

When the table name is a variable, use `QUOTENAME()` to safely escape it:

```sql
DECLARE @TableName NVARCHAR(128) = 'Customers';
DECLARE @SQL       NVARCHAR(MAX);

SET @SQL = N'SELECT * FROM ' + QUOTENAME(@TableName);

EXEC sp_executesql @SQL;
```

> `QUOTENAME()` wraps the name in square brackets, preventing SQL injection via table names.

### Dynamic Column List

```sql
DECLARE @ColumnList NVARCHAR(MAX) = 'FirstName, LastName, Email';
DECLARE @SQL        NVARCHAR(MAX);

SET @SQL = N'SELECT ' + @ColumnList + N' FROM Employees';

EXEC sp_executesql @SQL;
```

### Dynamic WHERE + Parameter (Full Example)

```sql
EXEC sp_executesql
    N'SELECT *
      FROM dbo.products
      WHERE list_price > @listPrice
        AND category_id = @categoryId
      ORDER BY list_price DESC',
    N'@listPrice DECIMAL(10,2), @categoryId INT',
    @listPrice   = 100,
    @categoryId  = 1;
```

### Capturing Output Parameters

```sql
DECLARE @RowCount INT;
DECLARE @SQL NVARCHAR(MAX);

SET @SQL = N'SELECT @cnt = COUNT(*) FROM dbo.Orders WHERE Status = @status';

EXEC sp_executesql
    @SQL,
    N'@status NVARCHAR(50), @cnt INT OUTPUT',
    @status = 'Pending',
    @cnt    = @RowCount OUTPUT;

PRINT 'Pending orders: ' + CAST(@RowCount AS NVARCHAR);
```

---

## EXEC vs sp_executesql

| Feature | `EXEC` | `sp_executesql` |
|---------|--------|-----------------|
| Parameterized queries | No | Yes |
| SQL injection protection | No | Yes (with params) |
| Plan caching / reuse | No | Yes |
| Output parameters | No | Yes |
| Recommended for | Simple one-off statements | All production use |

---

## Building Dynamic SQL Safely

### DO: Use Parameters for Values

```sql
-- Safe: value is parameterized
SET @SQL = N'SELECT * FROM dbo.Orders WHERE CustomerId = @Id';
EXEC sp_executesql @SQL, N'@Id INT', @Id = @CustomerId;
```

### DON'T: Concatenate User Input Directly

```sql
-- Dangerous: SQL injection risk
SET @SQL = N'SELECT * FROM dbo.Orders WHERE CustomerId = ' + @CustomerId;
EXEC(@SQL);
```

### DO: Use QUOTENAME for Object Names

```sql
-- Safe table name
SET @SQL = N'SELECT * FROM ' + QUOTENAME(@Schema) + '.' + QUOTENAME(@Table);
```

---

## Key Takeaways

1. **Always use `sp_executesql`** over `EXEC` for dynamic SQL in production
2. Use **parameters** for all user-supplied values — never concatenate them directly
3. Use **`QUOTENAME()`** when dynamically building object names (tables, schemas, columns)
4. Dynamic SQL bypasses **compile-time checks** — test thoroughly
5. Dynamic SQL is not tracked in **object dependency** views
6. Parameterized `sp_executesql` allows the query plan to be **cached and reused**

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/Dependencies\|Object Dependencies]]
- [[docs/tsql/snippets/StoredProcedures\|Stored Procedures]]

---

## Sources

- [sp_executesql (T-SQL)](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql)
- [SQL Server Dynamic SQL Tutorial](https://www.sqlservertutorial.net/sql-server-stored-procedures/sql-server-dynamic-sql/)

---

#tsql #sql-server #dynamic-sql #sp-executesql #security
