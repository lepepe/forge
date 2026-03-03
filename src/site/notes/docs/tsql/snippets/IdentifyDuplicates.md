---
{"dg-publish":true,"permalink":"/docs/tsql/snippets/identify-duplicates/","tags":["tsql","sql-server","duplicates","data-quality"]}
---

# Identify Duplicate Criteria

## Overview

Finding and handling duplicate records is a common data quality task. This guide covers techniques to detect duplicates, list the offending rows, and remove them while keeping the desired record.

---

## Step 1: Verify Duplicates Exist

Use `GROUP BY` + `HAVING COUNT(*) > 1` to find duplicate combinations:

```sql
SELECT
    username,
    email,
    COUNT(*) AS DuplicateCount
FROM users
GROUP BY username, email
HAVING COUNT(*) > 1
ORDER BY DuplicateCount DESC;
```

> `HAVING` filters on **aggregate results** — unlike `WHERE`, which filters individual rows before grouping.

**Example result:**

| Username | Email          | DuplicateCount |
|----------|----------------|----------------|
| Jose     | jose@gmail.com | 2              |
| John     | john@gmail.com | 2              |
| Mary     | mary@gmail.com | 2              |

---

## Step 2: List All Duplicate Rows

Join the table back to the duplicate set to see all affected rows:

```sql
SELECT u.*
FROM users u
JOIN (
    SELECT username, email
    FROM users
    GROUP BY username, email
    HAVING COUNT(*) > 1
) dupes ON u.username = dupes.username
       AND u.email    = dupes.email
ORDER BY u.email, u.username;
```

**Example result:**

| Id  | Username | Email          |
| --- | -------- | -------------- |
| 1   | Jose     | jose@gmail.com |
| 7   | Jose     | jose@gmail.com |
| 16  | Mary     | mary@gmail.com |
| 19  | Mary     | mary@gmail.com |

---

## Step 3: Identify Which Rows to Keep

Use `ROW_NUMBER()` to rank duplicates and keep only the first (or last):

```sql
SELECT
    id,
    username,
    email,
    ROW_NUMBER() OVER (
        PARTITION BY username, email
        ORDER BY id ASC       -- keep the lowest id
    ) AS RowNum
FROM users;
```

Rows where `RowNum > 1` are the duplicates to remove.

---

## Step 4: Delete Duplicates (Keep First)

```sql
WITH RankedDuplicates AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY username, email
            ORDER BY id ASC
        ) AS RowNum
    FROM users
)
DELETE FROM RankedDuplicates
WHERE RowNum > 1;
```

---

## Step 4 (Alternative): Delete Using a Subquery

```sql
DELETE FROM users
WHERE id NOT IN (
    SELECT MIN(id)
    FROM users
    GROUP BY username, email
);
```

---

## Find Duplicates on a Single Column

```sql
-- Duplicate emails only
SELECT email, COUNT(*) AS Count
FROM users
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY Count DESC;

-- Show all rows with duplicate emails
SELECT *
FROM users
WHERE email IN (
    SELECT email
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1
)
ORDER BY email;
```

---

## Find Duplicates Across All Columns

```sql
-- Completely identical rows (all columns match)
SELECT *, COUNT(*) AS Count
FROM users
GROUP BY id, username, email, created_date  -- list all columns
HAVING COUNT(*) > 1;
```

---

## Prevention: Add a Unique Constraint

After deduplicating, prevent future duplicates:

```sql
-- Unique constraint on combination of columns
ALTER TABLE users
ADD CONSTRAINT UQ_Users_Username_Email
    UNIQUE (username, email);
```

---

## Key Takeaways

1. `HAVING COUNT(*) > 1` is the standard way to find duplicate groups
2. Use `ROW_NUMBER() OVER (PARTITION BY ...)` to rank duplicates for targeted deletion
3. Always run the `SELECT` version of your delete logic first to verify the rows affected
4. Use a CTE with `DELETE` for clean, readable duplicate removal
5. Add a **unique constraint** after cleanup to prevent the problem from recurring

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/Checksum\|Checksum & Data Integrity]]
- [[docs/tsql/snippets/SysTables\|Sys Tables & Schema Queries]]

---

## Sources

- [ROW_NUMBER (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/functions/row-number-transact-sql)
- [HAVING Clause (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-having-transact-sql)

---

#tsql #sql-server #duplicates #data-quality #cte
