---
{"dg-publish":true,"permalink":"/docs/csharp/collections/collections/","tags":["csharp","collections","dotnet","data-structures"]}
---

# Collections

## Overview

A **collection** is anything that holds multiple items — a list of orders, a set of unique IDs, a lookup table of products by SKU. C# gives you several collection types, and picking the right one is mostly about answering one question: *what do I actually need to do with this data?* Do you just need to loop over it? Add and remove items? Look things up by position or by key? Each type below answers that question differently.

---

## The Interface Ladder: IEnumerable → ICollection → IList

Most collection types in .NET build on each other through interfaces, each one adding a bit more capability.

### `IEnumerable<T>`

The most basic contract: "you can loop over me with `foreach`." Nothing else is guaranteed — no adding, no removing, no counting.

```csharp
IEnumerable<int> productIds = new List<int> { 1, 2, 3 };

foreach (var id in productIds)
{
    Console.WriteLine(id);
}
```

Arrays, `List<T>`, `Stack<T>`, even `string` (a collection of `char`) all implement `IEnumerable<T>`.

> **Note:** typing a variable as `IEnumerable<T>` only *hides* the add/remove methods — it doesn't make the underlying collection truly unchangeable. If the real object behind it is a `List<T>`, casting back to `List<T>` lets you mutate it. For a genuine guarantee of immutability, use the `System.Collections.Immutable` namespace (e.g. `ImmutableList<T>`).

### `ICollection<T>`

Adds `.Add()`, `.Remove()`, and a fast `.Count` property on top of `IEnumerable<T>`.

```csharp
ICollection<int> ids = new List<int> { 1, 2, 3 };

ids.Add(4);      // [1, 2, 3, 4]
ids.Remove(2);   // [1, 3, 4]
int count = ids.Count; // 3 - no need to loop to get this
```

### `IList<T>`

Adds index-based access on top of `ICollection<T>`: read/write by position, insert at a position, remove at a position.

```csharp
IList<int> ids = new List<int> { 1, 2, 3 };

int first = ids[0];       // Access by index
ids[0] = 10;               // Replace by index
ids.Insert(1, 99);         // [10, 99, 2, 3] - insert at a specific position
ids.RemoveAt(0);           // Remove by position, not by value
```

### `IReadOnlyList<T>`

Same index-based reading as `IList<T>`, but with no way to modify the collection at all — no `Add`, `Remove`, `Insert`, or index assignment.

```csharp
IReadOnlyList<int> ids = new List<int> { 1, 2, 3 };

int first = ids[0];     // OK - reading is fine
int count = ids.Count;  // OK
// ids.Add(4);           // Compile error - no such method on this interface
```

This is a great return type when a method hands back an ordered result the caller shouldn't modify — it signals intent even though (like `IEnumerable<T>`) it can technically be bypassed by casting back to the concrete type.

> **Reminder:** even a truly read-only *collection* doesn't make the *objects inside it* read-only. `IReadOnlyList<Order>` stops you from adding or removing orders, but nothing stops `orders[0].Status = "Cancelled"` if `Order` is a mutable class.

### The ladder at a glance

| Interface | Loop (`foreach`) | Add / Remove | `.Count` | Index access (`[i]`) |
|---|---|---|---|---|
| `IEnumerable<T>` | Yes | No | No | No |
| `ICollection<T>` | Yes | Yes | Yes | No |
| `IList<T>` | Yes | Yes | Yes | Yes |
| `IReadOnlyList<T>` | Yes | No | Yes | Yes (read-only) |

---

## `List<T>`

`List<T>` is the concrete class you'll reach for most. It implements every interface above and adds extra convenience methods on top.

```csharp
var ids = new List<int> { 1, 2, 3 };

ids.Add(4);
ids.Remove(2);
ids.Insert(0, 10);
ids.RemoveAt(1);
int first = ids[0];

ids.AddRange(new[] { 5, 6, 7 });   // Add many at once
ids.Sort();                        // In-place sort
ids.Find(x => x > 5);              // First match, or default
ids.Exists(x => x == 10);          // true/false
```

## Arrays

Arrays are the most fundamental collection — many collection types (including `List<T>`) use one internally. The defining trait: **fixed size**, set at creation and never changed.

```csharp
int[] numbers = new int[] { 1, 2, 3 };

int first = numbers[0];  // Read by index
numbers[1] = 20;          // Write by index

int length = numbers.Length; // No .Add() or .Remove() - the size is fixed
```

You'll reach for `List<T>` far more often in everyday code, but arrays still show up for byte buffers, interop with APIs that expect arrays, and performance-sensitive code where the lower overhead matters. Arrays also implement `IEnumerable<T>`, so every LINQ method (see [[docs/csharp/collections/LINQ\|LINQ]]) works on them too.

---

## Choosing a Collection Type

Use the most restrictive type that still does what you need — it communicates your intent to whoever reads the code next.

| Type | Use When |
|---|---|
| `IEnumerable<T>` | You only need to iterate. Common for parameters/return types, though `IReadOnlyList<T>` is often a better default when the caller needs more than a single pass. |
| `ICollection<T>` | You need to add/remove/count, but not access by position. |
| `IList<T>` | You need to read or modify items by their position. |
| `IReadOnlyList<T>` | You need index-based reads, but the caller should not modify the collection. |
| `List<T>` | You're building a collection locally and want the full API. Avoid it as a parameter/return type when an interface would do. |
| `T[]` (array) | Fixed size, byte buffers, or the lowest possible overhead in hot paths. |

---

## The `yield` Keyword and Deferred Execution

`yield return` lets a method produce items **one at a time**, on demand, instead of building the whole collection in memory up front.

```csharp
public IEnumerable<int> GetFirstThreeNumbers()
{
    yield return 1;
    yield return 2;
    yield return 3;
}
```

Each time the caller asks for the next item (via `foreach`), the method resumes exactly where it left off. This is especially useful for filtering without an intermediate list:

```csharp
// Without yield: the whole filtered list is built in memory before anything is returned
public IEnumerable<Order> GetLargeOrders(IEnumerable<Order> orders)
{
    var result = new List<Order>();
    foreach (var order in orders)
        if (order.Cost > 1000)
            result.Add(order);
    return result;
}

// With yield: each matching order is produced only when the caller asks for the next one
public IEnumerable<Order> GetLargeOrdersLazy(IEnumerable<Order> orders)
{
    foreach (var order in orders)
        if (order.Cost > 1000)
            yield return order;
}
```

This is called **deferred execution**: the method body doesn't run at all until something actually enumerates the result.

```csharp
// GetLargeOrdersLazy() is called, but nothing runs yet - no items produced
IEnumerable<Order> lazyOrders = GetLargeOrdersLazy(allOrders);

// Execution finally happens here, as each item is pulled by the loop
foreach (var order in lazyOrders)
{
    Console.WriteLine(order.Title);
}
```

> **Careful:** deferred execution depends on *how* a method is written, not on the `IEnumerable<T>` type itself. A method that returns `new List<int> { 1, 2, 3 }` is fully executed immediately, even though the variable holding it is typed `IEnumerable<int>`. Only `yield` (or LINQ operators, which use `yield` internally) actually defers.

### What forces immediate execution

Several common operations "consume" a deferred sequence and force it to run right away:

| Method | What it does |
|---|---|
| `.ToList()` / `.ToArray()` / `.ToDictionary()` | Enumerates everything and materializes it into a concrete collection |
| `.First()` / `.FirstOrDefault()` | Enumerates until the first match |
| `.Count()`, `.Any()`, `.Sum()`, `.Min()`, `.Max()`, `.Average()` | Enumerates the whole sequence (or until a match, for `.Any()`) |
| `foreach` | Enumerates one element at a time |

### Pitfalls of deferred execution

**Multiple enumeration re-runs everything.** If a deferred query is expensive (a database call, heavy filtering), enumerating it twice does the work twice:

```csharp
// Don't do this
IEnumerable<Order> largeOrders = GetLargeOrdersLazy(allOrders);
int count = largeOrders.Count(x => x.Status == "Shipped");      // Runs the filter
decimal avg = largeOrders.Average(x => x.Cost);                  // Runs the filter AGAIN

// Do this instead - materialize once, reuse the result
List<Order> largeOrders = GetLargeOrdersLazy(allOrders).ToList();
int count = largeOrders.Count(x => x.Status == "Shipped");       // Reads from memory
decimal avg = largeOrders.Average(x => x.Cost);                  // Reads from memory
```

**Captured variables are read at execution time, not definition time:**

```csharp
int minCost = 1000;
IEnumerable<Order> expensive = orders.Where(o => o.Cost > minCost);

minCost = 5000; // Changed AFTER the query was defined, but BEFORE it ran

// Uses 5000, not 1000, because the filter only actually runs here
List<Order> results = expensive.ToList();
```

**Changes to the source collection are picked up too** if they happen before enumeration:

```csharp
var orders = new List<Order> { orderA, orderB };
IEnumerable<Order> pending = orders.Where(o => o.Status == "Pending");

orders.Add(orderC); // Added after the query was defined

// orderC is included, since the filter only runs now
List<Order> results = pending.ToList();
```

---

## `HashSet<T>`

A `HashSet<T>` holds only **unique** values — adding the same value twice is a silent no-op.

```csharp
var ids = new HashSet<int>();
ids.Add(1);
ids.Add(2);
ids.Add(3);
ids.Add(3); // Ignored - 3 is already in the set

// ids now contains exactly [1, 2, 3]
```

**Why reach for it:**
- No need to manually scan for duplicates before adding — uniqueness is automatic
- `.Contains()` is extremely fast (close to O(1)) compared to scanning a list

```csharp
// Slow: scans the whole list, O(n)
private readonly List<int> _registeredIds;
public bool IsRegistered(int id) => _registeredIds.Contains(id);

// Fast: near-instant lookup, O(1)
private readonly HashSet<int> _registeredIds;
public bool IsRegistered(int id) => _registeredIds.Contains(id);
```

Under the hood, a `HashSet<T>` uses each item's `GetHashCode()` to jump straight to where it should live, then `Equals()` to confirm a match — that combination is what makes lookups so fast. If you ever use a custom class as a set element (or a dictionary key), make sure `GetHashCode()` is implemented consistently with `Equals()`, or you'll get incorrect behavior or lose the performance benefit.

## `Queue<T>` and `Stack<T>`

Two collections defined entirely by *the order you get items back out*.

**`Queue<T>`** — First In, First Out (FIFO), like a checkout line:

```csharp
var queue = new Queue<int>();
queue.Enqueue(1);
queue.Enqueue(2);
queue.Enqueue(3);

Console.WriteLine(queue.Dequeue()); // 1 - the first one in
Console.WriteLine(queue.Dequeue()); // 2
```

**`Stack<T>`** — Last In, First Out (LIFO), like a stack of plates:

```csharp
var stack = new Stack<int>();
stack.Push(1);
stack.Push(2);
stack.Push(3);

Console.WriteLine(stack.Pop()); // 3 - the last one in
Console.WriteLine(stack.Pop()); // 2
```

## `Dictionary<TKey, TValue>`

A collection of key-value pairs where each key is unique and maps to exactly one value. Like `HashSet<T>`, it uses hashing internally, so lookups by key are close to O(1).

```csharp
var productNames = new Dictionary<int, string>();
productNames.Add(1, "Widget");
productNames.Add(2, "Gadget");

string name = productNames[2]; // "Gadget"
```

Adding a key that already exists throws:

```csharp
productNames.Add(1, "Doohickey"); // ERROR: key 1 already exists
```

Use the indexer to add-or-update without risking that exception:

```csharp
productNames[1] = "Doohickey"; // Updates if present, adds if not
```

Check for existence safely with `TryGetValue`:

```csharp
if (productNames.TryGetValue(3, out var name))
{
    Console.WriteLine(name);
}
// If key 3 doesn't exist, the if-block is simply skipped - no exception
```

---

## Performance Note

Looking something up by scanning a `List<T>` is O(n) — the larger the list, the slower the search. `HashSet<T>` and `Dictionary<TKey, TValue>` turn that same lookup into roughly O(1). Whenever you catch yourself looping through a large collection just to check "does this exist?" or "what value maps to this key?", that's usually a sign you want a `HashSet<T>` or `Dictionary<TKey, TValue>` instead.

---

## Key Takeaways

1. `IEnumerable<T>` → `ICollection<T>` → `IList<T>` is a ladder of increasing capability: loop-only, then add/remove/count, then index access
2. `IReadOnlyList<T>` gives index-based reads while signaling "don't modify this" to callers
3. `List<T>` is the default concrete collection; arrays are for fixed-size or performance-sensitive scenarios
4. `yield return` enables **deferred execution** — the method body doesn't run until the result is enumerated. This is powerful but has real pitfalls: re-enumeration re-runs the work, and captured variables/source mutations are evaluated late
5. Use `HashSet<T>` for fast uniqueness checks, `Dictionary<TKey, TValue>` for fast key-based lookups — both are close to O(1) instead of the O(n) you get scanning a `List<T>`
6. `Queue<T>` is FIFO, `Stack<T>` is LIFO

---

## Related Topics

- [[docs/csharp/collections/LINQ\|LINQ]]
- [[docs/csharp/generics/Generics\|Generics]]
- [[docs/csharp/Learning Guide\|C# Learning Guide]]

---

## Source

- [Microsoft Learn: Collections (C#)](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/collections)
- [Microsoft Learn: Selecting a Collection Class](https://learn.microsoft.com/en-us/dotnet/standard/collections/selecting-a-collection-class)
- [Microsoft Learn: Iterators (yield)](https://learn.microsoft.com/en-us/dotnet/csharp/iterators)

---

#csharp #programming #collections #dotnet #data-structures
