---
{"dg-publish":true,"permalink":"/docs/csharp/switch-statement/","tags":["switch","if-else","if","else","escape-sequences","case"]}
---


# Switch Statement in C#

## Overview

A `switch` statement is a selection statement that provides a cleaner alternative to `if-elseif-else` branching when you need to match a single value against multiple possible values.

---

## When to Use Switch vs If-Else

| Use Switch When | Use If-Else When |
|-----------------|------------------|
| Matching a single value against many options | Evaluating complex Boolean expressions |
| Each case requires only a few lines of code | Conditions involve ranges or comparisons |
| Testing equality against discrete values | Logic varies significantly between branches |

---

## Basic Syntax

```csharp
switch (expression)
{
    case value1:
        // Code to execute
        break;
    case value2:
        // Code to execute
        break;
    default:
        // Code if no case matches
        break;
}
```

---

## Switch Statement Components

### 1. Switch Expression

The value inside the parentheses that gets evaluated against each case.

```csharp
string fruit = "apple";

switch (fruit)  // 'fruit' is the switch expression
{
    // cases here
}
```

### 2. Case Labels

Each `case` defines a value to match against the switch expression.

```csharp
switch (fruit)
{
    case "apple":
        Console.WriteLine("App will display information for apple.");
        break;

    case "banana":
        Console.WriteLine("App will display information for banana.");
        break;

    case "cherry":
        Console.WriteLine("App will display information for cherry.");
        break;
}
```

> **Note:** Case values must match the data type of the switch expression.

### 3. Break Statement

The `break` keyword exits the switch block and prevents "fall-through" to the next case.

```csharp
case "apple":
    Console.WriteLine("Selected apple");
    break;  // Required! Exits the switch here
```

**Important:** Every switch section must end with `break` (or `return`), otherwise the compiler generates an error.

### 4. Default Case

The `default` case executes when no other case matches. It's optional but recommended.

```csharp
switch (fruit)
{
    case "apple":
        Console.WriteLine("Apple selected");
        break;
    default:
        Console.WriteLine("Unknown fruit");
        break;
}
```

> **Note:** The `default` case can appear anywhere in the switch, but it's always evaluated last. By convention, place it at the end.

---

## Multiple Case Labels

You can assign multiple case labels to a single code block when different values should execute the same code.

```csharp
int employeeLevel = 200;
string title;

switch (employeeLevel)
{
    case 100:
    case 200:
        title = "Senior Associate";  // Executes for both 100 and 200
        break;
    case 300:
        title = "Manager";
        break;
    case 400:
        title = "Senior Manager";
        break;
    default:
        title = "Associate";
        break;
}
```

This is equivalent to using `||` (OR) in an if statement:

```csharp
// Equivalent if-else
if (employeeLevel == 100 || employeeLevel == 200)
{
    title = "Senior Associate";
}
```

---

## Complete Example

```csharp
int employeeLevel = 200;
string employeeName = "John Smith";
string title = "";

switch (employeeLevel)
{
    case 100:
    case 200:
        title = "Senior Associate";
        break;
    case 300:
        title = "Manager";
        break;
    case 400:
        title = "Senior Manager";
        break;
    default:
        title = "Associate";
        break;
}

Console.WriteLine($"{employeeName}, {title}");
```

**Output:**
```
John Smith, Senior Associate
```

---

## Switch with Strings

```csharp
string command = "start";

switch (command.ToLower())  // Normalize input
{
    case "start":
        Console.WriteLine("Starting the process...");
        break;
    case "stop":
        Console.WriteLine("Stopping the process...");
        break;
    case "pause":
        Console.WriteLine("Pausing the process...");
        break;
    default:
        Console.WriteLine("Unknown command");
        break;
}
```

---

## Switch with Enums

Switch statements work great with enums for type-safe value matching.

```csharp
enum DayOfWeek { Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday }

DayOfWeek today = DayOfWeek.Wednesday;

switch (today)
{
    case DayOfWeek.Saturday:
    case DayOfWeek.Sunday:
        Console.WriteLine("It's the weekend!");
        break;
    case DayOfWeek.Friday:
        Console.WriteLine("TGIF!");
        break;
    default:
        Console.WriteLine("Regular workday");
        break;
}
```

---

## Common Mistakes to Avoid

### Missing Break Statement

```csharp
// ❌ Wrong - Missing break causes compiler error
switch (value)
{
    case 1:
        Console.WriteLine("One");
        // Error: Control cannot fall through
    case 2:
        Console.WriteLine("Two");
        break;
}
```

### Case Value Type Mismatch

```csharp
int number = 5;

// ❌ Wrong - Can't use string case with int switch
switch (number)
{
    case "five":  // Compiler error!
        break;
}
```

### Duplicate Case Labels

```csharp
// ❌ Wrong - Duplicate case values
switch (value)
{
    case 1:
        Console.WriteLine("First one");
        break;
    case 1:  // Compiler error: duplicate case label
        Console.WriteLine("Second one");
        break;
}
```

---

## Switch vs If-Else Comparison

```csharp
// Using if-else (more verbose)
string title;
if (employeeLevel == 100 || employeeLevel == 200)
{
    title = "Senior Associate";
}
else if (employeeLevel == 300)
{
    title = "Manager";
}
else if (employeeLevel == 400)
{
    title = "Senior Manager";
}
else
{
    title = "Associate";
}

// Using switch (cleaner)
switch (employeeLevel)
{
    case 100:
    case 200:
        title = "Senior Associate";
        break;
    case 300:
        title = "Manager";
        break;
    case 400:
        title = "Senior Manager";
        break;
    default:
        title = "Associate";
        break;
}
```

---

## Key Takeaways

1. Use `switch` when matching **one value** against **many possible values**
2. Each switch section must end with `break` or `return`
3. Multiple case labels can share the same code block
4. The `default` case handles unmatched values (always evaluated last)
5. Only **one** switch section executes per switch invocation
6. Case values must match the switch expression's **data type**

---

## Related Topics

- [[docs/csharp/BooleanExpressions\|Boolean Expressions]]
- [[docs/csharp/CodeBlocksVariableScope\|Code Blocks and Variable Scope]]
- [[docs/csharp/CSharp_Learning\|C# Learning Guide]]
- Switch Expressions (C# 8.0+)
- Pattern Matching

---

## Source

- [Microsoft Learn: Switch Case](https://learn.microsoft.com/en-us/training/modules/csharp-switch-case/2-exercise-switch-case)

---

#csharp #programming #switch #control-flow #fundamentals #selection-statements
