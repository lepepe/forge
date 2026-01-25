---
{"dg-publish":true,"permalink":"/docs/csharp/casting-conversion/","tags":["string-manipulation","conversion","data-types","conversions"]}
---

# Data Type Casting and Conversion in C#

## Overview

When working with different data types in C#, you often need to convert values from one type to another. Understanding when and how to perform these conversions safely is essential.

### Two Critical Questions

Before converting data types, always ask:

1. **Will the conversion throw an exception at runtime?**
2. **Will the conversion result in loss of information?**

---

## Implicit vs Explicit Conversion

### Implicit Conversion (Widening)

Converting from a data type that holds **less** information to one that holds **more**. The compiler handles this automatically because it's always safe.

```csharp
int myInt = 3;
decimal myDecimal = myInt;  // Implicit conversion (safe)

Console.WriteLine(myDecimal);  // Output: 3
```

**Safe implicit conversions:**
```
byte → short → int → long → float → double
                 ↓
              decimal
```

### Explicit Conversion / Casting (Narrowing)

Converting from a data type that holds **more** information to one that holds **less**. Requires the cast operator `()` because data loss may occur.

```csharp
decimal myDecimal = 3.14m;
int myInt = (int)myDecimal;  // Explicit cast required

Console.WriteLine(myInt);  // Output: 3 (decimal portion lost!)
```

---

## Casting Syntax

```csharp
(targetType)value
```

### Examples

```csharp
// double to int (loses decimal)
double price = 19.99;
int roundedDown = (int)price;  // 19

// long to int (may overflow)
long bigNumber = 3000000000;
int smaller = (int)bigNumber;  // Potential overflow!

// float to int
float temperature = 98.6f;
int tempInt = (int)temperature;  // 98
```

---

## Why the Compiler Restricts Conversions

The compiler prevents implicit conversions that could fail at runtime.

```csharp
// ❌ Compiler Error: Cannot implicitly convert 'string' to 'int'
int result = 2 + "4";

// ✅ Works: String concatenation
string result = 2 + "4";  // Output: "24"
```

The string `"4"` could contain `"hello"`, which cannot become an integer. The compiler forces you to handle this explicitly.

---

## Conversion Techniques

### 1. ToString() Method

Converts any value to its string representation. Available on all data types.

```csharp
int first = 5;
int second = 7;

string message = first.ToString() + second.ToString();
Console.WriteLine(message);  // Output: "57"

// Other examples
bool flag = true;
Console.WriteLine(flag.ToString());  // "True"

double pi = 3.14159;
Console.WriteLine(pi.ToString());    // "3.14159"
```

---

### 2. Parse() Method

Converts a string to a specific data type. **Throws an exception** if conversion fails.

```csharp
string first = "5";
string second = "7";

int sum = int.Parse(first) + int.Parse(second);
Console.WriteLine(sum);  // Output: 12
```

**Available Parse methods:**

| Type | Method |
|------|--------|
| `int` | `int.Parse(string)` |
| `double` | `double.Parse(string)` |
| `decimal` | `decimal.Parse(string)` |
| `float` | `float.Parse(string)` |
| `bool` | `bool.Parse(string)` |
| `long` | `long.Parse(string)` |

**Danger: Runtime Exception**

```csharp
// ❌ Throws FormatException at runtime!
int number = int.Parse("hello");

// ❌ Throws FormatException (empty string)
int number = int.Parse("");

// ❌ Throws ArgumentNullException
int number = int.Parse(null);
```

---

### 3. TryParse() Method (Recommended)

Safely attempts conversion without throwing exceptions. Returns `true` if successful, `false` if not.

```csharp
string input = "123";

if (int.TryParse(input, out int result))
{
    Console.WriteLine($"Conversion successful: {result}");
}
else
{
    Console.WriteLine("Conversion failed");
}
```

**Handling Invalid Input:**

```csharp
string userInput = "hello";

if (int.TryParse(userInput, out int number))
{
    Console.WriteLine($"You entered: {number}");
}
else
{
    Console.WriteLine("Please enter a valid number");
}
```

**TryParse with Default Value:**

```csharp
string input = "not a number";

int.TryParse(input, out int value);  // value will be 0 if parsing fails

Console.WriteLine(value);  // Output: 0
```

---

### 4. Convert Class

The `System.Convert` class provides methods for converting between data types. **Key difference from casting: it rounds instead of truncating.**

```csharp
string value1 = "5";
string value2 = "7";

int result = Convert.ToInt32(value1) * Convert.ToInt32(value2);
Console.WriteLine(result);  // Output: 35
```

**Common Convert Methods:**

| Method | Converts To |
|--------|-------------|
| `Convert.ToInt32()` | int |
| `Convert.ToInt64()` | long |
| `Convert.ToDouble()` | double |
| `Convert.ToDecimal()` | decimal |
| `Convert.ToBoolean()` | bool |
| `Convert.ToString()` | string |
| `Convert.ToChar()` | char |
| `Convert.ToByte()` | byte |

> **Note:** The method is `ToInt32()` not `ToInt()` because `System.Int32` is the official .NET name. The `Convert` class uses official names to support all .NET languages (C#, VB.NET, F#).

---

## Casting vs Converting: Critical Difference

### Casting Truncates

```csharp
int value = (int)1.5m;
Console.WriteLine(value);  // Output: 1

int value2 = (int)2.9m;
Console.WriteLine(value2);  // Output: 2
```

### Convert Rounds

```csharp
int value = Convert.ToInt32(1.5);
Console.WriteLine(value);  // Output: 2

int value2 = Convert.ToInt32(2.9);
Console.WriteLine(value2);  // Output: 3

int value3 = Convert.ToInt32(2.4);
Console.WriteLine(value3);  // Output: 2
```

### Side-by-Side Comparison

```csharp
double number = 3.7;

int casted = (int)number;           // 3 (truncated)
int converted = Convert.ToInt32(number);  // 4 (rounded)

Console.WriteLine($"Casted: {casted}");      // 3
Console.WriteLine($"Converted: {converted}"); // 4
```

---

## Conversion Decision Flowchart

```
                    ┌─────────────────────┐
                    │  Need to Convert?   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
     ┌────────────────┐ ┌────────────┐ ┌───────────────┐
     │ Widening       │ │ Narrowing  │ │ String ↔      │
     │ (safe)         │ │ (data loss)│ │ Number        │
     └───────┬────────┘ └─────┬──────┘ └───────┬───────┘
             │                │                │
             ▼                ▼                ▼
     ┌────────────────┐ ┌────────────┐ ┌───────────────┐
     │ Use Implicit   │ │ Use Cast   │ │ Use TryParse  │
     │ Conversion     │ │ (type)     │ │ (recommended) │
     └────────────────┘ │ or Convert │ │ or Parse      │
                        └────────────┘ └───────────────┘
```

---

## Practical Examples

### User Input Processing

```csharp
Console.Write("Enter your age: ");
string input = Console.ReadLine();

if (int.TryParse(input, out int age))
{
    Console.WriteLine($"You are {age} years old.");
}
else
{
    Console.WriteLine("Invalid age entered.");
}
```

### Calculator with Mixed Types

```csharp
string num1 = "10";
string num2 = "3";

// Parse strings to integers
int a = int.Parse(num1);
int b = int.Parse(num2);

// Division with decimal result
decimal result = (decimal)a / b;  // Cast to get decimal division
Console.WriteLine(result);  // Output: 3.333...
```

### Formatting Currency

```csharp
int cents = 1999;
decimal dollars = cents / 100m;  // Implicit widening

Console.WriteLine($"Price: ${dollars:F2}");  // Output: Price: $19.99
```

---

## Quick Reference Table

| Scenario | Technique | Example |
|----------|-----------|---------|
| Widening (safe) | Implicit | `decimal d = intValue;` |
| Narrowing (truncate) | Cast | `int i = (int)decimalValue;` |
| Narrowing (round) | Convert | `int i = Convert.ToInt32(doubleValue);` |
| String → Number (safe) | TryParse | `int.TryParse(str, out int n)` |
| String → Number (risky) | Parse | `int.Parse(str)` |
| Any → String | ToString | `value.ToString()` |

---

## Common Pitfalls

### Integer Division

```csharp
// ❌ Wrong: Integer division loses decimal
int a = 5;
int b = 2;
double result = a / b;  // 2.0 (not 2.5!)

// ✅ Correct: Cast first
double result = (double)a / b;  // 2.5
```

### Overflow

```csharp
// ❌ Dangerous: Overflow without warning
int maxInt = int.MaxValue;  // 2,147,483,647
int overflow = maxInt + 1;  // -2,147,483,648 (wraps around!)

// ✅ Use checked for safety
checked
{
    int overflow = maxInt + 1;  // Throws OverflowException
}
```

---

## Key Takeaways

1. **Implicit conversion** is automatic for widening (safe) conversions
2. **Explicit casting** `(type)` is required for narrowing conversions (may lose data)
3. **Casting truncates**; **Convert rounds**
4. Use **TryParse()** for safe string-to-number conversion (no exceptions)
5. Use **Parse()** only when you're certain the string is valid
6. **Convert class** methods use .NET type names (`ToInt32`, not `ToInt`)
7. Always consider potential **data loss** and **runtime exceptions**

---

## Related Topics

- [[docs/csharp/ValueReferenceTypes\|Value Types and Reference Types]]
- [[docs/csharp/BooleanExpressions\|Boolean Expressions]]
- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- String Formatting
- Exception Handling

---

## Source

- [Microsoft Learn: Data Type Conversion](https://learn.microsoft.com/en-us/training/modules/csharp-convert-cast/2-exercise-data-type-conversion)

---

#csharp #programming #casting #conversion #data-types #fundamentals #type-safety
