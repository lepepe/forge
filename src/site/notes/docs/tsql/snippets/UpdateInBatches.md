---
{"dg-publish":true,"permalink":"/docs/tsql/snippets/update-in-batches/","tags":["tsql","sql-server","batch","update","performance"]}
---

# Update Records in Batches

## Overview

Updating or deleting millions of rows in a single statement locks the table, floods the transaction log, and can block other sessions for extended periods. Processing in **batches** keeps transactions short, allows log truncation between iterations, and reduces contention.

---

## Simple Batch Update (@@ROWCOUNT Pattern)

Update rows in batches, stopping when no more rows qualify:

```sql
USE DatabaseName;
GO

SET NOCOUNT ON;

DECLARE @BatchSize INT = 20000;
DECLARE @RowsAffected INT = @BatchSize;

WHILE @RowsAffected = @BatchSize
BEGIN
    UPDATE TOP (@BatchSize) I
    SET I.IdsInventoryItemIdentifier = ITN.Ids_Inventory_Item_id
    FROM item.Item I
    INNER JOIN clarkitbiz.products.item_numbers ITN
        ON I.ItemIdentifier = ITN.ID
    WHERE ISNULL(I.IdsInventoryItemIdentifier, 0) <> ISNULL(ITN.Ids_Inventory_Item_id, 0);

    SET @RowsAffected = @@ROWCOUNT;
    PRINT 'Batch processed: ' + CAST(@RowsAffected AS NVARCHAR);
END;

PRINT 'Done.';
```

> The loop exits when `@@ROWCOUNT < @BatchSize`, meaning no more qualifying rows remain.

---

## Batch Update with Staging Table (More Control)

Pre-load the target IDs into a temp table and process in explicit chunks:

```sql
USE DatabaseName;
GO

SET NOCOUNT ON;

DROP TABLE IF EXISTS #ToProcess;
DROP TABLE IF EXISTS #Batch;

-- Step 1: Collect all IDs to process
CREATE TABLE #ToProcess (Ids_Inventory_Item_id INT);
CREATE TABLE #Batch     (IdsInventoryItemIdentifier INT);

INSERT INTO #ToProcess (Ids_Inventory_Item_id)
SELECT Ids_Inventory_Item_id
FROM clarkitbiz.products.item_numbers
WHERE Ids_Inventory_Item_id IS NOT NULL;

PRINT 'Total rows to process: ' + CAST(@@ROWCOUNT AS NVARCHAR);

-- Step 2: Process in batches of 1,000
WHILE EXISTS (SELECT TOP 1 1 FROM #ToProcess)
BEGIN
    TRUNCATE TABLE #Batch;

    -- Grab next batch
    INSERT INTO #Batch (IdsInventoryItemIdentifier)
    SELECT TOP 1000 Ids_Inventory_Item_id
    FROM #ToProcess
    ORDER BY Ids_Inventory_Item_id;

    -- Apply update
    UPDATE I
    SET I.IdsInventoryItemIdentifier = b.IdsInventoryItemIdentifier
    FROM item.Item I
    INNER JOIN #Batch b ON I.ItemIdentifier = b.IdsInventoryItemIdentifier
    WHERE ISNULL(I.IdsInventoryItemIdentifier, 0) <> ISNULL(b.IdsInventoryItemIdentifier, 0);

    -- Remove processed batch from queue
    DELETE t
    FROM #ToProcess t
    INNER JOIN #Batch b ON b.IdsInventoryItemIdentifier = t.Ids_Inventory_Item_id;
END;

DROP TABLE IF EXISTS #ToProcess;
DROP TABLE IF EXISTS #Batch;
```

**Example output:**
```
Total rows to process: 560868
Batch processed: 1000
Batch processed: 1000
...
Batch processed: 850
Total execution time: 00:01:05
```

---

## Generic Batch DELETE Template

```sql
SET NOCOUNT ON;

DECLARE @BatchSize    INT  = 10000;
DECLARE @TotalDeleted INT  = 0;
DECLARE @RowsDeleted  INT  = @BatchSize;
DECLARE @CutoffDate   DATE = DATEADD(YEAR, -2, GETDATE());

WHILE @RowsDeleted = @BatchSize
BEGIN
    DELETE TOP (@BatchSize)
    FROM dbo.AuditLog
    WHERE CreatedDate < @CutoffDate;

    SET @RowsDeleted  = @@ROWCOUNT;
    SET @TotalDeleted += @RowsDeleted;

    PRINT 'Deleted: ' + CAST(@RowsDeleted AS NVARCHAR)
        + ' | Total: ' + CAST(@TotalDeleted AS NVARCHAR);
END;

PRINT 'Purge complete. Total: ' + CAST(@TotalDeleted AS NVARCHAR);
```

---

## When to Use Each Pattern

| Pattern | Best For |
|---------|----------|
| `@@ROWCOUNT` loop | Simple updates where qualifying rows are defined by a WHERE clause |
| Staging table loop | Complex scenarios; explicit control over order and chunk contents |
| Batch DELETE | Data purge / archival jobs |

---

## Performance Tips

1. **Add an index** on the filter column if one doesn't exist — each batch uses it
2. **Commit per batch** — each `UPDATE`/`DELETE` outside an explicit transaction auto-commits, allowing log truncation
3. **Add a small delay** (`WAITFOR DELAY '00:00:01'`) between batches if the server is under heavy load
4. **Use `SET NOCOUNT ON`** to suppress row-count messages from flooding the output
5. **Avoid ORDER BY** inside batch updates unless strictly necessary — it adds overhead

---

## Key Takeaways

1. Never update or delete millions of rows in a **single transaction** in production
2. The `@@ROWCOUNT` pattern is simple and sufficient for most batch update needs
3. The staging table pattern gives more control over batch order and membership
4. Each batch auto-commits — this keeps transaction log usage low and allows other sessions through
5. Monitor `sys.dm_db_session_space_usage` during large batch operations for tempdb usage

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/TransactionLogs\|Transaction Logs & Massive Deletes]]
- [[docs/tsql/Transactions\|Transactions]]
- [[docs/tsql/TempDB\|TempDB]]

---

## Sources

- [@@ROWCOUNT (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/functions/rowcount-transact-sql)
- [TOP Clause with DML](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql)

---

#tsql #sql-server #batch #update #delete #performance
