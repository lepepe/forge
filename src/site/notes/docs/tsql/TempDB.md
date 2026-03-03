---
{"dg-publish":true,"permalink":"/docs/tsql/temp-db/","tags":["tsql","sql-server","tempdb","performance"]}
---

# TempDB

## Overview

`tempdb` is a SQL Server system database used for **temporary storage**. It is shared across all sessions connected to the SQL Server instance and is re-created every time SQL Server restarts.

---

## What tempdb Stores

| Object Type | Description |
|-------------|-------------|
| **Temporary tables** (`#temp`, `##global`) | Session-scoped or globally scoped temp tables |
| **Table variables** (`@table`) | Stored in tempdb internally |
| **Internal work tables** | Sorting, hashing, spooling during query execution |
| **Version store** | Row versions for Snapshot Isolation (RCSI/SI) |
| **Cursors** | Cursor result sets |

---

## Key Characteristics

1. **Simple recovery model** — tempdb cannot be backed up; it is recreated on restart
2. **Shared resource** — all sessions use the same tempdb; contention is a common issue in high-concurrency environments
3. **Auto-growth** — tempdb grows as needed, but uncontrolled growth can consume disk space
4. **Multi-file configuration** — adding multiple data files (one per CPU core, up to 8) reduces allocation page contention

---

## Common Causes of tempdb Growth

```
Large Transactions       → More undo/redo logging in tempdb
Long-Running Transactions → Log space stays reserved until commit/rollback
Undropped Temp Tables    → Occupy space until session ends
Index Maintenance        → Rebuilds use tempdb as sort/merge workspace
High Volume of Temp Objs → Many short-lived temp tables accumulate overhead
Version Store Activity   → Snapshot Isolation keeps old row versions in tempdb
Replication / CDC        → Additional logging in tempdb for change tracking
```

---

## Monitor tempdb Usage

### Space Usage

```sql
-- Overall tempdb file usage
SELECT
    name,
    physical_name,
    size * 8 / 1024            AS SizeMB,
    FILEPROPERTY(name, 'SpaceUsed') * 8 / 1024 AS UsedMB,
    (size - FILEPROPERTY(name, 'SpaceUsed')) * 8 / 1024 AS FreeMB
FROM tempdb.sys.database_files;
```

### Top Sessions Using tempdb

```sql
SELECT TOP 20
    s.session_id,
    s.login_name,
    s.host_name,
    tsu.user_objects_alloc_page_count     * 8 / 1024 AS UserObjMB,
    tsu.internal_objects_alloc_page_count * 8 / 1024 AS InternalObjMB,
    tsu.version_store_reserved_page_count * 8 / 1024 AS VersionStoreMB
FROM sys.dm_db_session_space_usage tsu
JOIN sys.dm_exec_sessions s ON tsu.session_id = s.session_id
WHERE tsu.user_objects_alloc_page_count > 0
   OR tsu.internal_objects_alloc_page_count > 0
ORDER BY (tsu.user_objects_alloc_page_count + tsu.internal_objects_alloc_page_count) DESC;
```

### Find Active Temp Tables

```sql
SELECT
    s.session_id,
    s.login_name,
    t.name AS TempTableName,
    t.create_date
FROM tempdb.sys.tables t
JOIN sys.dm_exec_sessions s
    ON t.name LIKE '%' + CAST(s.session_id AS VARCHAR) + '%'
ORDER BY t.create_date DESC;
```

---

## Best Practices

### 1. Always Drop Temp Tables Explicitly

```sql
DROP TABLE IF EXISTS #MyTempTable;
-- ... create and use ...
DROP TABLE IF EXISTS #MyTempTable;  -- drop when done
```

### 2. Use Table Variables for Small Result Sets

```sql
-- Better for small sets (< ~1000 rows): avoids tempdb log overhead
DECLARE @Results TABLE (Id INT, Name NVARCHAR(100));
INSERT INTO @Results SELECT Id, Name FROM dbo.Customers WHERE IsActive = 1;
```

### 3. Avoid Cursors — Use Set-Based Operations

Cursors create large internal work tables in tempdb. Replace with set-based queries or `WHILE` loops with batching.

### 4. Configure Multiple Data Files

```sql
-- Add a second tempdb data file (do this at install time or during maintenance)
ALTER DATABASE tempdb
ADD FILE (
    NAME = tempdev2,
    FILENAME = 'D:\SQLData\tempdb2.mdf',
    SIZE = 512MB,
    FILEGROWTH = 256MB
);
```

> Recommended: one data file per logical CPU core, up to 8 files. All files should be the same initial size.

---

## Impact on Massive DELETE Operations

See [[docs/tsql/TransactionLogs\|Transaction Logs & Massive Deletes]] for strategies when large deletes cause tempdb and log growth.

---

## Key Takeaways

1. `tempdb` is a **shared, system-wide** resource — contention affects all sessions
2. Always **explicitly drop** temp tables when finished with them
3. Monitor tempdb **space usage** and **session allocation** proactively
4. Configure **multiple equally-sized data files** to reduce allocation page contention
5. Snapshot Isolation workloads generate significant **version store** activity in tempdb
6. tempdb uses **Simple recovery** — it cannot be backed up or restored

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/TransactionLogs\|Transaction Logs & Massive Deletes]]
- [[docs/tsql/Transactions\|Transactions]]

---

## Sources

- [tempdb Database](https://learn.microsoft.com/en-us/sql/relational-databases/databases/tempdb-database)
- [Optimizing tempdb Performance](https://learn.microsoft.com/en-us/sql/relational-databases/databases/tempdb-database#optimizing-tempdb-performance-in-sql-server)

---

#tsql #sql-server #tempdb #performance #temporary-tables
