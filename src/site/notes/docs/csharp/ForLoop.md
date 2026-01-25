---
{"dg-publish":true,"permalink":"/docs/csharp/for-loop/","tags":["for-loop","arrays","loops"]}
---

# For Loop in C#

## Overview

The `for` statement is an iteration statement that allows you to execute a code block a **specific number of times**. It provides fine-grained control over the iteration process compared to `foreach` and `while` loops.

---

## Basic Syntax

```csharp
for (initializer; condition; iterator)
{
    // Code to execute each iteration
}
```

**Example:**
```csharp
for (int i = 0; i < 10; i++)
{
    Console.WriteLine(i);
}
```

**Output:**
```
0
1
2
3
4
5
6
7
8
9
```

---

## The Six Parts of a For Statement

```csharp
for (int i = 0; i < 10; i++)
{
    Console.WriteLine(i);
}
```

| Part | Description | Example |
|------|-------------|---------|
| `for` keyword | Declares the for loop | `for` |
| Initializer | Declares and initializes the iterator variable | `int i = 0` |
| Condition | Boolean expression evaluated before each iteration | `i < 10` |
| Iterator | Action performed after each iteration | `i++` |
| Code block | Statements executed each iteration | `{ Console.WriteLine(i); }` |

### How It Works

1. **Initializer** executes once at the start (`int i = 0`)
2. **Condition** is checked (`i < 10`)
   - If `true`: execute code block
   - If `false`: exit loop
3. **Code block** executes
4. **Iterator** runs (`i++`)
5. Return to step 2

```
┌─────────────────┐
│  Initializer    │ ──► Runs once
└────────┬────────┘
         │
         ▼
┌─────────────────┐     false
│   Condition?    │ ──────────► Exit Loop
└────────┬────────┘
         │ true
         ▼
┌─────────────────┐
│  Code Block     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Iterator      │
└────────┬────────┘
         │
         └──────► Back to Condition
```

---

## Iterator Variable Naming

Common naming conventions for iterator variables:

| Name | Usage |
|------|-------|
| `i` | Most common, standard choice |
| `j` | Nested loops (inner loop) |
| `k` | Deeply nested loops |
| `x`, `y` | Coordinate-based iterations |
| `index` | When clarity is preferred |
| `counter` | Descriptive alternative |

---

## Common Variations

### Counting Down (Decrement)

```csharp
for (int i = 10; i >= 0; i--)
{
    Console.WriteLine(i);
}
```

**Output:**
```
10
9
8
...
1
0
```

### Custom Step Increments

```csharp
for (int i = 0; i < 10; i += 3)
{
    Console.WriteLine(i);
}
```

**Output:**
```
0
3
6
9
```

### Counting by Twos (Even Numbers)

```csharp
for (int i = 0; i <= 10; i += 2)
{
    Console.WriteLine(i);
}
```

**Output:**
```
0
2
4
6
8
10
```

---

## Working with Arrays

### Iterating Forward

```csharp
string[] names = { "Alex", "Eddie", "David", "Michael" };

for (int i = 0; i < names.Length; i++)
{
    Console.WriteLine(names[i]);
}
```

**Output:**
```
Alex
Eddie
David
Michael
```

### Iterating Backward

```csharp
string[] names = { "Alex", "Eddie", "David", "Michael" };

for (int i = names.Length - 1; i >= 0; i--)
{
    Console.WriteLine(names[i]);
}
```

**Output:**
```
Michael
David
Eddie
Alex
```

### Modifying Array Elements

Unlike `foreach`, the `for` loop allows you to modify array elements during iteration.

```csharp
string[] names = { "Alex", "Eddie", "David", "Michael" };

for (int i = 0; i < names.Length; i++)
{
    if (names[i] == "David")
    {
        names[i] = "Sammy";
    }
}

// names is now: { "Alex", "Eddie", "Sammy", "Michael" }
```

---

## Using Break to Exit Early

The `break` keyword exits the loop immediately when a condition is met.

```csharp
for (int i = 0; i < 10; i++)
{
    Console.WriteLine(i);
    if (i == 7)
    {
        break;  // Exit loop when i equals 7
    }
}
```

**Output:**
```
0
1
2
3
4
5
6
7
```

---

## Using Continue to Skip Iterations

The `continue` keyword skips the current iteration and moves to the next.

```csharp
for (int i = 0; i < 10; i++)
{
    if (i % 2 == 0)
    {
        continue;  // Skip even numbers
    }
    Console.WriteLine(i);
}
```

**Output:**
```
1
3
5
7
9
```

---

## Nested For Loops

Use nested loops for multi-dimensional data or grid patterns.

```csharp
for (int i = 1; i <= 3; i++)
{
    for (int j = 1; j <= 3; j++)
    {
        Console.WriteLine($"i = {i}, j = {j}");
    }
}
```

**Output:**
```
i = 1, j = 1
i = 1, j = 2
i = 1, j = 3
i = 2, j = 1
i = 2, j = 2
i = 2, j = 3
i = 3, j = 1
i = 3, j = 2
i = 3, j = 3
```

### Multiplication Table Example

```csharp
for (int i = 1; i <= 5; i++)
{
    for (int j = 1; j <= 5; j++)
    {
        Console.Write($"{i * j}\t");
    }
    Console.WriteLine();
}
```

**Output:**
```
1	2	3	4	5
2	4	6	8	10
3	6	9	12	15
4	8	12	16	20
5	10	15	20	25
```

---

## For Loop vs Foreach

| Feature | for | foreach |
|---------|-----|---------|
| Know iteration count | Required | Not required |
| Access by index | Yes | No |
| Modify elements | Yes | No |
| Iterate backward | Yes | No |
| Skip elements | Yes | No |
| Simpler syntax | No | Yes |
| Works with IEnumerable | Yes | Yes |

### When to Use For

- You need to know the current index
- You need to iterate backward
- You need to modify array elements
- You need to skip elements or use custom step increments
- You need precise control over iteration

### When to Use Foreach

- Simple forward iteration
- You don't need the index
- Read-only access to elements
- Cleaner, more readable code

---

## Optional Sections

All three sections (initializer, condition, iterator) are technically optional:

```csharp
// Infinite loop (use with caution!)
for (;;)
{
    // Will run forever unless break is used
}

// External iterator variable
int i = 0;
for (; i < 10; i++)
{
    Console.WriteLine(i);
}
// 'i' is still accessible here
```

> **Warning:** Omitting sections can make code harder to understand. Use standard syntax when possible.

---

## Key Takeaways

1. Use `for` when you know the **number of iterations** ahead of time
2. The loop has three parts: **initializer**, **condition**, and **iterator**
3. Use `i++` to count up, `i--` to count down
4. Use `i += n` for custom step increments
5. Use `break` to exit early and `continue` to skip iterations
6. `for` allows **backward iteration** and **element modification** (unlike `foreach`)
7. Use `array.Length` to iterate through all array elements

---

## Related Topics

- [[docs/csharp/BooleanExpressions\|Boolean Expressions]]
- [[docs/csharp/CodeBlocksVariableScope\|Code Blocks and Variable Scope]]
- [[docs/csharp/SwitchStatement\|Switch Statement]]
- [[docs/csharp/CSharp_Learning\|C# Learning Guide]]
- While Loop
- Foreach Loop
- Arrays and Collections

---

## Source

- [Microsoft Learn: For Loop](https://learn.microsoft.com/en-us/training/modules/csharp-for/2-exercise-for)

---

#csharp #programming #loops #for-loop #iteration #fundamentals #control-flow
