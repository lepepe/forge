---
{"dg-publish":true,"permalink":"/docs/csharp/concurrency/threads-and-the-thread-pool/","tags":["csharp","concurrency","threading","dotnet"]}
---

# Threads and the Thread Pool

## Overview

A **thread** is the smallest unit of execution the operating system can schedule — think of it as one "worker" capable of running your code. Every application starts with at least one (the main thread). If you want to do more than one thing at the same time — like handling several web requests simultaneously — you need more threads.

This note is the foundation for two others: [[docs/csharp/concurrency/Async and Await\|Async and Await]] (freeing threads during IO waits) and [[docs/csharp/concurrency/Multithreading\|Multithreading]] (splitting CPU-bound work across threads).

---

## Why a Thread *Pool*?

Creating and destroying a thread is expensive — the operating system has to allocate memory and bookkeeping for it. If your application created a brand-new thread every time it needed one, that overhead would add up fast.

Instead, .NET maintains a **thread pool**: a set of pre-created, reusable threads managed by the runtime. When there's work to do, .NET borrows a thread from the pool, runs the work, and returns the thread to the pool when it's done — ready to be reused for the next piece of work.

```
[ Thread Pool: 🧵 🧵 🧵 🧵 🧵 (idle, ready) ]
        │
        ▼ borrow one for incoming work
[ 🧵 handles Request A ] → done → returned to pool
```

**Key facts about the thread pool:**

- It has a **limited** number of threads available at any moment
- In a web application, each incoming HTTP request typically needs a thread pool thread to process it
- If every thread is busy — for example, all of them are stuck waiting on a slow database call — new requests have to queue up until one frees up. This is called **thread pool starvation**, and it can make an otherwise-healthy application appear to hang or become unresponsive

That last point is the whole motivation behind [[docs/csharp/concurrency/Async and Await\|Async and Await]]: if a thread can be freed back to the pool *while* it's waiting on something slow (like a network call), the pool stays healthy and can keep serving other work.

---

## Key Takeaways

1. A thread is the OS's unit of schedulable work; your app needs more than one to do multiple things concurrently
2. Creating/destroying threads is expensive, so .NET reuses a pool of them instead
3. The pool has a limited size — if too many threads are blocked waiting on something, new work queues up (**thread pool starvation**)
4. This is the reason `async`/`await` matters so much for responsiveness — see [[docs/csharp/concurrency/Async and Await\|Async and Await]]

---

## Related Topics

- [[docs/csharp/concurrency/Async and Await\|Async and Await]]
- [[docs/csharp/concurrency/Multithreading\|Multithreading]]
- [[docs/csharp/Learning Guide\|C# Learning Guide]]

---

## Source

- [Microsoft Learn: The Managed Thread Pool](https://learn.microsoft.com/en-us/dotnet/standard/threading/the-managed-thread-pool)

---

#csharp #programming #concurrency #threading #dotnet
