---
{"dg-publish":true,"permalink":"/docs/csharp/concurrency/multithreading/","tags":["csharp","concurrency","multithreading","threading","dotnet"]}
---

# Multithreading in C#

## Overview

[[docs/csharp/concurrency/Async and Await\|Async and Await]] solves a *waiting* problem — a thread frees itself while IO happens elsewhere. Multithreading solves a different problem: **CPU-bound work**, where the bottleneck is actual computation, not waiting on hardware. Most modern computers have several CPU cores, so a heavy computation split across multiple threads can run several times faster than doing it all on one.

> **Reality check first:** parallelism should not be your first instinct for a slow operation. Most real-world performance problems aren't CPU-bound — they're caused by things like looping over the same large collection repeatedly, calling IO inside a loop, or an unoptimized query. Before reaching for threads, ask whether a better algorithm or data structure fixes the problem more simply. Parallelism adds real complexity (see [[#Cost of Parallelism]]), so save it for cases where the logic is already efficient and you still need more throughput.

---

## Parallel.For

`Parallel.For` splits a loop's iterations across multiple threads automatically.

```csharp
var options = new ParallelOptions { MaxDegreeOfParallelism = 4 }; // Use at most 4 threads

Parallel.For(0, 10, options, i =>
{
    Console.WriteLine(i);
});
```

Run this and the numbers print in an unpredictable order each time (e.g. `2, 0, 6, 1, ...`) — different cores finish their iterations at different times, influenced by what else the CPU is doing, OS scheduling, and cache behavior. **When you parallelize work, you give up control over execution order.** If order matters, sort the results afterward.

### A Tempting but Broken First Attempt

```csharp
public List<int> GetManyPrimes()
{
    var primes = new List<int>();

    Parallel.For(2, 100_000_001, number =>
    {
        if (IsPrime(number))
        {
            primes.Add(number); // DANGER: multiple threads writing to the same List at once
        }
    });

    return primes;
}
```

This compiles and can even *look* like it works — but it has a serious bug. `List<T>` was never designed for multiple threads calling `.Add()` on it simultaneously. When two threads write at the same time, the list's internal array can get corrupted: missing elements, duplicates, or outright exceptions. This is a **race condition** — the outcome depends on which thread happens to get there first, which makes the bug intermittent and hard to reproduce.

---

## Thread-Safe Collections

Whenever parallel code touches a shared collection, that collection needs to be thread-safe. `.NET` provides ready-made thread-safe alternatives in `System.Collections.Concurrent`:

```csharp
public ConcurrentBag<int> GetManyPrimes()
{
    var primes = new ConcurrentBag<int>();

    Parallel.For(2, 100_000_001, number =>
    {
        if (IsPrime(number))
        {
            primes.Add(number); // Safe: ConcurrentBag handles simultaneous adds
        }
    });

    return primes;
}
```

The only change from the broken version is the collection type — `ConcurrentBag<T>` handles the internal synchronization for you.

| Standard Collection | Thread-Safe Alternative | Notes |
|---|---|---|
| `List<T>` | `ConcurrentBag<T>` | Unordered — use when item order doesn't matter |
| `Queue<T>` | `ConcurrentQueue<T>` | Thread-safe FIFO |
| `Stack<T>` | `ConcurrentStack<T>` | Thread-safe LIFO |
| `Dictionary<TKey, TValue>` | `ConcurrentDictionary<TKey, TValue>` | Thread-safe, with atomic add/update operations |
| `HashSet<T>` | *(no direct built-in equivalent)* | Use `ConcurrentDictionary<T, byte>` as a workaround, or protect a `HashSet<T>` with a `lock` |

To put a number on the payoff: finding all primes up to 100 million single-threaded took roughly 20 seconds on a test machine; the `Parallel.For` version with the same underlying logic took about 1.6 seconds — over 13x faster on the same hardware.

> **Boundary:** `Parallel.For`/`Parallel.ForEach` are for CPU-bound work only. Don't use them for IO operations like database or API calls — that's what [[docs/csharp/concurrency/Async and Await\|Async and Await]] is for. Using parallelism for IO just blocks multiple thread pool threads at once, which is the opposite of what you want.

---

## Cost of Parallelism

Parallelism isn't free — there's real overhead in splitting work across threads, coordinating results, and using thread-safe collections. For small or simple operations, that overhead can make the parallel version *slower* than just doing it on one thread. It only pays off when the work is expensive enough that the time saved by using multiple cores outweighs the coordination cost.

---

## Locks

`ConcurrentBag<T>` and friends solve thread-safety for collections. But sometimes you need to protect an arbitrary block of code — that's what `lock` is for. A `lock` guarantees only one thread executes the locked block at a time; any other thread that tries to enter waits until the first one finishes.

The same race-condition risk from `Parallel.For` can happen in any environment with concurrent execution — for example, a web application where multiple requests run on different threads at the same time:

```csharp
private static int _totalVisits;

public void LogVisit()
{
    _totalVisits++; // DANGER: looks atomic, isn't
}
```

`_totalVisits++` is actually three separate steps: read the value, add 1, write it back. If two threads interleave those steps, an increment can be silently lost:

```
Thread A reads _totalVisits: 5
Thread B reads _totalVisits: 5
Thread A writes _totalVisits: 6
Thread B writes _totalVisits: 6   ← should be 7, Thread A's increment is lost
```

Fix it with `lock`:

```csharp
private static int _totalVisits;
private static readonly object _lock = new object();

public void LogVisit()
{
    lock (_lock)
    {
        _totalVisits++; // Only one thread executes this at a time
    }
}
```

> **Careful:** code inside a `lock` blocks every other thread waiting to enter it. Keep locked sections short — if the work inside a lock is expensive, that's a sign to rethink the approach.

---

## Advanced: Semaphores

*This section covers a more advanced, less frequently needed tool — feel free to skip it until you actually need it.*

A `lock` is all-or-nothing: exactly one thread at a time. A `SemaphoreSlim` generalizes that to **N** threads at a time — like a room with a fixed number of seats. Once all seats are full, the next thread waits outside until one opens up.

```csharp
// Allow at most 3 concurrent calls
private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(3);

public async Task<ProductData> GetProductDataAsync(int productId, CancellationToken token)
{
    await _semaphore.WaitAsync(token); // Waits here if 3 calls are already in flight

    try
    {
        return await _thirdPartyApi.GetProductAsync(productId, token);
    }
    finally
    {
        _semaphore.Release(); // Frees a slot for the next waiting thread
    }
}
```

Notes:
- Use `SemaphoreSlim`, the lightweight in-process version — not `Semaphore`
- Always `Release()` inside a `finally` block. If an exception skips the release, other threads wait forever — a **deadlock**
- `WaitAsync` (not `Wait`) frees the thread back to the pool while waiting, consistent with [[docs/csharp/concurrency/Async and Await\|Async and Await]]
- `new SemaphoreSlim(1)` behaves like an async-compatible `lock` — useful since the `lock` keyword doesn't support `await` inside it

Semaphores are uncommon in everyday code — the main use case is throttling calls to something with a concurrency or rate limit. For protecting a shared variable or collection, a `lock` or thread-safe collection is simpler and usually the better choice.

---

## Key Takeaways

1. Multithreading targets CPU-bound work; [[docs/csharp/concurrency/Async and Await\|Async and Await]] targets IO-bound waiting — don't reach for `Parallel.For` on database or API calls
2. `Parallel.For`/`Parallel.ForEach` give up control over execution order in exchange for using multiple cores
3. Shared collections written to from multiple threads need a thread-safe type from `System.Collections.Concurrent` (`ConcurrentBag<T>`, `ConcurrentDictionary<TKey, TValue>`, etc.) — plain `List<T>`/`Dictionary<TKey, TValue>` are not safe for concurrent writes
4. Parallelism has real overhead — only worth it for computationally expensive work, not small operations
5. `lock` protects an arbitrary block of code so only one thread runs it at a time; keep locked sections short
6. `SemaphoreSlim` generalizes `lock` to allow up to N concurrent threads — useful mainly for throttling access to a limited resource

---

## Related Topics

- [[docs/csharp/concurrency/Threads and the Thread Pool\|Threads and the Thread Pool]]
- [[docs/csharp/concurrency/Async and Await\|Async and Await]]
- [[docs/csharp/collections/Collections\|Collections]]
- [[docs/csharp/Learning Guide\|C# Learning Guide]]

---

## Source

- [Microsoft Learn: Parallel Programming in .NET](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/)
- [Microsoft Learn: System.Threading.Tasks.Parallel Class](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.parallel)
- [Microsoft Learn: SemaphoreSlim Class](https://learn.microsoft.com/en-us/dotnet/api/system.threading.semaphoreslim)

---

#csharp #programming #concurrency #multithreading #threading #dotnet
