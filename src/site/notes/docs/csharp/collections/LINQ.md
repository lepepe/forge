---
{"dg-publish":true,"permalink":"/docs/csharp/collections/linq/","tags":["csharp","linq","collections","dotnet"]}
---

# LINQ in C#

## Overview

**LINQ** (Language Integrated Query) lets you query and transform collections using a compact, declarative syntax instead of writing manual `foreach` loops. If you know SQL, a lot of this will feel familiar — `Where` is like `WHERE`, `Select` is like `SELECT`, `OrderBy` is like `ORDER BY`. You don't need SQL experience to use LINQ though; the comparisons are just there to help if you already have that background.

LINQ methods are **extension methods** on `IEnumerable<T>` — see [[docs/csharp/collections/Collections\|Collections]] for what that interface guarantees. This means any collection type (`List<T>`, arrays, `HashSet<T>`, etc.) automatically gets every LINQ method for free, with no extra setup.

---

## Lambda Expressions (a Quick Primer)

LINQ leans heavily on **lambda expressions** — short inline functions written with the `=>` operator. You'll want to be comfortable reading these before the LINQ methods below make sense.

```csharp
x => x.Cost > 1000        // Takes an Order, returns true/false
x => x.Title               // Takes an Order, returns its Title
x => new { x.Title, x.Cost } // Takes an Order, returns a new anonymous object (see [[docs/csharp/generics/Anonymous Types and Tuples\|Anonymous Types and Tuples]])
```

The name before `=>` (commonly `x`) represents each individual item as LINQ walks through the collection — you choose the name, it doesn't have to be `x`.

---

## Sample Data

All examples below use this collection:

```csharp
var orders = new List<Order>
{
    new Order { Id = 1, Title = "Freezer",   Cost = 2500, Status = "Shipped"   },
    new Order { Id = 2, Title = "Prep Table", Cost = 800,  Status = "Pending"  },
    new Order { Id = 3, Title = "Cooler",     Cost = 4200, Status = "Shipped"  },
    new Order { Id = 4, Title = "Mixer",      Cost = 600,  Status = "Cancelled"},
    new Order { Id = 5, Title = "Oven",       Cost = 3100, Status = "Pending"  },
};
```

## Filtering: Where

Keeps only the elements matching a condition — like SQL's `WHERE`.

```csharp
IEnumerable<Order> shipped = orders.Where(x => x.Status == "Shipped");
// Freezer, Cooler
```

## Shaping: Select

Transforms each element into something else — like SQL's `SELECT`.

```csharp
IEnumerable<string> titles = orders.Select(x => x.Title);
// ["Freezer", "Prep Table", "Cooler", "Mixer", "Oven"]

var summaries = orders.Select(x => new { x.Title, x.Cost });
// A sequence of anonymous objects with just Title and Cost
```

## Finding One: First / FirstOrDefault, Single / SingleOrDefault

| Method | Matches | If none found | If multiple found |
|---|---|---|---|
| `First` | First match | Throws | Returns the first one |
| `FirstOrDefault` | First match | Returns `null`/default | Returns the first one |
| `Single` | Exactly one expected | Throws | Throws |
| `SingleOrDefault` | Exactly one expected | Returns `null`/default | Throws |

```csharp
Order firstShipped = orders.First(x => x.Status == "Shipped");        // Freezer
Order firstDone = orders.FirstOrDefault(x => x.Status == "Done");     // null, no exception

Order byId = orders.Single(x => x.Id == 3);                            // Cooler
Order byBadId = orders.SingleOrDefault(x => x.Id == 99);               // null, no exception
Order tooMany = orders.Single(x => x.Status == "Shipped");             // ERROR: 2 matches, throws
```

> **Tip:** choose the throwing variant (`First`/`Single`) when "no match" truly represents an error your code shouldn't silently continue past. Choose the `OrDefault` variant when "no match" is a normal, expected outcome you'll handle with an `if (result != null)` check.

## Existence Checks: Any / All

```csharp
bool hasPending = orders.Any(x => x.Status == "Pending");  // true
bool allShipped = orders.All(x => x.Status == "Shipped");  // false
```

> **Tip:** if you're just checking "is this collection non-empty?" with no condition, prefer `collection.Count > 0` (or `.Length > 0` for arrays) over a bare `.Any()` — same result, no enumeration needed for types that track their count.

## Sorting: OrderBy / OrderByDescending / ThenBy

```csharp
IEnumerable<Order> cheapestFirst = orders.OrderBy(x => x.Cost);
IEnumerable<Order> priciestFirst = orders.OrderByDescending(x => x.Cost);
```

For a secondary sort key (like SQL's `ORDER BY Status, Cost`), chain `ThenBy`/`ThenByDescending` — **not** another `OrderBy`:

```csharp
// Correct: sorts by Status, then by Cost within each status
orders.OrderBy(x => x.Status).ThenByDescending(x => x.Cost);

// Wrong: the second OrderBy wipes out the first one entirely
orders.OrderBy(x => x.Status).OrderBy(x => x.Cost);
```

## Grouping: GroupBy

Groups elements by a key — like SQL's `GROUP BY`.

```csharp
var byStatus = orders.GroupBy(x => x.Status);

foreach (var group in byStatus)
{
    Console.WriteLine($"{group.Key}: {group.Count()} orders");
}
// Shipped: 2 orders
// Pending: 2 orders
// Cancelled: 1 orders
```

Each `group` in the loop is itself a sequence of all the orders sharing that `group.Key`.

## Aggregates: Sum / Min / Max / Average / Count

```csharp
decimal total = orders.Sum(x => x.Cost);
decimal cheapest = orders.Min(x => x.Cost);
decimal priciest = orders.Max(x => x.Cost);
decimal average = orders.Average(x => x.Cost);

int totalCount = orders.Count();
int shippedCount = orders.Count(x => x.Status == "Shipped");
```

> **Tip:** if you just want the plain count of a `List<T>` or array with no filter, prefer `.Count` (property) or `.Length` over `.Count()` (LINQ method) — the property is instant, the method enumerates.

## Materializing: ToList / ToArray / ToDictionary

Converts a (possibly still-deferred) `IEnumerable<T>` into a concrete, fully-evaluated collection. See [[docs/csharp/collections/Collections\|deferred execution]] for why this matters.

```csharp
List<Order> shippedList = orders.Where(x => x.Status == "Shipped").ToList();

Dictionary<int, string> titleById = orders.ToDictionary(x => x.Id, x => x.Title);
// { 1: "Freezer", 2: "Prep Table", ... }
```

## Uniqueness: Distinct

```csharp
IEnumerable<string> statuses = orders.Select(x => x.Status).Distinct();
// ["Shipped", "Pending", "Cancelled"]
```

---

## LINQ Never Mutates the Source

Every LINQ method returns a **new** sequence — the original collection is always left untouched:

```csharp
var orders = new List<Order> { freezerOrder, coolerOrder, pendingOrder };

IEnumerable<Order> shipped = orders.Where(x => x.Status == "Shipped");

// `orders` still has all 3 items - .Where() never touched it
```

## Chaining

Because nothing is mutated, you can pipe one LINQ method straight into the next:

```csharp
List<string> result = orders
    .Where(x => x.Status == "Shipped")
    .OrderByDescending(x => x.Cost)
    .Select(x => x.Title)
    .ToList();
// ["Cooler", "Freezer"]
```

Read a chain like this top to bottom: filter, then sort, then reshape, then materialize.

---

## Key Takeaways

1. LINQ methods are extension methods on `IEnumerable<T>` — every collection type gets them for free
2. `Where` filters, `Select` transforms, `OrderBy`/`ThenBy` sorts, `GroupBy` groups, `Sum`/`Min`/`Max`/`Average`/`Count` aggregate
3. Prefer `FirstOrDefault`/`SingleOrDefault` when "no match" is expected; `First`/`Single` when it's an error
4. LINQ never mutates the source collection — each method returns a new sequence, which is exactly what makes chaining safe
5. `ToList()`/`ToArray()`/`ToDictionary()` force immediate evaluation of an otherwise-deferred query — see [[docs/csharp/collections/Collections\|Collections]] for the pitfalls of *not* doing this when you reuse a query more than once

---

## Related Topics

- [[docs/csharp/collections/Collections\|Collections]]
- [[Anonymous Types and Tuples]]
- [[docs/csharp/generics/Generics\|Generics]]
- [[docs/csharp/Learning Guide\|C# Learning Guide]]

---

## Source

- [Microsoft Learn: LINQ (Language Integrated Query)](https://learn.microsoft.com/en-us/dotnet/csharp/linq/)
- [Microsoft Learn: Standard Query Operators Overview](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/)

---

#csharp #programming #linq #collections #dotnet
