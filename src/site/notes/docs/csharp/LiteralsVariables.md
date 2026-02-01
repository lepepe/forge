---
{"dg-publish":true,"permalink":"/docs/csharp/literals-variables/","tags":["csharp","variables","literals","types","integers"]}
---

# Literals and Variables in C#

## Overview

Understanding **literals** and **variables** is fundamental to programming in C#. They represent how data is stored and used in your applications.

---

## What is a Literal?

A **literal** is a constant value that never changes—data written exactly as it should appear. Literals represent fixed values in your code.

```csharp
Console.WriteLine("Hello World");  // "Hello World" is a string literal
Console.WriteLine(42);              // 42 is an integer literal
Console.WriteLine(true);            // true is a boolean literal
```

---

## Types of Literals

### String Literals

Text enclosed in **double quotes** (`"`):

```csharp
Console.WriteLine("Hello, World!");
Console.WriteLine("This is a string literal");
Console.WriteLine("12345");  // Still a string, not a number
```

### Character Literals

A **single character** enclosed in **single quotes** (`'`):

```csharp
Console.WriteLine('A');
Console.WriteLine('b');
Console.WriteLine('7');
Console.WriteLine('!');
```

> **Important:** Single quotes for `char`, double quotes for `string`.

```csharp
'A'   // char literal (single character)
"A"   // string literal (can hold multiple characters)
```

### Integer Literals

Whole numbers without decimal points:

```csharp
Console.WriteLine(123);
Console.WriteLine(-456);
Console.WriteLine(0);
Console.WriteLine(1000000);
```

### Floating-Point Literals

Numbers with decimal points. C# has three floating-point types:

| Type | Precision | Suffix | Example |
|------|-----------|--------|---------|
| `float` | ~6-9 digits | `F` or `f` | `3.14F` |
| `double` | ~15-17 digits | None (default) | `3.14159` |
| `decimal` | 28-29 digits | `M` or `m` | `19.99m` |

```csharp
Console.WriteLine(0.25F);       // float literal
Console.WriteLine(2.625);       // double literal (default)
Console.WriteLine(12.39816m);   // decimal literal
```

> **Note:** Without a suffix, decimal numbers default to `double`.

### Boolean Literals

Only two possible values:

```csharp
Console.WriteLine(true);   // Outputs: True
Console.WriteLine(false);  // Outputs: False
```

---

## Literal Suffixes

Suffixes tell the compiler which data type to use:

| Suffix | Type | Example |
|--------|------|---------|
| `F` or `f` | float | `3.14F` |
| `D` or `d` | double | `3.14D` |
| `M` or `m` | decimal | `19.99m` |
| `L` or `l` | long | `9999999999L` |
| `U` or `u` | uint | `42U` |
| `UL` or `ul` | ulong | `9999999999UL` |

```csharp
float price = 9.99F;
double pi = 3.14159265359;
decimal salary = 75000.50m;
long bigNumber = 9876543210L;
```

---

## What is a Variable?

A **variable** is a named container that stores a value. Unlike literals, variables can change during program execution.

### Declaring Variables

```csharp
// Syntax: dataType variableName;
string name;
int age;
double price;
bool isActive;
```

### Initializing Variables

```csharp
// Syntax: dataType variableName = value;
string name = "John";
int age = 25;
double price = 19.99;
bool isActive = true;
```

### Declaration and Initialization Together

```csharp
string firstName = "Alice";
string lastName = "Smith";
int score = 100;
decimal accountBalance = 1250.75m;
bool isPremiumMember = false;
```

---

## Variable Naming Rules

### Must Follow

| Rule | Valid | Invalid |
|------|-------|---------|
| Start with letter or underscore | `name`, `_count` | `1name`, `@value` |
| Contain letters, digits, underscores | `user1`, `total_count` | `user-name`, `total.count` |
| Case-sensitive | `Name` ≠ `name` | — |
| Cannot be a reserved keyword | `myString` | `string`, `class` |

### Naming Conventions

```csharp
// camelCase for local variables and parameters
string firstName = "John";
int itemCount = 10;
bool isValid = true;

// PascalCase for properties and methods
public string FirstName { get; set; }
public void CalculateTotal() { }

// _camelCase for private fields (common convention)
private string _firstName;
private int _itemCount;
```

---

## Using Variables

### Assigning Values

```csharp
string message;
message = "Hello";           // Initial assignment
message = "Hello, World!";   // Reassignment

int counter = 0;
counter = counter + 1;       // Increment
counter++;                   // Shorthand increment
```

### Using Variables in Output

```csharp
string name = "Alice";
int age = 30;

Console.WriteLine(name);                    // Alice
Console.WriteLine(age);                     // 30
Console.WriteLine("Name: " + name);         // Name: Alice
Console.WriteLine($"Name: {name}, Age: {age}");  // Name: Alice, Age: 30
```

---

## Implicitly Typed Variables (var)

Use `var` to let the compiler infer the type:

```csharp
var message = "Hello";      // Inferred as string
var count = 42;             // Inferred as int
var price = 9.99;           // Inferred as double
var isActive = true;        // Inferred as bool
```

> **Note:** `var` requires initialization—the compiler needs a value to determine the type.

```csharp
var name = "John";   // ✅ Valid
var age;             // ❌ Error: Must be initialized
```

---

## Constants

Use `const` for values that never change:

```csharp
const double PI = 3.14159265359;
const int MAX_USERS = 100;
const string COMPANY_NAME = "Acme Corp";

// Constants cannot be changed
// PI = 3.14;  // ❌ Error: Cannot assign to a constant
```

---

## Choosing the Right Data Type

| Data | Recommended Type | Why |
|------|-----------------|-----|
| Names, text | `string` | Text data |
| Whole numbers | `int` | General purpose integers |
| Large whole numbers | `long` | When `int` is too small |
| Money, prices | `decimal` | High precision for financial data |
| Scientific calculations | `double` | Good precision, faster than decimal |
| Yes/No values | `bool` | True or false |
| Single character | `char` | Single Unicode character |
| Phone numbers | `string` | May contain formatting, leading zeros |
| Postal codes | `string` | May contain letters, leading zeros |

### Why Use String for Phone Numbers?

```csharp
// ❌ Bad - loses leading zero, can't store formatting
int phone = 0123456789;  // Becomes 123456789

// ✅ Good - preserves exactly as written
string phone = "012-345-6789";
```

---

## Complete Example

```csharp
// String literals and variables
string greeting = "Hello";
string name = "World";
Console.WriteLine($"{greeting}, {name}!");

// Character literal
char initial = 'J';
Console.WriteLine($"Initial: {initial}");

// Integer literals and variables
int age = 25;
int year = 2024;
Console.WriteLine($"Age: {age}, Year: {year}");

// Floating-point literals
float temperature = 98.6F;
double pi = 3.14159265359;
decimal price = 19.99m;

Console.WriteLine($"Temperature: {temperature}°F");
Console.WriteLine($"Pi: {pi}");
Console.WriteLine($"Price: {price:C}");

// Boolean literals
bool isStudent = true;
bool isEmployed = false;

Console.WriteLine($"Is Student: {isStudent}");
Console.WriteLine($"Is Employed: {isEmployed}");

// Using var
var message = "This type is inferred as string";
var count = 42;  // Inferred as int

Console.WriteLine(message);
Console.WriteLine($"Count: {count}");
```

**Output:**
```
Hello, World!
Initial: J
Age: 25, Year: 2024
Temperature: 98.6°F
Pi: 3.14159265359
Price: $19.99
Is Student: True
Is Employed: False
This type is inferred as string
Count: 42
```

---

## Quick Reference

| Literal Type | Syntax | Example |
|--------------|--------|---------|
| String | `"text"` | `"Hello"` |
| Character | `'x'` | `'A'` |
| Integer | number | `42` |
| Float | numberF | `3.14F` |
| Double | number.decimal | `3.14159` |
| Decimal | numberM | `19.99m` |
| Boolean | `true`/`false` | `true` |
| Long | numberL | `9999999999L` |

---

## Key Takeaways

1. **Literals** are constant values written directly in code
2. Use **double quotes** for strings, **single quotes** for characters
3. **Floating-point suffixes**: `F` for float, `m` for decimal (double is default)
4. **Variables** are named containers that store values
5. Variables must be **declared** with a type before use
6. Use **camelCase** for variable names in C#
7. Use `var` for **implicit typing** when the type is obvious
8. Use `const` for values that **never change**
9. Choose data types based on **what the data represents**, not just its appearance
10. Use `string` for phone numbers and postal codes (not `int`)

---

## Related Topics

- [[docs/csharp/ValueReferenceTypes\|Value Types and Reference Types]]
- [[docs/csharp/CastingConversion\|Data Type Casting and Conversion]]
- [[docs/csharp/StringFormatting\|String Formatting]]
- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- Numeric Data Types
- String Manipulation

---

## Source

- [Microsoft Learn: Print Literal Values](https://learn.microsoft.com/en-us/training/modules/csharp-literals-variables/2-exercise-literal-values)

---

#csharp #programming #literals #variables #data-types #fundamentals #basics
