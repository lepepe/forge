---
{"dg-publish":true,"permalink":"/docs/tsql/tsql-guide/","tags":["tsql","sql-server","guide"]}
---

# T-SQL Guide

## Overview

**Microsoft SQL Server** is a relational database management system (RDBMS) developed by Microsoft. Its primary function is storing and retrieving data for software applications running locally or across a network. T-SQL (Transact-SQL) is Microsoft's proprietary extension to SQL, adding procedural programming, local variables, and various support functions.

> **SQL as a Language:** SQL is a *Domain-Specific Language (DSL)*, not a General Purpose Language (GPL). It was built specifically to work with databases — querying and manipulating data stored in relational systems. You cannot build an entire application using only SQL.

---

## Topics

### Foundations
Concepts that underpin everything else — understand these before diving into performance or features.

- [[docs/tsql/Collation\|Collation]] — character encoding, sort order, and join compatibility
- [[docs/tsql/Cardinality\|Cardinality (Column/Index)]] — data uniqueness and its impact on the query optimizer
- [[docs/tsql/Transactions\|Transactions & ACID]] — atomicity, isolation, commit and rollback

### Performance & Query Optimization
Diagnosing slowness and understanding what the optimizer does with your queries.

- [[docs/tsql/ExecutionPlans\|Execution Plans]] — read plans, understand seeks vs scans, clear cached plans
- [[docs/tsql/ImplicitConversion\|Implicit Conversion]] — how mismatched data types silently kill index seeks
- [[docs/tsql/LinkedServer\|Linked Server Performance]] — avoid full-table transfers with OPENQUERY

### Storage & Internals
What SQL Server does under the hood during large operations.

- [[docs/tsql/TempDB\|TempDB]] — temporary storage, version store, contention, and configuration
- [[docs/tsql/TransactionLogs\|Transaction Logs & Massive Deletes]] — log growth, batching strategies, TRUNCATE vs DELETE

### Database Objects & Features
SQL Server building blocks and programmability features.

- [[docs/tsql/DynamicSQL\|Dynamic SQL]] — runtime SQL with sp_executesql and safe parameterization
- [[docs/tsql/Sequences\|Sequences]] — table-independent auto-numbering (vs IDENTITY)
- [[docs/tsql/Dependencies\|Object Dependencies]] — find what references or depends on any object
- [[docs/tsql/Checksum\|Checksum & Data Integrity]] — fast change detection for ETL pipelines

### Snippets
Ready-to-use queries grouped by workflow — from schema exploration to monitoring.

**Schema & Security**
- [[docs/tsql/snippets/SysTables\|Sys Tables & Schema Queries]] — list tables, columns, row counts, object metadata
- [[docs/tsql/snippets/ForeignKeys\|Foreign Keys & Indexes]] — list FK relationships, find missing indexes on FK columns
- [[docs/tsql/snippets/Permissions\|Permissions (GRANT / REVOKE)]] — manage and audit object permissions, impersonation

**Objects & Code**
- [[docs/tsql/snippets/StoredProcedures\|Stored Procedures]] — find usage, last execution time, references by table or column
- [[docs/tsql/snippets/CDC\|Change Data Capture (CDC)]] — query capture instances, LSN watermarks, ETL delta loads

**Data Quality & DML**
- [[docs/tsql/snippets/IdentifyDuplicates\|Identify Duplicates]] — detect and remove duplicate rows with ROW_NUMBER
- [[docs/tsql/snippets/UpdateInBatches\|Update Records in Batches]] — batch UPDATE and DELETE to reduce log and lock impact
- [[docs/tsql/snippets/RemovePunctuationFunction\|Remove Punctuation Function]] — scalar UDF and inline alternative for string cleaning

**Monitoring**
- [[docs/tsql/snippets/WhoIsActive\|sp_WhoIsActive]] — real-time session monitoring, blocking chains, plan capture

---

## Key Takeaways

1. **Collation** mismatches cause silent join failures and implicit conversions — verify early
2. **Cardinality** drives index design — high-cardinality columns make the best index candidates
3. Always wrap multi-statement operations in **transactions** with TRY/CATCH and check `@@TRANCOUNT` before rollback
4. Unexpected **index scans** are often caused by implicit conversion — match parameter types to column types
5. **Batch** large UPDATE and DELETE operations — never run millions of rows in a single transaction
6. Use **`sp_executesql`** with parameters over string concatenation for all dynamic SQL
7. Prefer **`OPENQUERY`** over 4-part names for linked server queries to avoid full table transfers
8. Run **`sp_WhoIsActive`** as the first step when diagnosing blocking or slow queries in production

---

## Sources

- [Microsoft SQL Server Docs](https://learn.microsoft.com/en-us/sql/sql-server/)
- [SQL Server Tutorial](https://www.sqlservertutorial.net/)

---

#tsql #sql-server #guide
