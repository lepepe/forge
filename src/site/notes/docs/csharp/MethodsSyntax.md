---
{"dg-publish":true,"permalink":"/docs/csharp/methods-syntax/","tags":["methods","syntax","arguments"]}
---

# Methods in C#

## Overview

A **method** is a reusable block of code that performs a specific task. Methods help organize code, reduce repetition, and make programs easier to read and maintain.

---

## Why Use Methods?

| Benefit | Description |
|---------|-------------|
| **Reusability** | Write code once, use it many times |
| **Organization** | Break complex problems into smaller pieces |
| **Readability** | Give meaningful names to blocks of code |
| **Maintainability** | Fix bugs in one place, affects all usages |
| **Abstraction** | Hide implementation details |

---

## Method Signature

A method signature declares the essential information about a method:

```csharp
returnType MethodName(parameters)
```

### Components

| Component | Description | Example |
|-----------|-------------|---------|
| **Return type** | Data type returned by the method | `void`, `int`, `string`, `bool` |
| **Method name** | Identifier to call the method | `SayHello`, `CalculateTotal` |
| **Parameters** | Input values (in parentheses) | `(int x, string name)` |

### Examples

```csharp
void SayHello()                           // No return, no parameters
int Add(int a, int b)                     // Returns int, two parameters
string GetFullName(string first, string last)  // Returns string
bool IsValid(int value)                   // Returns bool
```

---

## Method Definition

The method definition includes the signature plus the code block in curly braces `{}`:

```csharp
void SayHello()
{
    Console.WriteLine("Hello World!");
}
```

### Complete Example

```csharp
int Add(int a, int b)
{
    int sum = a + b;
    return sum;
}
```

---

## Calling Methods

Methods are called (invoked) using their name followed by parentheses with any required arguments:

```csharp
// Calling a method with no parameters
SayHello();

// Calling a method with parameters
int result = Add(5, 3);

// Calling a method and using the return value
Console.WriteLine(Add(10, 20));
```

### Method Call Syntax

```csharp
MethodName();                    // No parameters
MethodName(argument1);           // One parameter
MethodName(argument1, argument2); // Multiple parameters
variable = MethodName();         // Capture return value
```

---

## Method Execution Flow

When a method is called:

1. **Control transfers** from the caller to the method
2. **Method body executes** line by line
3. **Control returns** to the caller when method completes

### Example

```csharp
Console.WriteLine("Before calling a method");
SayHello();
Console.WriteLine("After calling a method");

void SayHello()
{
    Console.WriteLine("Hello World!");
}
```

**Output:**
```
Before calling a method
Hello World!
After calling a method
```

### Visual Flow

```
Main Code              Method
─────────              ──────
   │
   ▼
"Before calling"
   │
   ├──────────────────► SayHello()
   │                        │
   │                        ▼
   │                   "Hello World!"
   │                        │
   ◄────────────────────────┘
   │
   ▼
"After calling"
```

---

## Void Methods

Methods with `void` return type don't return a value. They perform an action.

```csharp
void PrintMessage(string message)
{
    Console.WriteLine(message);
}

void DrawLine()
{
    Console.WriteLine("──────────────────────");
}

// Usage
PrintMessage("Welcome!");
DrawLine();
```

---

## Methods with Return Values

Methods can return a value using the `return` keyword.

```csharp
int Add(int a, int b)
{
    return a + b;
}

string GetGreeting(string name)
{
    return $"Hello, {name}!";
}

bool IsEven(int number)
{
    return number % 2 == 0;
}
```

### Using Return Values

```csharp
// Store in a variable
int sum = Add(5, 3);
Console.WriteLine(sum);  // 8

// Use directly
Console.WriteLine(Add(10, 20));  // 30

// Use in expressions
int total = Add(5, 3) + Add(2, 7);  // 8 + 9 = 17

// Use in conditions
if (IsEven(4))
{
    Console.WriteLine("It's even!");
}
```

---

## Parameters and Arguments

### Terminology

| Term | Definition | Example |
|------|------------|---------|
| **Parameter** | Variable in method definition | `int x` in `void Print(int x)` |
| **Argument** | Value passed when calling | `5` in `Print(5)` |

### Multiple Parameters

```csharp
void DisplayDate(string month, int day, int year)
{
    Console.WriteLine($"{month} {day}, {year}");
}

// Calling with arguments
DisplayDate("January", 15, 2024);
// Output: January 15, 2024
```

### Parameter Order Matters

```csharp
void Subtract(int a, int b)
{
    Console.WriteLine(a - b);
}

Subtract(10, 3);  // 7
Subtract(3, 10);  // -7
```

---

## Method Placement

In C#, methods can be called **before or after** their definition—no forward declaration is required.

```csharp
// Call before definition
SayHello();

// Definition
void SayHello()
{
    Console.WriteLine("Hello!");
}
```

This also works:

```csharp
// Definition first
void SayHello()
{
    Console.WriteLine("Hello!");
}

// Call after definition
SayHello();
```

---

## Naming Conventions

### Use PascalCase

Method names should use **PascalCase** (each word capitalized):

```csharp
// ✅ Good - PascalCase
void CalculateTotalPrice()
void GetUserInput()
void ValidateEmail()

// ❌ Bad - other cases
void calculateTotalPrice()  // camelCase
void calculate_total_price() // snake_case
void CALCULATETOTALPRICE()  // ALL CAPS
```

### Naming Best Practices

| Rule | Bad Example | Good Example |
|------|-------------|--------------|
| Be descriptive | `void DoIt()` | `void SendEmail()` |
| Use verbs | `void Data()` | `void ProcessData()` |
| No digits at start | `void 2ndStep()` | `void SecondStep()` |
| Descriptive parameters | `void Show(string a)` | `void Show(string message)` |

### Poor vs Good Examples

```csharp
// ❌ Poor - unclear purpose, meaningless parameter names
void ShowData(string a, int b, int c);

// ✅ Good - clear purpose, descriptive parameters
void DisplayDate(string month, int day, int year);
```

---

## Complete Example

```csharp
// Method definitions
void DisplayWelcome()
{
    Console.WriteLine("╔════════════════════════╗");
    Console.WriteLine("║   Welcome to the App   ║");
    Console.WriteLine("╚════════════════════════╝");
}

string GetFullName(string firstName, string lastName)
{
    return $"{firstName} {lastName}";
}

int CalculateAge(int birthYear, int currentYear)
{
    return currentYear - birthYear;
}

void DisplayUserInfo(string name, int age)
{
    Console.WriteLine($"Name: {name}");
    Console.WriteLine($"Age: {age}");
}

// Main program flow
DisplayWelcome();

string fullName = GetFullName("John", "Doe");
int age = CalculateAge(1990, 2024);

DisplayUserInfo(fullName, age);
```

**Output:**
```
╔════════════════════════╗
║   Welcome to the App   ║
╚════════════════════════╝
Name: John Doe
Age: 34
```

---

## Methods Calling Other Methods

Methods can call other methods to build complex functionality:

```csharp
void DisplayReport()
{
    PrintHeader();
    PrintData();
    PrintFooter();
}

void PrintHeader()
{
    Console.WriteLine("=== REPORT ===");
}

void PrintData()
{
    Console.WriteLine("Data goes here...");
}

void PrintFooter()
{
    Console.WriteLine("=== END ===");
}

// Just call the main method
DisplayReport();
```

**Output:**
```
=== REPORT ===
Data goes here...
=== END ===
```

---

## Common Return Types

| Return Type | Description | Example |
|-------------|-------------|---------|
| `void` | No return value | `void PrintMessage()` |
| `int` | Integer number | `int GetCount()` |
| `double` | Decimal number | `double CalculateAverage()` |
| `string` | Text | `string GetName()` |
| `bool` | True/false | `bool IsValid()` |
| `int[]` | Array of integers | `int[] GetScores()` |
| `string[]` | Array of strings | `string[] GetNames()` |

---

## Key Takeaways

1. A **method signature** includes return type, name, and parameters
2. Methods are defined with curly braces `{}` containing the code
3. Use `void` when a method doesn't return a value
4. Use `return` to send a value back to the caller
5. **Parameters** are in the definition; **arguments** are passed when calling
6. Methods can be called **before or after** their definition
7. Use **PascalCase** for method names
8. Choose **descriptive names** for methods and parameters
9. Methods help with **code reuse** and **organization**
10. Methods can **call other methods** to build complex behavior

---

## Related Topics

- [[docs/csharp/CodeBlocksVariableScope\|Code Blocks and Variable Scope]]
- [[docs/csharp/ValueReferenceTypes\|Value Types and Reference Types]]
- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- Method Parameters (ref, out, params)
- Method Overloading
- Static vs Instance Methods

---

## Source

- [Microsoft Learn: Understand the Syntax of Methods](https://learn.microsoft.com/en-us/training/modules/write-first-c-sharp-method/2-understand-syntax-of-methods)

---

#csharp #programming #methods #functions #fundamentals #syntax
