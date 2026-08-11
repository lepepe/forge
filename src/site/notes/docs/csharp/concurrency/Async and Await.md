---
{"dg-publish":true,"permalink":"/docs/csharp/concurrency/async-and-await/","tags":["csharp","async","concurrency","dotnet"]}
---

# Async and Await in C#

## Overview

IO operations — calling a database, hitting an external API, reading a file — take time, but that time is spent waiting on hardware (a disk, a network card), not on the CPU. If a thread just sits there blocked until the IO finishes, it's wasted: it could have gone back to the [[docs/csharp/concurrency/Threads and the Thread Pool\|thread pool]] and done other work in the meantime.

`async`/`await` is C#'s tool for exactly this. Marking a method `async` tells the compiler "this method can give up its thread while waiting on something slow, instead of blocking it." The `await` keyword controls when execution resumes: the code after an `await` only runs once the awaited operation completes.

**Don't do this** (the thread sits idle, blocked, doing nothing useful):

```csharp
public string GetProductTitle()
{
    Product product = GetProductAsync().Result; // Thread blocked here
    return product.Title;
}
```

**Do this** (the thread is freed while the operation is in flight):

```csharp
public async Task<string> GetProductTitleAsync(CancellationToken token)
{
    Product product = await GetProductAsync(token); // Thread freed here
    // Everything below only runs after the awaited call completes
    return product.Title;
}
```

---

## What "Freeing a Thread" Actually Means

It's worth walking through what happens, step by step, when you `await` an IO operation:

1. Your code reaches the `await` for something like a database call
2. .NET hands the request off to the operating system, which hands it to hardware (network card, disk controller) that works independently of the CPU
3. Since the CPU has nothing to do while the hardware works, the thread that was running your code is **returned to the thread pool** — free to pick up other work (like a different incoming request)
4. When the IO finishes, the OS signals .NET, which grabs an available thread — **not necessarily the same one as before** — and resumes your method right after the `await`

No thread sits idle waiting. The hardware does the actual waiting; the thread pool thread goes and does something useful in the meantime. This is why a server with, say, 100 thread pool threads can handle far more than 100 concurrent requests: those threads keep getting freed and reused while individual requests are waiting on IO.

> **Note:** if the awaited operation is already complete by the time you reach the `await` (e.g. it just returns a cached value), the compiler is smart enough to skip the thread-freeing machinery entirely and continue synchronously. The freeing behavior only kicks in for genuinely pending work.

---

## Cancellation Tokens

A `CancellationToken` lets you cancel an in-flight operation — useful for things like abandoning a long-running request that's consuming resources for no reason. It only works if you pass it all the way down the call chain.

**Don't do this** (nothing downstream can actually be cancelled):

```csharp
public async Task<Report> GetReportAsync()
{
    return await _reportService.GenerateAsync(); // No token - can't be stopped
}
```

**Do this:**

```csharp
public async Task<Report> GetReportAsync(CancellationToken token)
{
    return await _reportService.GenerateAsync(token); // Cancellable end-to-end
}
```

### When NOT to Cancel

Not every operation should honor cancellation. If interrupting something partway through would leave your system in a worse state than just letting it finish, don't wire the token into that section.

Example: a method writes an order to the database, then publishes an `OrderPlaced` event. If cancellation fires *after* the write but *before* the publish, you're left with an order nothing downstream knows about. In cases like this, it's better to let the operation run to completion — you can still accept the token and check it at safe boundaries (before starting, after finishing) without letting it interrupt something that needs to be atomic.

### Cancellation Tokens Aren't the Only Way Work Gets Interrupted

Process kills, server restarts, and ungraceful shutdowns can all stop your code without ever triggering a cancellation token — a token only helps if your code explicitly checks it. For work that absolutely must complete (a financial transaction, an irreversible state change), don't rely on cancellation tokens alone; look into patterns like the outbox pattern, idempotent retries, or durable queues instead.

---

## Awaiting Multiple Operations

You can kick off several async operations and wait for all of them together with `Task.WhenAll`:

```csharp
public async Task<decimal> GetBestShippingQuoteAsync(CancellationToken token)
{
    Task<decimal> fedexQuote = GetFedexQuoteAsync(token);
    Task<decimal> uspsQuote = GetUspsQuoteAsync(token);

    await Task.WhenAll(fedexQuote, uspsQuote);

    // Both tasks are already finished, so awaiting them again here is instant
    return Math.Min(await fedexQuote, await uspsQuote);
}
```

This runs both quote requests *concurrently* rather than one after another — the total wait time is roughly the slower of the two, not the sum of both.

---

## Task vs async void

Never return `void` from an `async` method — if it doesn't need to return a value, return `Task`. (The one exception is event handlers, which have their own conventions worth researching separately.)

**Don't do this** — exceptions thrown inside can crash the process instead of being catchable, and callers have no `Task` to `await`:

```csharp
public async void SubmitOrder(CancellationToken token)
{
    await SaveOrderAsync(token);
}
```

**Do this:**

```csharp
public async Task SubmitOrderAsync(CancellationToken token)
{
    await SaveOrderAsync(token);
}
```

---

## The Compiler-Generated State Machine

Under the hood, the C# compiler turns every `async` method into a state machine that tracks where execution paused and how to resume it. You don't need to understand the internals to use `async`/`await` day to day, but knowing it exists helps when you're debugging or stepping through compiler-generated code.

## ValueTask

`ValueTask`/`ValueTask<T>` is a lightweight alternative to `Task`/`Task<T>`, designed to avoid a heap allocation when an async method frequently completes synchronously (e.g. returning a cached value without ever touching IO). For most everyday async code, `Task` is still the right default — reach for `ValueTask` only in performance-sensitive paths where profiling shows the allocation actually matters.

## When *Not* to Use Task.Run

If an operation isn't IO-bound, wrapping it in `Task.Run` to make it "async" doesn't help — it just moves CPU work onto a different thread pool thread for no benefit in most server applications.

**Don't do this:**

```csharp
public async Task<decimal> GetTotalCostAsync(IEnumerable<OrderItem> items, CancellationToken token)
{
    return await Task.Run(() => items.Sum(x => x.Cost), token); // Pure CPU work, no IO here
}
```

`Task.Run` earns its keep for genuinely CPU-bound work in a **desktop/UI application**, where offloading keeps the UI thread responsive. In a web application, you generally don't need it — see [[docs/csharp/concurrency/Multithreading\|Multithreading]] for when parallelism actually helps.

---

## Key Takeaways

1. `async`/`await` exists to free up threads during IO waits instead of blocking them — see [[docs/csharp/concurrency/Threads and the Thread Pool\|Threads and the Thread Pool]] for why that matters
2. `await` controls *when* code resumes: everything after it runs only once the awaited operation finishes
3. Always accept and pass through a `CancellationToken` — except where partial completion would leave data in a broken state
4. Return `Task`, never `void`, from async methods (barring event handlers)
5. `Task.WhenAll` runs multiple async operations concurrently and waits for all of them
6. Don't wrap pure CPU-bound work in `Task.Run` just to make a method "async" — that's a [[docs/csharp/concurrency/Multithreading\|Multithreading]] concern, not an async one

---

## Related Topics

- [[docs/csharp/concurrency/Threads and the Thread Pool\|Threads and the Thread Pool]]
- [[docs/csharp/concurrency/Multithreading\|Multithreading]]
- [[docs/csharp/exceptions/Exception Handling\|Exception Handling]]
- [[docs/csharp/Learning Guide\|C# Learning Guide]]

---

## Source

- [Microsoft Learn: Asynchronous Programming with async/await](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)
- [Microsoft Learn: Task-based Asynchronous Pattern (TAP)](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

---

#csharp #programming #async #concurrency #dotnet
