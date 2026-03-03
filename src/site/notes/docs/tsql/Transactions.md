---
{"dg-publish":true,"permalink":"/docs/tsql/transactions/","tags":["tsql","sql-server","transactions","acid","error-handling"]}
---

# Transactions

## Overview

A **transaction** is a unit of work in the database — a sequence of operations that must all succeed or all fail together. Every transaction has a defined starting point and an ending point (commit or rollback).

---

## ACID Properties

Transactions implement the ACID guarantees of a relational database:

| Property | Description |
|----------|-------------|
| **Atomicity** | All operations succeed, or none do |
| **Consistency** | The database moves from one valid state to another |
| **Isolation** | Concurrent transactions do not interfere with each other |
| **Durability** | Committed changes survive system failures |

---

## Basic Syntax

```sql
BEGIN TRANSACTION;       -- or BEGIN TRAN

    -- Your SQL operations here

COMMIT TRANSACTION;      -- or COMMIT TRAN  (success)
-- or
ROLLBACK TRANSACTION;    -- or ROLLBACK TRAN (failure, undo all)
```

---

## Transaction States

```
Active  ──────────────►  Partially Committed  ──►  Committed
  │                              │
  └──────►  Failed  ─────────────┴──────────────►  Aborted (Rolled Back)
```

- **Active** — the transaction has started and operations are in progress
- **Partially Committed** — the last operation has executed but the commit has not been confirmed
- **Committed** — all operations completed successfully and changes are durable
- **Failed** — an error occurred; changes cannot be committed
- **Aborted** — the transaction has been rolled back; database is restored to its prior state

---

## TRY / CATCH Pattern

Always wrap multi-statement transactions in a TRY/CATCH block:

```sql
BEGIN TRANSACTION [MyTransaction];
    BEGIN TRY
        -- Operation 1
        UPDATE dbo.Accounts
        SET Balance = Balance - 500
        WHERE AccountId = 1;

        -- Operation 2
        UPDATE dbo.Accounts
        SET Balance = Balance + 500
        WHERE AccountId = 2;

        COMMIT TRANSACTION [MyTransaction];
        PRINT 'Transaction committed successfully.';
    END TRY

    BEGIN CATCH
        ROLLBACK TRANSACTION [MyTransaction];

        -- Re-raise the error
        THROW;
    END CATCH
```

---

## Checking Transaction State in CATCH

```sql
BEGIN TRANSACTION;
    BEGIN TRY
        -- operations...
        COMMIT TRANSACTION;
    END TRY

    BEGIN CATCH
        -- Only rollback if a transaction is still open
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Log or re-raise the error
        DECLARE @Msg  NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @Sev  INT            = ERROR_SEVERITY();
        DECLARE @Stat INT            = ERROR_STATE();

        RAISERROR(@Msg, @Sev, @Stat);
    END CATCH
```

---

## Savepoints

Savepoints allow partial rollbacks within a transaction:

```sql
BEGIN TRANSACTION;

    INSERT INTO dbo.Orders (CustomerId) VALUES (1);

    SAVE TRANSACTION AfterInsert;

    -- This might fail
    BEGIN TRY
        UPDATE dbo.Inventory SET Quantity -= 10 WHERE ProductId = 5;
    END TRY
    BEGIN CATCH
        -- Roll back only to the savepoint, not the whole transaction
        ROLLBACK TRANSACTION AfterInsert;
        PRINT 'Inventory update failed — order kept, inventory unchanged.';
    END CATCH

COMMIT TRANSACTION;
```

---

## Nested Transactions

SQL Server supports nested transactions, but only the **outermost** `COMMIT` or `ROLLBACK` takes effect:

```sql
BEGIN TRANSACTION;           -- @@TRANCOUNT = 1
    BEGIN TRANSACTION;       -- @@TRANCOUNT = 2
        -- inner work
    COMMIT TRANSACTION;      -- @@TRANCOUNT = 1 (does NOT commit)
COMMIT TRANSACTION;          -- @@TRANCOUNT = 0 (actual commit)
```

> **Important:** An inner `ROLLBACK` rolls back the **entire** transaction (including outer), not just the inner one.

---

## @@TRANCOUNT

`@@TRANCOUNT` tracks how many open transactions exist in the current session:

```sql
SELECT @@TRANCOUNT;  -- 0 = no open transaction

BEGIN TRANSACTION;
SELECT @@TRANCOUNT;  -- 1

BEGIN TRANSACTION;
SELECT @@TRANCOUNT;  -- 2

COMMIT;
SELECT @@TRANCOUNT;  -- 1

ROLLBACK;
SELECT @@TRANCOUNT;  -- 0
```

---

## Isolation Levels

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|-------|------------|---------------------|--------------|
| `READ UNCOMMITTED` | Yes | Yes | Yes |
| `READ COMMITTED` (default) | No | Yes | Yes |
| `REPEATABLE READ` | No | No | Yes |
| `SERIALIZABLE` | No | No | No |
| `SNAPSHOT` | No | No | No |

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;  -- default
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;        -- requires DB config
```

---

## Key Takeaways

1. Every multi-statement operation that must be **atomic** should use a transaction
2. Always use **TRY/CATCH** with transactions in stored procedures
3. Check `@@TRANCOUNT > 0` before rolling back inside a CATCH block
4. Inner `ROLLBACK` in nested transactions rolls back the **entire** transaction
5. Use **savepoints** for partial rollback within a complex transaction
6. Keep transactions **as short as possible** to reduce lock contention

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/TransactionLogs\|Transaction Logs & Massive Deletes]]
- [[docs/tsql/TempDB\|TempDB]]

---

## Sources

- [SQL Server Transactions](https://www.sentryone.com/blog/sql-server-transactions)
- [BEGIN TRANSACTION (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/begin-transaction-transact-sql)
- [TRY...CATCH (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/try-catch-transact-sql)

---

#tsql #sql-server #transactions #acid #error-handling #rollback
