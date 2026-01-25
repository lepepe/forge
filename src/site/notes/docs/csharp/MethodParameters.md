---
{"dg-publish":true,"permalink":"/docs/csharp/method-parameters/","tags":["methods","parameters","arguments","types","variables"]}
---

# Method Parameters in C#

## Overview

**Parameters** allow methods to receive data from the caller, making methods flexible and reusable. Understanding how parameters work is essential for writing effective C# code.

---

## Terminology

| Term | Definition | Location |
|------|------------|----------|
| **Parameter** | Variable declared in method signature | Method definition |
| **Argument** | Value passed when calling the method | Method call |

```csharp
//              parameter
//                  ↓
void Greet(string name)
{
    Console.WriteLine($"Hello, {name}!");
}

//         argument
//            ↓
Greet("Alice");
```

---

## Declaring Parameters

Parameters are declared by specifying the **data type** followed by the **parameter name**.

### Single Parameter

```csharp
void CountTo(int max)
{
    for (int i = 1; i <= max; i++)
    {
        Console.Write($"{i} ");
    }
    Console.WriteLine();
}

// Usage
CountTo(5);  // Output: 1 2 3 4 5
```

### Multiple Parameters

Multiple parameters are separated by commas:

```csharp
void DisplayInfo(string name, int age, string city)
{
    Console.WriteLine($"Name: {name}");
    Console.WriteLine($"Age: {age}");
    Console.WriteLine($"City: {city}");
}

// Usage
DisplayInfo("John", 30, "New York");
```

---

## Parameter Types

Parameters can be of **any data type**:

```csharp
void ProcessString(string text) { }
void ProcessInt(int number) { }
void ProcessBool(bool flag) { }
void ProcessDouble(double value) { }
void ProcessArray(int[] numbers) { }
void ProcessMultiple(string name, int count, bool active) { }
```

---

## Passing Arguments

Arguments can be **literal values** or **variables**:

### Literal Values

```csharp
void PrintMessage(string message, int times)
{
    for (int i = 0; i < times; i++)
    {
        Console.WriteLine(message);
    }
}

// Passing literals directly
PrintMessage("Hello!", 3);
```

### Variables

```csharp
string greeting = "Welcome";
int repeatCount = 2;

// Passing variables
PrintMessage(greeting, repeatCount);
```

### Mixed

```csharp
string message = "Hi there";

// Mixing variables and literals
PrintMessage(message, 5);
```

---

## Value Types vs Reference Types as Parameters

Understanding how different types behave when passed to methods is crucial.

### Value Types (Pass by Value)

When you pass a **value type** (int, double, bool, etc.), the method receives a **copy** of the value. Changes inside the method do **not** affect the original.

```csharp
void DoubleValue(int number)
{
    number = number * 2;
    Console.WriteLine($"Inside method: {number}");
}

int myNumber = 5;
Console.WriteLine($"Before: {myNumber}");  // Before: 5

DoubleValue(myNumber);                      // Inside method: 10

Console.WriteLine($"After: {myNumber}");   // After: 5 (unchanged!)
```

### Reference Types (Arrays, Objects)

When you pass a **reference type** (arrays, strings, objects), the method receives a **reference** to the same data. Changes to the **contents** affect the original.

```csharp
void DoubleArrayValues(int[] numbers)
{
    for (int i = 0; i < numbers.Length; i++)
    {
        numbers[i] = numbers[i] * 2;
    }
}

int[] myArray = { 1, 2, 3, 4, 5 };

Console.WriteLine($"Before: {string.Join(", ", myArray)}");
// Before: 1, 2, 3, 4, 5

DoubleArrayValues(myArray);

Console.WriteLine($"After: {string.Join(", ", myArray)}");
// After: 2, 4, 6, 8, 10 (changed!)
```

### Visual Comparison

```
VALUE TYPE (int):
┌─────────────┐      ┌─────────────┐
│ myNumber: 5 │ ───► │ number: 5   │  (copy)
└─────────────┘      └─────────────┘
   Original            Method's copy
   (unchanged)         (can modify)


REFERENCE TYPE (array):
┌─────────────┐      ┌─────────────┐
│  myArray    │ ───► │  numbers    │  (same reference)
└──────┬──────┘      └──────┬──────┘
       │                    │
       └────────┬───────────┘
                ▼
         ┌─────────────┐
         │ [1,2,3,4,5] │  (shared data)
         └─────────────┘
```

---

## Strings: A Special Case

Strings are reference types but **behave like value types** because they are **immutable**. When you "modify" a string, a new string is created.

```csharp
void ModifyString(string text)
{
    text = text.ToUpper();
    Console.WriteLine($"Inside: {text}");
}

string message = "hello";
Console.WriteLine($"Before: {message}");  // Before: hello

ModifyString(message);                     // Inside: HELLO

Console.WriteLine($"After: {message}");   // After: hello (unchanged!)
```

---

## Practical Example: Time Zone Converter

```csharp
void DisplayAdjustedTimes(int[] times, int currentGMT, int newGMT)
{
    int diff = newGMT - currentGMT;

    Console.WriteLine($"Current GMT: {currentGMT}");
    Console.WriteLine($"New GMT: {newGMT}");
    Console.WriteLine($"Difference: {diff} hours");
    Console.WriteLine();

    for (int i = 0; i < times.Length; i++)
    {
        int adjustedTime = times[i] + diff;

        // Handle wrap-around for 24-hour clock
        if (adjustedTime > 24)
            adjustedTime -= 24;
        else if (adjustedTime < 0)
            adjustedTime += 24;

        Console.WriteLine($"{times[i]}:00 -> {adjustedTime}:00");
    }
}

// Usage
int[] schedule = { 9, 12, 15, 18, 21 };
DisplayAdjustedTimes(schedule, 0, -5);  // UTC to EST
```

**Output:**
```
Current GMT: 0
New GMT: -5
Difference: -5 hours

9:00 -> 4:00
12:00 -> 7:00
15:00 -> 10:00
18:00 -> 13:00
21:00 -> 16:00
```

---

## Parameter Scope

Parameters are only accessible within the method where they are declared.

```csharp
void ProcessData(int value)
{
    // 'value' is accessible here
    Console.WriteLine(value);
}

// 'value' is NOT accessible here
// Console.WriteLine(value);  // Error!
```

### Parameters Don't Need Initialization

Unlike regular variables, parameters are initialized by the **caller**, not inside the method:

```csharp
void Calculate(int x, int y)
{
    // x and y already have values from the caller
    // No need to initialize them
    int result = x + y;
    Console.WriteLine(result);
}

Calculate(5, 3);  // x=5, y=3, passed by caller
```

---

## Parameter Order Matters

Arguments are matched to parameters by **position**:

```csharp
void PrintDetails(string name, int age, string city)
{
    Console.WriteLine($"{name}, {age}, {city}");
}

// Correct order
PrintDetails("Alice", 25, "Boston");  // Alice, 25, Boston

// Wrong order - still compiles but wrong data!
// PrintDetails(25, "Alice", "Boston");  // Compiler error (type mismatch)

// Same types in wrong order - logical error
void Calculate(int dividend, int divisor)
{
    Console.WriteLine(dividend / divisor);
}

Calculate(10, 2);  // 5 (10 ÷ 2)
Calculate(2, 10);  // 0 (2 ÷ 10, integer division)
```

---

## Named Arguments

Use named arguments for clarity or to pass arguments in any order:

```csharp
void CreateUser(string firstName, string lastName, int age)
{
    Console.WriteLine($"{firstName} {lastName}, Age: {age}");
}

// Positional (normal)
CreateUser("John", "Doe", 30);

// Named arguments
CreateUser(firstName: "John", lastName: "Doe", age: 30);

// Named arguments in different order
CreateUser(age: 30, lastName: "Doe", firstName: "John");

// Mix positional and named (positional must come first)
CreateUser("John", age: 30, lastName: "Doe");
```

---

## Optional Parameters

Parameters can have **default values**, making them optional:

```csharp
void Greet(string name, string greeting = "Hello")
{
    Console.WriteLine($"{greeting}, {name}!");
}

// Using default value
Greet("Alice");              // Hello, Alice!

// Providing custom value
Greet("Bob", "Welcome");     // Welcome, Bob!
```

### Rules for Optional Parameters

1. Optional parameters must come **after** required parameters
2. Optional parameters must have a **default value**

```csharp
// ✅ Correct - optional after required
void Log(string message, string level = "INFO", bool timestamp = true)

// ❌ Wrong - optional before required
// void Log(string level = "INFO", string message)  // Compiler error
```

### Multiple Optional Parameters

```csharp
void ConfigureSettings(
    string username,
    string theme = "dark",
    int fontSize = 14,
    bool notifications = true)
{
    Console.WriteLine($"User: {username}");
    Console.WriteLine($"Theme: {theme}");
    Console.WriteLine($"Font Size: {fontSize}");
    Console.WriteLine($"Notifications: {notifications}");
}

// All defaults
ConfigureSettings("Alice");

// Override some
ConfigureSettings("Bob", fontSize: 18);

// Override all
ConfigureSettings("Charlie", "light", 16, false);
```

---

## Quick Reference

| Concept | Example |
|---------|---------|
| Single parameter | `void Print(string msg)` |
| Multiple parameters | `void Add(int a, int b)` |
| Array parameter | `void Process(int[] data)` |
| Named argument | `Method(name: "value")` |
| Optional parameter | `void Log(string msg, string level = "INFO")` |
| Pass literal | `Method(42)` |
| Pass variable | `Method(myVariable)` |

---

## Key Takeaways

1. **Parameters** are variables in the method definition; **arguments** are values passed when calling
2. Parameters can be of **any data type**: int, string, bool, arrays, etc.
3. **Value types** are passed by value (copy)—changes don't affect the original
4. **Reference types** (arrays, objects) share the same data—changes affect the original
5. **Strings** are immutable, so they behave like value types
6. Parameters are initialized by the **caller**, not inside the method
7. Argument **order matters**—they match parameters by position
8. Use **named arguments** for clarity or to change the order
9. **Optional parameters** have default values and must come after required ones
10. Parameter **scope** is limited to the method body

---

## Related Topics

- [[docs/csharp/MethodsSyntax\|Methods Syntax]]
- [[docs/csharp/ValueReferenceTypes\|Value Types and Reference Types]]
- [[docs/csharp/CodeBlocksVariableScope\|Code Blocks and Variable Scope]]
- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- ref and out Parameters
- params Keyword
- Method Overloading

---

## Source

- [Microsoft Learn: Add Parameters to Methods](https://learn.microsoft.com/en-us/training/modules/create-c-sharp-methods-parameters/2-exercise-add-parameters-to-methods)

---

#csharp #programming #methods #parameters #arguments #fundamentals
