---
{"dg-publish":true,"permalink":"/docs/tsql/snippets/cdc/","tags":["tsql","sql-server","cdc","change-data-capture","etl"]}
---

# Change Data Capture (CDC)

## Overview

Change Data Capture (CDC) is a SQL Server feature that records INSERT, UPDATE, and DELETE activity on tables. CDC reads changes from the transaction log and exposes them through system functions and views — making it a reliable foundation for ETL and data synchronization pipelines.

---

## Query CDC Capture Instance Metadata

Retrieve metadata about a CDC capture instance, including when tracking started:

```sql
SELECT
    ct.object_id,
    ct.capture_instance,
    sys.fn_cdc_map_lsn_to_time(ct.start_lsn) AS commit_time,
    ct.start_lsn,
    ct.create_date
FROM cdc.change_tables ct
WHERE capture_instance LIKE 'Inventory_ItemPricing';
```

**Columns returned:**

| Column | Description |
|--------|-------------|
| `object_id` | The table ID associated with the capture instance |
| `capture_instance` | The CDC capture instance name |
| `commit_time` | Timestamp mapped from `start_lsn` via `sys.fn_cdc_map_lsn_to_time` |
| `start_lsn` | The log sequence number (LSN) where CDC tracking begins |
| `create_date` | When the capture instance was created |

---

## List All CDC-Enabled Tables

```sql
SELECT
    ct.capture_instance,
    OBJECT_SCHEMA_NAME(ct.object_id) AS SchemaName,
    OBJECT_NAME(ct.object_id)        AS TableName,
    sys.fn_cdc_map_lsn_to_time(ct.start_lsn) AS TrackingSince,
    ct.create_date
FROM cdc.change_tables ct
ORDER BY SchemaName, TableName;
```

---

## Check if CDC Is Enabled on a Database

```sql
SELECT name, is_cdc_enabled
FROM sys.databases
WHERE name = DB_NAME();
```

---

## Check if CDC Is Enabled on a Table

```sql
SELECT
    name AS TableName,
    is_tracked_by_cdc
FROM sys.tables
WHERE is_tracked_by_cdc = 1
ORDER BY name;
```

---

## Query Change Data

Use the CDC functions to read actual changes. The function name follows the pattern `cdc.fn_cdc_get_all_changes_<capture_instance>`:

```sql
DECLARE @from_lsn BINARY(10) = sys.fn_cdc_get_min_lsn('Inventory_ItemPricing');
DECLARE @to_lsn   BINARY(10) = sys.fn_cdc_get_max_lsn();

SELECT
    __$operation,   -- 1=Delete, 2=Insert, 3=Before Update, 4=After Update
    __$start_lsn,
    sys.fn_cdc_map_lsn_to_time(__$start_lsn) AS ChangeTime,
    *
FROM cdc.fn_cdc_get_all_changes_Inventory_ItemPricing(
    @from_lsn, @to_lsn, 'all'
)
ORDER BY __$start_lsn;
```

**Operation codes:**

| Code | Meaning |
|------|---------|
| `1` | DELETE |
| `2` | INSERT |
| `3` | Before image of UPDATE |
| `4` | After image of UPDATE |

---

## Get Changes Since Last ETL Run

```sql
DECLARE @last_lsn BINARY(10);
DECLARE @current_lsn BINARY(10) = sys.fn_cdc_get_max_lsn();

-- Retrieve the watermark from your ETL control table
SELECT @last_lsn = LastProcessedLSN
FROM etl.WatermarkTable
WHERE TableName = 'Inventory_ItemPricing';

-- Get only new changes
SELECT *
FROM cdc.fn_cdc_get_all_changes_Inventory_ItemPricing(
    @last_lsn, @current_lsn, 'all update old'
)
WHERE __$operation IN (2, 4);  -- Inserts and After-Updates only

-- Update watermark after processing
UPDATE etl.WatermarkTable
SET LastProcessedLSN = @current_lsn
WHERE TableName = 'Inventory_ItemPricing';
```

---

## When to Use This Query

- **Verify** that a CDC capture instance exists for a specific table
- **Check when CDC started tracking** changes (using `start_lsn` and `commit_time`)
- **Confirm the creation date** of the capture instance
- **Troubleshoot or validate** CDC setup during ETL or replication processes
- **ETL watermark management** — track last processed LSN

---

## Key Takeaways

1. CDC reads from the **transaction log** — it has minimal impact on source table performance
2. Use `sys.fn_cdc_map_lsn_to_time()` to convert LSN values to readable timestamps
3. Operation code `4` (after-update) is what you typically want for ETL; code `3` gives the before image
4. Always store your **last processed LSN** in a watermark table for reliable incremental loads
5. CDC capture instances accumulate data until purged — configure retention with `sys.sp_cdc_change_job`

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/snippets/UpdateInBatches\|Update Records in Batches]]

---

## Sources

- [Change Data Capture (SQL Server)](https://learn.microsoft.com/en-us/sql/relational-databases/track-changes/about-change-data-capture-sql-server)
- [cdc.fn_cdc_get_all_changes](https://learn.microsoft.com/en-us/sql/relational-databases/system-functions/cdc-fn-cdc-get-all-changes-capture-instance-transact-sql)

---

#tsql #sql-server #cdc #change-data-capture #etl
