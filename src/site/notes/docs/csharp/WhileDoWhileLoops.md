---
{"dg-publish":true,"permalink":"/docs/csharp/while-do-while-loops/","tags":["loops","while-loop","do-while","break","continue"]}
---

# While and Do-While Loops in C#

## Overview

Both `while` and `do-while` are iteration statements that allow you to execute a code block repeatedly based on a Boolean condition. The key difference is **when** the condition is evaluated.

---

## While Loop

The `while` loop evaluates the condition **before** executing the code block.

### Syntax

```csharp
while (condition)
{
    // Code executes zero or more times
}
```

### Key Characteristics

- **Pre-evaluation**: Condition is checked before each iteration
- **May never execute**: If condition is initially `false`, code block never runs
- **Acts as a gate**: Only allows execution when condition is `true`

### Example: Random Numbers While >= 3

```csharp
Random random = new Random();
int current = random.Next(1, 11);

while (current >= 3)
{
    Console.WriteLine(current);
    current = random.Next(1, 11);
}

Console.WriteLine($"Last number: {current}");
```

**Possible Output:**
```
9
5
4
3
Last number: 2
```

### Flow Diagram

```
         ┌──────────────┐
         │    Start     │
         └──────┬───────┘
                │
                ▼
        ┌───────────────┐
        │   Condition   │◄─────────┐
        │    true?      │          │
        └───────┬───────┘          │
           │         │             │
      true │         │ false       │
           ▼         │             │
   ┌───────────────┐ │             │
   │  Code Block   │ │             │
   └───────┬───────┘ │             │
           │         │             │
           └─────────┼─────────────┘
                     │
                     ▼
              ┌──────────┐
              │   End    │
              └──────────┘
```

---

## Do-While Loop

The `do-while` loop executes the code block **first**, then evaluates the condition.

### Syntax

```csharp
do
{
    // Code executes at least once
} while (condition);
```

> **Note:** Don't forget the semicolon `;` after the `while` condition!

### Key Characteristics

- **Post-evaluation**: Condition is checked after each iteration
- **Always executes at least once**: Code runs before any condition check
- **Best for user input**: Guarantees at least one prompt to the user

### Example: Random Numbers Until 7

```csharp
Random random = new Random();
int current = 0;

do
{
    current = random.Next(1, 11);
    Console.WriteLine(current);
} while (current != 7);
```

**Possible Output:**
```
3
9
2
7
```

The loop always prints at least one number before checking if it should continue.

### Flow Diagram

```
         ┌──────────────┐
         │    Start     │
         └──────┬───────┘
                │
                ▼
        ┌───────────────┐
        │  Code Block   │◄─────────┐
        └───────┬───────┘          │
                │                  │
                ▼                  │
        ┌───────────────┐          │
        │   Condition   │          │
        │    true?      │          │
        └───────┬───────┘          │
           │         │             │
      true │         │ false       │
           │         │             │
           └─────────┼─────────────┘
                     │
                     ▼
              ┌──────────┐
              │   End    │
              └──────────┘
```

---

## While vs Do-While Comparison

| Feature | while | do-while |
|---------|-------|----------|
| Condition evaluated | **Before** code block | **After** code block |
| Minimum executions | Zero (may never run) | One (always runs once) |
| Syntax ends with | `}` | `} while (condition);` |
| Best for | Conditional iterations | User input, menus |

### Visual Comparison

```csharp
// while: checks FIRST, might never run
int x = 10;
while (x < 5)
{
    Console.WriteLine(x);  // Never executes!
    x++;
}

// do-while: runs FIRST, then checks
int y = 10;
do
{
    Console.WriteLine(y);  // Prints "10" once
    y++;
} while (y < 5);
```

---

## The Continue Statement

The `continue` statement skips the remainder of the current iteration and jumps directly to the condition evaluation.

### Example: Skip Numbers >= 8

```csharp
Random random = new Random();
int current = 0;

do
{
    current = random.Next(1, 11);

    if (current >= 8)
    {
        continue;  // Skip printing, go to while condition
    }

    Console.WriteLine(current);
} while (current != 7);
```

**Possible Output:**
```
3
5
2
7
```

Numbers 8, 9, and 10 are never printed because `continue` skips the `Console.WriteLine()`.

### Continue vs Break

| Keyword | Action | Loop continues? |
|---------|--------|-----------------|
| `continue` | Skips to next iteration | Yes |
| `break` | Exits the loop entirely | No |

```csharp
// continue: skips current iteration
for (int i = 0; i < 5; i++)
{
    if (i == 2) continue;
    Console.WriteLine(i);
}
// Output: 0 1 3 4

// break: exits completely
for (int i = 0; i < 5; i++)
{
    if (i == 2) break;
    Console.WriteLine(i);
}
// Output: 0 1
```

---

## Practical Examples

### User Input Validation (do-while)

```csharp
string input;

do
{
    Console.Write("Enter a valid command (start/stop/exit): ");
    input = Console.ReadLine().ToLower().Trim();

    if (input != "start" && input != "stop" && input != "exit")
    {
        Console.WriteLine("Invalid command. Try again.");
    }
} while (input != "exit");

Console.WriteLine("Goodbye!");
```

### Menu System (do-while)

```csharp
int choice;

do
{
    Console.WriteLine("\n--- Menu ---");
    Console.WriteLine("1. View Profile");
    Console.WriteLine("2. Edit Settings");
    Console.WriteLine("3. Exit");
    Console.Write("Enter choice: ");

    choice = int.Parse(Console.ReadLine());

    switch (choice)
    {
        case 1:
            Console.WriteLine("Displaying profile...");
            break;
        case 2:
            Console.WriteLine("Opening settings...");
            break;
        case 3:
            Console.WriteLine("Exiting...");
            break;
        default:
            Console.WriteLine("Invalid option!");
            break;
    }
} while (choice != 3);
```

### Countdown Timer (while)

```csharp
int seconds = 10;

while (seconds > 0)
{
    Console.WriteLine($"Time remaining: {seconds}");
    seconds--;
    // Thread.Sleep(1000); // Wait 1 second
}

Console.WriteLine("Time's up!");
```

### Reading Until Empty Line (while)

```csharp
Console.WriteLine("Enter lines of text (empty line to stop):");

string line = Console.ReadLine();

while (!string.IsNullOrEmpty(line))
{
    Console.WriteLine($"You entered: {line}");
    line = Console.ReadLine();
}

Console.WriteLine("Done!");
```

---

## Infinite Loops

Both `while` and `do-while` can create infinite loops. Use `break` to exit.

```csharp
// Infinite while loop
while (true)
{
    Console.Write("Enter 'quit' to exit: ");
    string input = Console.ReadLine();

    if (input == "quit")
    {
        break;  // Exit the infinite loop
    }

    Console.WriteLine($"You said: {input}");
}
```

> **Warning:** Always ensure there's a way to exit an infinite loop to avoid your program hanging.

---

## When to Use Each Loop Type

| Loop Type | Best For |
|-----------|----------|
| `while` | When code might not need to run at all |
| `do-while` | When code must run at least once (user input, menus) |
| `for` | When you know the exact number of iterations |
| `foreach` | When iterating through collections without modification |

---

## Key Takeaways

1. `while` evaluates the condition **before** executing (may never run)
2. `do-while` evaluates the condition **after** executing (runs at least once)
3. Use `do-while` for **user input** and **menu systems**
4. Use `continue` to **skip** the current iteration
5. Use `break` to **exit** the loop entirely
6. Always ensure a way to exit loops to avoid **infinite loops**
7. Don't forget the **semicolon** after `do-while`: `} while (condition);`

---

## Related Topics

- [[docs/csharp/ForLoop\|For Loop]]
- [[docs/csharp/BooleanExpressions\|Boolean Expressions]]
- [[docs/csharp/CodeBlocksVariableScope\|Code Blocks and Variable Scope]]
- [[docs/csharp/SwitchStatement\|Switch Statement]]
- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- Foreach Loop
- Break and Continue Statements

---

## Source

- [Microsoft Learn: Do-While and While Loops](https://learn.microsoft.com/en-us/training/modules/csharp-do-while/2-exercise-do-while-continue)

---

#csharp #programming #loops #while-loop #do-while #iteration #fundamentals #control-flow
