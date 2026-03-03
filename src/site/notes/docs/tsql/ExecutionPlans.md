---
{"dg-publish":true,"permalink":"/docs/tsql/execution-plans/","tags":["tsql","sql-server","execution-plans","performance","tuning"]}
---

# Execution Plans

## Overview

An execution plan is the roadmap SQL Server's query optimizer generates to execute a query. Understanding execution plans is fundamental to diagnosing and fixing performance bottlenecks.

---

## Key Metrics

### CPU
The amount of CPU time consumed by a query, measured in milliseconds. High CPU often indicates:
- Complex calculations or functions
- Missing indexes forcing large in-memory sorts
- Parameter sniffing causing a bad plan to be reused
- A new plan being compiled on every execution (no plan caching)

### Reads (Logical Reads)
The number of pages read from the **data cache** (memory). This is the most important I/O metric.

> **Rule of thumb:** Prefer plans with fewer reads. Fewer reads means more data stayed in memory and less disk I/O was required.

| Metric | High Value Suggests |
|--------|---------------------|
| CPU | Complex operations, missing indexes, frequent recompiles |
| Logical Reads | Table/index scans, missing indexes, too much data returned |
| Physical Reads | Data not in cache (cold cache or large dataset) |

---

## Seek vs Scan

| Operation | Description | Performance |
|-----------|-------------|-------------|
| **Index Seek** | Navigates directly to matching rows via index B-tree | Fast |
| **Index Scan** | Reads all (or most) rows of an index | Slower |
| **Table Scan** | Reads the entire table (no usable index) | Slowest |

A common sign of an implicit conversion or cardinality issue is an unexpected **index scan** where a **seek** was expected.

---

## View the Execution Plan

```sql
-- Estimated plan (no query execution)
SET SHOWPLAN_ALL ON;
GO
SELECT * FROM dbo.Orders WHERE CustomerId = 1;
GO
SET SHOWPLAN_ALL OFF;

-- Actual plan (runs the query)
SET STATISTICS PROFILE ON;
GO
SELECT * FROM dbo.Orders WHERE CustomerId = 1;
GO
SET STATISTICS PROFILE OFF;
```

Or use **SSMS / Azure Data Studio**: press `Ctrl+M` to include the actual execution plan before running.

---

## Inspect Cached Plans

Find the cached plan for a specific stored procedure:

```sql
USE [ContentCatalog];
GO

DECLARE @plan_handle VARBINARY(64);

SELECT @plan_handle = cp.plan_handle
FROM sys.dm_exec_cached_plans AS cp
CROSS APPLY sys.dm_exec_sql_text(cp.plan_handle) AS st
WHERE st.objectid = OBJECT_ID('brandManagement.StoGetFeatureCategoryProducts')
  AND st.dbid = DB_ID();

SELECT @plan_handle AS PlanHandle;
```

### Clear a Single Plan from Cache

```sql
-- Only run if you have confirmed the plan is causing issues
IF @plan_handle IS NOT NULL
BEGIN
    DBCC FREEPROCCACHE(@plan_handle);
END
ELSE
BEGIN
    PRINT 'Plan not found in cache.';
END
```

> **Warning:** Clearing the plan cache forces SQL Server to recompile, which costs CPU. Only clear a specific plan handle — avoid `DBCC FREEPROCCACHE` (no args) on production as it clears all cached plans.

---

## Why CPU Spikes on Plan Recompile

When the optimizer cannot cache a query plan, it compiles a new one on every execution. Common causes:
- Ad-hoc SQL with literal values instead of parameters
- `SET` options changing between connections
- Schema or statistics changes
- Using `OPTION (RECOMPILE)` explicitly

Use parameterized queries (or `sp_executesql`) to enable plan reuse.

---

## Useful DMVs for Plan Analysis

```sql
-- Top queries by logical reads
SELECT TOP 20
    total_logical_reads / execution_count AS avg_logical_reads,
    total_worker_time   / execution_count AS avg_cpu_ms,
    execution_count,
    SUBSTRING(st.text, (qs.statement_start_offset / 2) + 1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset
          END - qs.statement_start_offset) / 2) + 1) AS QueryText
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY avg_logical_reads DESC;
```

---

## Key Takeaways

1. **Prefer fewer reads** over lower CPU — reads indicate I/O, which is the primary bottleneck
2. An unexpected **scan** instead of **seek** often points to an implicit conversion or missing index
3. High CPU with no data change often means the plan is being **recompiled** on every call
4. Use `sys.dm_exec_cached_plans` to inspect and selectively clear problematic cached plans
5. Never clear the entire plan cache in production — always target a specific `plan_handle`
6. Use **actual execution plans** (not estimated) when diagnosing real-world performance issues

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/Cardinality\|Cardinality]]
- [[docs/tsql/ImplicitConversion\|Implicit Conversion]]
- [[docs/tsql/DynamicSQL\|Dynamic SQL]]

---

## Sources

- [Execution Plan Overview](https://learn.microsoft.com/en-us/sql/relational-databases/performance/execution-plans)
- [sys.dm_exec_cached_plans](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-cached-plans-transact-sql)
- [DBCC FREEPROCCACHE](https://learn.microsoft.com/en-us/sql/t-sql/database-console-commands/dbcc-freeproccache-transact-sql)

---

#tsql #sql-server #execution-plans #performance #tuning
