---
{"dg-publish":true,"permalink":"/docs/tsql/snippets/remove-punctuation-function/","tags":["tsql","sql-server","functions","string","data-cleaning"]}
---

# Remove Punctuation Function

## Overview

A user-defined scalar function that strips a defined set of punctuation characters from a string. Useful during data import, normalization, or matching pipelines where consistent string formatting is required.

> **Performance note:** Scalar UDFs are called row-by-row, which can be slow on large tables. Consider using `REPLACE` inline in your query, or migrate to an **inline table-valued function** or application-side cleaning for high-volume scenarios.

---

## Function Definition

```sql
USE DatabaseName;
GO

SET ANSI_NULLS OFF;
GO

SET QUOTED_IDENTIFIER OFF;
GO

CREATE FUNCTION dbo.fn_RemovePunctuation (
    @String VARCHAR(100)
)
RETURNS VARCHAR(100)
AS
BEGIN
    IF @String IS NULL OR @String = ''
    BEGIN
        SET @String = '';
    END
    ELSE IF @String LIKE '%[^a-z][^0-9]%'
    BEGIN
        SET @String = REPLACE(@String, ',',  '');
        SET @String = REPLACE(@String, '&',  '');
        SET @String = REPLACE(@String, '.',  '');
        SET @String = REPLACE(@String, '''', '');
        SET @String = REPLACE(@String, '"',  '');
        SET @String = REPLACE(@String, ';',  '');
        SET @String = REPLACE(@String, '-',  '');

        SET @String = LTRIM(RTRIM(@String));
    END;

    RETURN @String;
END;
GO
```

---

## Usage

```sql
-- Single value
SELECT dbo.fn_RemovePunctuation('Hello, World! It''s a "test".');
-- Result: 'Hello World Its a test'

-- Apply to a column
SELECT
    ProductName,
    dbo.fn_RemovePunctuation(ProductName) AS CleanName
FROM dbo.Products;

-- Use in a WHERE clause for matching
SELECT *
FROM dbo.Products
WHERE dbo.fn_RemovePunctuation(ProductName) = dbo.fn_RemovePunctuation(@SearchTerm);
```

---

## Inline Alternative (Better Performance)

For large tables, replace the scalar UDF with chained `REPLACE` calls directly in the query:

```sql
SELECT
    ProductName,
    LTRIM(RTRIM(
        REPLACE(
        REPLACE(
        REPLACE(
        REPLACE(
        REPLACE(
        REPLACE(
        REPLACE(ProductName,
            ',',  ''),
            '&',  ''),
            '.',  ''),
            '''', ''),
            '"',  ''),
            ';',  ''),
            '-',  '')
    )) AS CleanName
FROM dbo.Products;
```

---

## Extend to More Characters

Modify the function or inline chain to strip additional characters:

```sql
SET @String = REPLACE(@String, '!',  '');
SET @String = REPLACE(@String, '@',  '');
SET @String = REPLACE(@String, '#',  '');
SET @String = REPLACE(@String, '(',  '');
SET @String = REPLACE(@String, ')',  '');
SET @String = REPLACE(@String, '/',  '');
SET @String = REPLACE(@String, '\',  '');
SET @String = REPLACE(@String, ':',  '');
```

---

## Drop and Recreate

```sql
DROP FUNCTION IF EXISTS dbo.fn_RemovePunctuation;
```

---

## Key Takeaways

1. Scalar UDFs execute **row-by-row** — avoid on large datasets or in `WHERE` clauses without filtering first
2. For batch processing, prefer **inline `REPLACE` chaining** over calling the UDF per row
3. `LTRIM(RTRIM(...))` handles any leading/trailing whitespace left after punctuation removal
4. SQL Server 2019+ supports **scalar UDF inlining** (`INLINE = ON`), which can dramatically improve performance for eligible functions
5. For complex string normalization, consider pushing cleaning logic to the application or ETL layer

---

## Related Topics

- [[docs/tsql/TSQLGuide\|T-SQL Guide]]
- [[docs/tsql/DynamicSQL\|Dynamic SQL]]
- [[docs/tsql/snippets/UpdateInBatches\|Update Records in Batches]]

---

## Sources

- [CREATE FUNCTION (T-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-function-transact-sql)
- [Scalar UDF Inlining (SQL Server 2019)](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/scalar-udf-inlining)

---

#tsql #sql-server #functions #string #data-cleaning #udf
