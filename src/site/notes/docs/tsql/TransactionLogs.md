---
{"dg-publish":true,"permalink":"/docs/tsql/transaction-logs/","tags":["tsql","sql-server","transaction-logs","tempdb","performance","delete"]}
---

# Transaction Logs & Massive Deletes

## Overview

When performing a **massive DELETE** operation in SQL Server, the transaction log and `tempdb` can grow rapidly, causing performance issues, disk space exhaustion, and contention that blocks other sessions.

---

## Why Massive Deletes Are Expensive

### Transaction Log Impact

| Cause | Detail |
|-------|--------|
| **Row-level logging** | Every deleted row is logged to maintain ACID durability |
| **Log growth** | Large deletes can consume gigabytes of log space |
| **Log contention** | Large active transactions prevent log truncation |
| **Blocked transactions** | Other sessions may be blocked waiting for log space |

### tempdb Impact

| Cause | Detail |
|-------|--------|
| **Sorting / spooling** | Complex WHERE clauses may spill to tempdb |
| **Version store** | Snapshot Isolation keeps old row versions in tempdb during the delete |
| **Internal work tables** | Optimizer may use tempdb as workspace for large operations |

---

## Strategies to Mitigate Impact

### 1. Batch Deletes (Most Important)

Delete in small batches to allow the log to truncate between iterations:

```sql
DECLARE @BatchSize INT = 10000;
DECLARE @RowsDeleted INT = @BatchSize;

WHILE @RowsDeleted = @BatchSize
BEGIN
    DELETE TOP (@BatchSize)
    FROM dbo.AuditLog
    WHERE CreatedDate < '2022-01-01';

    SET @RowsDeleted = @@ROWCOUNT;

    -- Optional: brief pause to reduce contention
    -- WAITFOR DELAY '00:00:01';
END
```

### 2. TRUNCATE TABLE (Full Table Clear Only)

When you need to delete **all rows**, `TRUNCATE` is minimally logged and much faster:

```sql
-- Removes all rows, resets identity seed, minimal logging
TRUNCATE TABLE dbo.AuditLog;
```

> `TRUNCATE` requires no `WHERE` clause and cannot be used with filtered deletes. It also requires the table to have no foreign key references.

### 3. Switch to Simple Recovery Model Temporarily

Reduces per-row logging overhead (only for non-critical data — ensure a backup strategy is in place):

```sql
ALTER DATABASE MyDatabase SET RECOVERY SIMPLE;
GO

-- Perform the large delete...
DELETE FROM dbo.AuditLog WHERE CreatedDate < '2022-01-01';

GO
ALTER DATABASE MyDatabase SET RECOVERY FULL;
```

### 4. Partition Elimination (Best for Regularly Purged Data)

Design tables with partitioning so old data can be eliminated by switching out an entire partition:

```sql
-- Switch partition to staging table (near-instant, minimal logging)
ALTER TABLE dbo.AuditLog SWITCH PARTITION 1 TO dbo.AuditLog_Archive PARTITION 1;

-- Then truncate the archive
TRUNCATE TABLE dbo.AuditLog_Archive;
```

### 5. Regular Transaction Log Backups

Prevent log file from growing unbounded by ensuring regular log backups (Full/Bulk-Logged recovery):

```sql
BACKUP LOG MyDatabase TO DISK = 'D:\Backups\MyDatabase_log.bak';
```

### 6. Rebuild Indexes After Large Deletes

Fragmentation increases significantly after large deletes:

```sql
-- Rebuild all indexes on the affected table
ALTER INDEX ALL ON dbo.AuditLog REBUILD;

-- Or reorganize for lighter maintenance
ALTER INDEX ALL ON dbo.AuditLog REORGANIZE;
```

### 7. Monitor tempdb During the Operation

```sql
-- Check version store size during operation
SELECT
    SUM(version_store_reserved_page_count) * 8 / 1024 AS VersionStoreMB
FROM sys.dm_db_session_space_usage;
```

---

## Recommended Delete Pattern for ETL / Purge Jobs

```sql
SET NOCOUNT ON;

DECLARE @BatchSize    INT = 10000;
DECLARE @TotalDeleted INT = 0;
DECLARE @RowsDeleted  INT = @BatchSize;
DECLARE @CutoffDate   DATE = DATEADD(YEAR, -2, GETDATE());

PRINT 'Starting purge of records older than ' + CAST(@CutoffDate AS NVARCHAR);

WHILE @RowsDeleted = @BatchSize
BEGIN
    DELETE TOP (@BatchSize)
    FROM dbo.AuditLog
    WHERE CreatedDate < @CutoffDate;

    SET @RowsDeleted  = @@ROWCOUNT;
    SET @TotalDeleted += @RowsDeleted;

    PRINT 'Deleted batch: ' + CAST(@RowsDeleted AS NVARCHAR)
        + ' | Total: ' + CAST(@TotalDeleted AS NVARCHAR);
END

PRINT 'Purge complete. Total deleted: ' + CAST(@TotalDeleted AS NVARCHAR);
```

---

## Strategy Comparison

| Strategy | Use When | Log Impact |
|----------|----------|------------|
| **Batch DELETE** | Most scenarios | Low (per batch) |
| **TRUNCATE TABLE** | Deleting all rows | Minimal |
| **Partition switch** | Large time-series data | Minimal |
| **Simple recovery (temp)** | Bulk operations, non-critical | Reduced |
| **Index rebuild after** | Post-delete maintenance | Separate operation |

---

## Key Takeaways

1. **Always batch** large deletes — never delete millions of rows in a single transaction
2. Use `TRUNCATE TABLE` when clearing entire tables — it is minimally logged
3. For regularly purged data, design tables with **partitioning** for near-instant elimination
4. Take **regular transaction log backups** (Full recovery model) to allow log truncation
5. Rebuild indexes after significant deletes to address fragmentation
6. Monitor tempdb version store if Snapshot Isolation is in use during the operation

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/Transactions\|Transactions]]
- [[docs/tsql/TempDB\|TempDB]]
- [[docs/tsql/snippets/UpdateInBatches\|Update Records in Batches]]

---

## Sources

- [Transaction Log Architecture](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-log-architecture-and-management-guide)
- [Minimally Logged Operations](https://learn.microsoft.com/en-us/sql/relational-databases/import-export/prerequisites-for-minimal-logging-in-bulk-import)
- [Table Partitioning](https://learn.microsoft.com/en-us/sql/relational-databases/partitions/partitioned-tables-and-indexes)

---

#tsql #sql-server #transaction-logs #tempdb #delete #performance
