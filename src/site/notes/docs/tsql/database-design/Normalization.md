---
{"dg-publish":true,"permalink":"/docs/tsql/database-design/normalization/","tags":["tsql","sql-server","database-design","normalization"]}
---

# Normalization

## Overview

**Normalization** is the process of organizing a database schema to reduce redundancy and protect data integrity. It works by breaking data into focused tables and linking them with relationships, rather than repeating the same values across many rows.

The underlying principle: **each piece of data should live in exactly one place.** If you catch yourself copying the same value into multiple rows or tables, that's a signal to rethink the design. The "normal forms" below give that principle a more precise, checkable vocabulary — you don't need to memorize the formal definitions, but the terms come up constantly in schema reviews and design discussions.

There are several normal forms (levels of normalization), but in practice you'll work with the first three most often.

---

## First Normal Form (1NF)

A table is in 1NF when:

- Every column contains **atomic** (indivisible) values
- There are no repeating groups of columns

**Violation:**

| OrderId | Items |
|---|---|
| 1 | "Widget, Gadget, Doohickey" |

The `Items` column packs multiple values into a single string. This makes it impossible to query for one specific item, and the database can't enforce any integrity rules (like a foreign key) on the individual values.

**Fixed** — one row per value, in a separate table:

| OrderId | ItemId |
|---|---|
| 1 | 101 |
| 1 | 102 |
| 1 | 103 |

This is the same pattern behind any order/order-item, or many-to-many join table you've written.

---

## Second Normal Form (2NF)

A table is in 2NF when it satisfies 1NF **and** every non-key column depends on the *entire* primary key; not just part of it.
This mainly matters for tables with a **composite primary key** (two or more columns forming the key together). If a column depends on only one part of that key, it belongs in a separate table.

**Violation:**

| OrderId | ProductId | ProductName | Quantity |
|---|---|---|---|
| 1 | 42 | Widget | 3 |
| 1 | 57 | Gadget | 1 |

The primary key here is `(OrderId, ProductId)` together. `Quantity` correctly depends on both; it's the quantity of *that* product on *that* order. But `ProductName` only depends on `ProductId`. Rename a product, and every order-line row referencing it needs updating.

**Fixed**: split into two tables:
`OrderLine`, with only columns that depend on the full composite key:

| OrderId | ProductId | Quantity |
|---|---|---|
| 1 | 42 | 3 |
| 1 | 57 | 1 |

`Product`, where `ProductName` lives since it depends only on `ProductId`:

| ProductId | ProductName |
|---|---|
| 42 | Widget |
| 57 | Gadget |

---

## Third Normal Form (3NF)

A table is in 3NF when it satisfies 2NF **and** no non-key column depends on another non-key column (only on the key itself).

**Violation:**

| OrderId | CustomerId | CustomerEmail |
|---|---|---|
| 1 | 42 | alice@example.com |

`CustomerEmail` depends on `CustomerId`, not on `OrderId`; it's a transitive dependency riding along on a table it doesn't belong to. If a customer changes their email, every order row for that customer needs updating, and it's easy for those copies to drift out of sync.

**Fixed**: split into two tables:
`Order`, with no customer details:

| OrderId | CustomerId |
|---|---|
| 1 | 42 |

`Customer`, where `CustomerEmail` belongs:

| CustomerId | CustomerEmail |
|---|---|
| 42 | alice@example.com |

When you need the email, join the two tables. Updating a customer's email now means changing exactly one row, in exactly one place.

---

## Why Bother? The Cost of Skipping It

Every violation above traces back to the same failure mode: **the same fact stored in more than one place.** That redundancy is what normalization eliminates, and skipping it costs you later in predictable ways:

| Problem            | Cause                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Update anomaly** | Changing a fact (like a customer's email) requires updating many rows instead of one; miss one, and your data disagrees with itself                 |
| **Insert anomaly** | You can't record a fact (like a new product) until an unrelated fact (like an order for it) also exists, because they're jammed into the same table |
| **Delete anomaly** | Deleting one thing (the last order for a product) accidentally erases another (the product's name), because nothing else referenced it              |

Normalizing a schema: splitting data into focused tables connected by foreign keys; makes each of these anomalies structurally impossible instead of something you have to remember to avoid.

## When *Not* to Fully Normalize

Normalization isn't a purity test to max out. Highly normalized schemas trade some query performance for data integrity: a fully 3NF schema often needs more joins to reconstruct a full picture of an entity, which costs read performance. Reporting and analytics workloads in particular often deliberately **denormalize** (e.g. a wide, flattened star-schema fact table) to avoid expensive joins at query time, accepting some redundancy in exchange for read speed. The usual approach: normalize your transactional (OLTP) schema for integrity, and denormalize deliberately, in specific reporting layers, when you have a measured performance reason to.

---

## Key Takeaways

1. The core rule: **each piece of data should live in exactly one place** — the normal forms just make that checkable
2. **1NF**: no multi-value columns, no repeating column groups — one value per cell
3. **2NF**: every non-key column depends on the *whole* composite key, not just part of it
4. **3NF**: no non-key column depends on another non-key column — only on the key
5. Skipping normalization leads to update/insert/delete anomalies — the same fact drifting out of sync across rows
6. Normalize for integrity by default; denormalize deliberately (and locally) when you have a measured read-performance reason to

---

## Related Topics

- [[docs/tsql/T-SQL Guide\|T-SQL Guide]]
- [[docs/tsql/foundations/Cardinality\|Cardinality (Column/Index)]]
- [[docs/tsql/database-objects/Dependencies\|Object Dependencies]]

---

## Source

- [Microsoft Learn: Database Normalization Description](https://learn.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description)
- [Microsoft Learn: Data Modeling Fundamentals](https://learn.microsoft.com/en-us/power-bi/guidance/star-schema)

---

#tsql #sql-server #database-design #normalization
