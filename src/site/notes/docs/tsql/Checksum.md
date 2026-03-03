---
{"dg-publish":true,"permalink":"/docs/tsql/checksum/","tags":["tsql","sql-server","checksum","data-integrity","etl"]}
---

# Checksum & Data Integrity

## Overview

Checksums generate a unique value representing the contents of a dataset. In SQL Server, they are commonly used in ETL pipelines to quickly detect whether data has changed between a source and destination, avoiding unnecessary row-by-row comparisons.

---

## Checksum Functions

### `CHECKSUM_AGG`
An aggregate function that computes a single checksum over a set of values in a column. Useful for comparing the overall state of a table.

```sql
SELECT CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM dbo.MyTable;
```

### `BINARY_CHECKSUM`
Computes a checksum based on the **binary representation** of the input values. Detects changes in data — note it may not catch all rearrangements.

```sql
SELECT BINARY_CHECKSUM(*) FROM dbo.MyTable;
```

### `CHECKSUM`
Similar to `BINARY_CHECKSUM` but operates on individual rows without binary-level comparison.

> **Prefer `BINARY_CHECKSUM` over `CHECKSUM`** for change detection — it is more sensitive to data type differences.

---

## Pattern: Compare Tables via Checksum

```sql
SET NOCOUNT ON;

DROP TABLE IF EXISTS #ResultSet;

CREATE TABLE #ResultSet (
    TableName VARCHAR(50),
    Checksum  BIGINT
);

-- Compute checksums per table
INSERT INTO #ResultSet SELECT 'Address',      CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM ids.Address;
INSERT INTO #ResultSet SELECT 'Company',      CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM ids.Company;
INSERT INTO #ResultSet SELECT 'Location',     CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM ids.Location;
INSERT INTO #ResultSet SELECT 'Organization', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM ids.Organization;

INSERT INTO #ResultSet SELECT 'Item',               CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM inventory.Item;
INSERT INTO #ResultSet SELECT 'ItemBlend',          CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM inventory.ItemBlend;
INSERT INTO #ResultSet SELECT 'ItemGroup',          CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM inventory.ItemGroup;
INSERT INTO #ResultSet SELECT 'ItemCatalog',        CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM inventory.ItemCatalog;
INSERT INTO #ResultSet SELECT 'ItemLocation',       CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM inventory.ItemLocation;
INSERT INTO #ResultSet SELECT 'ItemLocationStock',  CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM inventory.ItemLocationStock;

INSERT INTO #ResultSet SELECT 'Customer',              CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM accountsReceivable.Customer;
INSERT INTO #ResultSet SELECT 'CustomerInvoice',       CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM accountsReceivable.CustomerInvoice;
INSERT INTO #ResultSet SELECT 'CustomerInvoiceLine',   CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM accountsReceivable.CustomerInvoiceLine;
INSERT INTO #ResultSet SELECT 'CustomerShipment',      CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM accountsReceivable.CustomerShipment;
INSERT INTO #ResultSet SELECT 'CustomerShipmentLine',  CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM accountsReceivable.CustomerShipmentLine;
INSERT INTO #ResultSet SELECT 'CustomerToAddress',     CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM accountsReceivable.CustomerToAddress;
INSERT INTO #ResultSet SELECT 'CustomerToContact',     CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM accountsReceivable.CustomerToContact;
INSERT INTO #ResultSet SELECT 'SalesOrder',            CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM accountsReceivable.SalesOrder;

SELECT * FROM #ResultSet
ORDER BY TableName ASC;

DROP TABLE IF EXISTS #ResultSet;
```

---

## Pattern: Row-Level Change Detection

Add a checksum column to detect row-level changes during incremental loads:

```sql
-- Add checksum column to staging table
ALTER TABLE staging.MyTable ADD RowChecksum AS BINARY_CHECKSUM(*) PERSISTED;

-- Find changed rows between staging and target
SELECT s.*
FROM staging.MyTable s
INNER JOIN dbo.MyTable t ON s.Id = t.Id
WHERE s.RowChecksum <> t.RowChecksum;

-- Find new rows
SELECT s.*
FROM staging.MyTable s
LEFT JOIN dbo.MyTable t ON s.Id = t.Id
WHERE t.Id IS NULL;
```

---

## When to Use Checksums

| Scenario | Recommendation |
|----------|---------------|
| Verify entire table hasn't changed | `CHECKSUM_AGG(BINARY_CHECKSUM(*))` |
| Detect changed rows for incremental load | Persisted `BINARY_CHECKSUM(*)` column |
| Quick sanity check after data migration | Compare source vs destination checksums |
| ETL delta detection | Row-level checksum comparison |

---

## Limitations

- `BINARY_CHECKSUM` may produce **hash collisions** (two different rows producing the same checksum). For critical validations, combine with row counts.
- Does not detect when **column order** changes but values are the same.
- For cryptographic integrity, use `HASHBYTES('SHA2_256', ...)` instead.

```sql
-- Stronger alternative using SHA2_256
SELECT HASHBYTES('SHA2_256',
    CONCAT(CAST(Id AS NVARCHAR), Name, Email)
) AS StrongHash
FROM dbo.MyTable;
```

---

## Key Takeaways

1. Use `CHECKSUM_AGG(BINARY_CHECKSUM(*))` to compare entire tables quickly
2. Use persisted `BINARY_CHECKSUM(*)` columns for efficient row-level change detection
3. Checksums are fast but not collision-proof — always combine with row count verification
4. For cryptographic integrity, use `HASHBYTES('SHA2_256', ...)`
5. Checksums are invaluable in **ETL pipelines** to detect what has changed

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/Transactions\|Transactions]]
- [[docs/tsql/snippets/UpdateInBatches\|Update Records in Batches]]

---

## Sources

- [CHECKSUM_AGG (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/functions/checksum-agg-transact-sql)
- [BINARY_CHECKSUM (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/functions/binary-checksum-transact-sql)

---

#tsql #sql-server #checksum #data-integrity #etl
