---
{"dg-publish":true,"permalink":"/docs/tsql/snippets/who-is-active/","tags":["tsql","sql-server","monitoring","sp-whoisactive","performance"]}
---

# sp_WhoIsActive

## Overview

`sp_WhoIsActive` is a community-standard stored procedure by Adam Machanic for monitoring active sessions and queries in SQL Server. It is far more informative than the built-in `sp_who` and `sp_who2`, providing query text, execution plans, lock information, and wait statistics in a single call.

> **Installation:** Download from [whoisactive.com](http://whoisactive.com/) and install in your `master` or a shared DBA database.

---

## Basic Usage

```sql
EXEC sp_WhoIsActive;
```

---

## Full Parameter Reference

```sql
EXEC sp_WhoIsActive
    -- What to collect
    @get_outer_command    = 1,   -- Include the outer calling statement
    @get_plans            = 1,   -- Include execution plans (expensive)
    @get_locks            = 1,   -- Include lock details
    @get_additional_info  = 1,   -- Include additional session info (XML)
    @get_full_inner_text  = 0,   -- Full text of inner SQL (default: snippet)
    @get_transaction_info = 0,   -- Transaction details
    @get_task_info        = 1,   -- Task-level details (waits, CPU, etc.)
    @get_avg_time         = 0,   -- Average runtime for the statement

    -- Filtering
    @filter_type          = 'login',    -- Filter by: 'session', 'program', 'database', 'login', 'host'
    @filter               = '<user/login>',  -- Value to filter on
    @not_filter           = '',         -- Exclude sessions matching this value
    @show_own_spid        = 0,          -- Include your own session
    @show_system_spids    = 0,          -- Include system sessions
    @show_sleeping_spids  = 1,          -- Include sleeping/idle sessions

    -- Output
    @sort_order           = '[start_time] ASC',
    @format_output        = 1,          -- 1 = formatted output, 0 = raw

    -- Advanced
    @find_block_leaders   = 0,          -- Identify the root blocker in a chain
    @delta_interval       = 0,          -- Seconds between two samples (0 = single snapshot)
    @destination_table    = '',         -- Write results to a table instead of returning them
    @return_schema        = 0,          -- Return column schema instead of data
    @schema               = NULL,
    @help                 = 0;          -- Display help text
```

---

## Common Scenarios

### Monitor All Active Sessions

```sql
EXEC sp_WhoIsActive
    @show_sleeping_spids = 0,
    @sort_order = '[cpu] DESC';
```

### Filter by Database

```sql
EXEC sp_WhoIsActive
    @filter_type = 'database',
    @filter      = '<dbname>';
```

### Find Blocking Sessions

```sql
EXEC sp_WhoIsActive
    @find_block_leaders = 1,
    @sort_order         = '[blocked_session_count] DESC';
```

### Capture to a Table for Historical Monitoring

```sql
-- Run on a schedule (e.g., every 60 seconds via SQL Agent)
EXEC sp_WhoIsActive
    @destination_table = 'dba.ActivityLog',
    @get_additional_info = 1;
```

### Monitor a Specific Login

```sql
EXEC sp_WhoIsActive
    @filter_type = 'login',
    @filter      = 'MyAppServiceAccount',
    @get_plans   = 1;
```

---

## Key Output Columns

| Column | Description |
|--------|-------------|
| `session_id` | SPID of the session |
| `login_name` | Login running the query |
| `host_name` | Client machine name |
| `database_name` | Active database |
| `start_time` | When the current request started |
| `cpu` | CPU time consumed (ms) |
| `reads` | Logical reads performed |
| `writes` | Logical writes |
| `wait_info` | Current or last wait type and duration |
| `blocking_session_id` | SPID of the blocking session (if any) |
| `sql_text` | The current SQL statement |
| `query_plan` | Execution plan XML (when `@get_plans = 1`) |
| `locks` | Active lock details (when `@get_locks = 1`) |

---

## Key Takeaways

1. `sp_WhoIsActive` is the go-to tool for real-time session monitoring in SQL Server
2. Use `@find_block_leaders = 1` to quickly identify the root cause of blocking chains
3. Use `@destination_table` with a SQL Agent job to build a historical activity log
4. `@get_plans = 1` is expensive — use it for targeted investigation, not continuous monitoring
5. `@filter_type = 'database'` scopes output to a single database, useful in multi-tenant environments

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/ExecutionPlans\|Execution Plans]]
- [[docs/tsql/Transactions\|Transactions]]

---

## Sources

- [sp_WhoIsActive Documentation](http://whoisactive.com/docs/)
- [SQL Shack: Monitoring with sp_WhoIsActive](https://www.sqlshack.com/monitoring-activities-using-sp_whoisactive-in-sql-server/)

---

#tsql #sql-server #monitoring #sp-whoisactive #performance #blocking
