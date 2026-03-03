---
{"dg-publish":true,"permalink":"/docs/tsql/linked-server/","tags":["tsql","sql-server","linked-server","performance"]}
---

# Linked Server Performance

## Overview

Linked servers allow SQL Server to execute queries against remote data sources. However, naive usage — particularly with 4-part names in joins — can cause the **entire remote table to be transferred over the network** to the local server, resulting in very slow queries.

---

## The Problem: 4-Part Name in a JOIN

When you use a 4-part name (`[server].db.schema.table`) inside a `JOIN`, SQL Server often pulls the **entire remote table** over the wire before filtering:

```sql
-- Potentially very slow: entire remote table transferred first
SELECT l.*, local.Name
FROM [LINKEDSERVER].RemoteDB.dbo.Orders l
JOIN dbo.LocalCustomers local ON l.CustomerId = local.Id
WHERE l.OrderDate > '2024-01-01';
```

---

## Solution 1: OPENQUERY (Best for Filtering at Source)

`OPENQUERY` pushes the query **to the linked server** to execute, returning only the filtered result set:

```sql
-- Remote server handles filtering, only results come back
SELECT *
FROM OPENQUERY(
    [LINKEDSERVER],
    'SELECT * FROM RemoteDB.dbo.Orders WHERE OrderDate > ''2024-01-01'''
)
local_filter
WHERE local_filter.CustomerId IN (SELECT Id FROM dbo.LocalCustomers);
```

> **Note:** String literals inside `OPENQUERY` must escape single quotes by doubling them (`''`).

---

## Solution 2: Push Local IDs to Remote Server

For large local datasets, copy local keys to the remote server, run the join there, then retrieve results:

```sql
-- Step 1: Copy local IDs to the remote server
DECLARE @SQL NVARCHAR(MAX);
SET @SQL = N'SELECT Id INTO RemoteDB.dbo.tmpLocalIds FROM OPENQUERY([LOCALSERVER], ''SELECT Id FROM dbo.LocalCustomers'')';
EXEC(@SQL) AT [LINKEDSERVER];

-- Step 2: (Optional) Index the remote temp table for performance
SET @SQL = N'CREATE INDEX IX_tmpLocalIds ON RemoteDB.dbo.tmpLocalIds (Id)';
EXEC(@SQL) AT [LINKEDSERVER];

-- Step 3: Run the join entirely on the remote server
SELECT *
FROM OPENQUERY([LINKEDSERVER], '
    SELECT o.*
    FROM RemoteDB.dbo.Orders o
    WHERE o.OrderDate > ''2024-01-01''
      AND o.CustomerId IN (SELECT Id FROM RemoteDB.dbo.tmpLocalIds)
');

-- Step 4: Clean up remote temp table
SET @SQL = N'DROP TABLE RemoteDB.dbo.tmpLocalIds';
EXEC(@SQL) AT [LINKEDSERVER];
```

---

## Solution 3: Remote Query via OPENQUERY Back to Local

If the local view is also large, execute a remote query that uses `OPENQUERY` back to the local machine (requires the remote server to have the local as a linked server):

```sql
DECLARE @SQL NVARCHAR(MAX);
SET @SQL = N'SELECT Id INTO RemoteDB.dbo.tmpLocalIds
             FROM OPENQUERY([LOCALSERVER], ''SELECT Id FROM LocalDB.dbo.LocalView'')';
EXEC(@SQL) AT [LINKEDSERVER];
```

---

## Comparison

| Approach | When to Use | Trade-off |
|----------|-------------|-----------|
| 4-part name | Simple selects, small tables | Full table transfer on JOINs |
| `OPENQUERY` | Filter-heavy queries, large remote tables | Single query string, no dynamic params |
| Push IDs to remote | Large local lookup, complex remote logic | Extra round-trips, temp table cleanup needed |

---

## Dynamic OPENQUERY

`OPENQUERY` does not support variables natively — use dynamic SQL:

```sql
DECLARE @Date    NVARCHAR(20) = '2024-01-01';
DECLARE @SQL     NVARCHAR(MAX);

SET @SQL = N'SELECT * FROM OPENQUERY([LINKEDSERVER], ''
    SELECT * FROM RemoteDB.dbo.Orders
    WHERE OrderDate > ''''' + @Date + '''''
'')';

EXEC sp_executesql @SQL;
```

---

## Key Takeaways

1. **4-part names in JOINs** transfer the full remote table locally — avoid for large tables
2. Use **`OPENQUERY`** to push filtering to the remote server and reduce network traffic
3. For complex joins with large local tables, **push local IDs to the remote server**
4. `OPENQUERY` does not support parameters — use dynamic SQL when values are dynamic
5. Always add an index to any remote temp table created for the purpose of joining
6. Clean up remote temp tables after use — they are not automatically dropped

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/DynamicSQL\|Dynamic SQL]]
- [[docs/tsql/ExecutionPlans\|Execution Plans]]

---

## Sources

- [SQL Linked Server Query Slow (Stack Overflow)](https://stackoverflow.com/questions/24272652/sql-linked-server-query-very-very-slow)
- [Linked Server Performance (DBA Stack Exchange)](https://dba.stackexchange.com/questions/10873/sql-server-linked-server-performance-why-are-remote-queries-so-expensive)
- [OPENQUERY (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/functions/openquery-transact-sql)

---

#tsql #sql-server #linked-server #performance #openquery
