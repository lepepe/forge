---
{"dg-publish":true,"permalink":"/docs/csharp/method-return-types/","tags":["csharp","types","methods","data-types","void","return"]}
---

# Method Return Types in C#

## Overview

Methods can return values to the caller by specifying a **return type** in the method signature. The return type indicates what kind of data the method will send back when it completes.

---

## Return Type Syntax

The return type is specified **before** the method name:

```csharp
returnType MethodName(parameters)
{
    // method body
    return value;
}
```

### Examples

```csharp
int Add(int a, int b)           // Returns an integer
string GetName()                 // Returns a string
bool IsValid(int value)          // Returns a boolean
double CalculateAverage()        // Returns a double
int[] GetScores()                // Returns an integer array
void PrintMessage(string msg)    // Returns nothing
```

---

## Void Methods

Use `void` when a method performs an action but doesn't return a value.

```csharp
void PrintMessage(string message)
{
    Console.WriteLine(message);
}

void DisplayBorder()
{
    Console.WriteLine("════════════════════════");
}

// Usage
PrintMessage("Hello!");
DisplayBorder();
```

### Early Exit with Return

Even `void` methods can use `return` to exit early:

```csharp
void ProcessOrder(int quantity)
{
    if (quantity <= 0)
    {
        Console.WriteLine("Invalid quantity");
        return;  // Exit early
    }

    // Process the order...
    Console.WriteLine($"Processing {quantity} items");
}
```

---

## The Return Keyword

The `return` keyword sends a value back to the caller and exits the method.

### Returning a Variable

```csharp
int GetSum(int a, int b)
{
    int result = a + b;
    return result;
}
```

### Returning a Literal

```csharp
string GetDefaultName()
{
    return "Unknown";
}

int GetMaxValue()
{
    return 100;
}
```

### Returning an Expression

Expressions are evaluated before being returned:

```csharp
int GetSum(int a, int b)
{
    return a + b;  // Expression evaluated, result returned
}

double GetDiscountedPrice(double price, double discount)
{
    return price * (1 - discount);
}

bool IsAdult(int age)
{
    return age >= 18;
}
```

### Returning Method Calls

You can return the result of another method:

```csharp
string GetFormattedName(string first, string last)
{
    return FormatName(first, last);
}

int GetAbsoluteValue(int number)
{
    return Math.Abs(number);
}
```

---

## Type Must Match

The returned value **must match** the declared return type:

```csharp
// ✅ Correct - returning int from int method
int GetNumber()
{
    return 42;
}

// ✅ Correct - returning string from string method
string GetMessage()
{
    return "Hello";
}

// ❌ Wrong - returning string from int method
int GetNumber()
{
    return "42";  // Compiler error!
}
```

---

## All Code Paths Must Return

If a method has a return type (not `void`), **every possible path** must return a value:

```csharp
// ❌ Wrong - not all paths return a value
int GetDiscount(bool isMember)
{
    if (isMember)
    {
        return 20;
    }
    // Error: not all code paths return a value
}

// ✅ Correct - all paths return a value
int GetDiscount(bool isMember)
{
    if (isMember)
    {
        return 20;
    }
    return 0;  // Default case
}

// ✅ Also correct - using else
int GetDiscount(bool isMember)
{
    if (isMember)
    {
        return 20;
    }
    else
    {
        return 0;
    }
}
```

---

## Capturing Return Values

When a method returns a value, you can use it in several ways:

### Store in a Variable

```csharp
int sum = Add(5, 3);
Console.WriteLine(sum);  // 8
```

### Use Directly in Expressions

```csharp
int total = Add(5, 3) + Add(2, 7);  // 8 + 9 = 17
```

### Use in Output

```csharp
Console.WriteLine($"Sum: {Add(5, 3)}");
```

### Use in Conditions

```csharp
if (IsValid(userInput))
{
    ProcessInput(userInput);
}
```

### Use in Ternary Expressions

```csharp
double finalPrice = HasDiscount() ? price * 0.9 : price;
```

### Use as Arguments

```csharp
void DisplayResult(int value)
{
    Console.WriteLine($"Result: {value}");
}

DisplayResult(Add(5, 3));  // Passing return value as argument
```

---

## Practical Example: Shopping Cart

```csharp
double[] prices = { 15.99, 24.50, 8.75, 42.00 };
double[] discounts = { 0.10, 0.0, 0.25, 0.15 };

// Get discounted price for a specific item
double GetDiscountedPrice(int itemIndex)
{
    return prices[itemIndex] * (1 - discounts[itemIndex]);
}

// Calculate total of all items
double GetTotal()
{
    double total = 0;
    for (int i = 0; i < prices.Length; i++)
    {
        total += GetDiscountedPrice(i);
    }
    return total;
}

// Check if total qualifies for extra discount
bool TotalMeetsMinimum()
{
    return GetTotal() >= 50.00;
}

// Format a decimal for display
string FormatDecimal(double value)
{
    return value.ToString("F2");
}

// Main logic
double total = GetTotal();

if (TotalMeetsMinimum())
{
    total -= 5.00;  // Extra $5 off
    Console.WriteLine("You qualified for an extra $5 discount!");
}

Console.WriteLine($"Total: ${FormatDecimal(total)}");
```

**Output:**
```
You qualified for an extra $5 discount!
Total: $69.22
```

---

## Common Return Types

| Return Type | Description | Example |
|-------------|-------------|---------|
| `void` | No return value | `void Print()` |
| `int` | Integer | `int GetCount()` |
| `double` | Decimal number | `double GetAverage()` |
| `decimal` | High-precision decimal | `decimal GetPrice()` |
| `string` | Text | `string GetName()` |
| `bool` | True/false | `bool IsValid()` |
| `char` | Single character | `char GetGrade()` |
| `int[]` | Integer array | `int[] GetScores()` |
| `string[]` | String array | `string[] GetNames()` |
| `List<T>` | Generic list | `List<int> GetNumbers()` |

---

## Returning Multiple Values

### Using Arrays

```csharp
int[] GetMinMax(int[] numbers)
{
    int min = numbers.Min();
    int max = numbers.Max();
    return new int[] { min, max };
}

// Usage
int[] result = GetMinMax(new int[] { 5, 2, 8, 1, 9 });
Console.WriteLine($"Min: {result[0]}, Max: {result[1]}");
```

### Using Tuples

```csharp
(int min, int max) GetMinMax(int[] numbers)
{
    return (numbers.Min(), numbers.Max());
}

// Usage
var result = GetMinMax(new int[] { 5, 2, 8, 1, 9 });
Console.WriteLine($"Min: {result.min}, Max: {result.max}");

// Or with deconstruction
(int minimum, int maximum) = GetMinMax(new int[] { 5, 2, 8, 1, 9 });
Console.WriteLine($"Min: {minimum}, Max: {maximum}");
```

---

## Return vs Console.WriteLine

Understand the difference between returning and printing:

```csharp
// ❌ This prints but doesn't return - can't use the value elsewhere
void PrintSum(int a, int b)
{
    Console.WriteLine(a + b);
}

// ✅ This returns - can use the value anywhere
int GetSum(int a, int b)
{
    return a + b;
}

// Usage comparison
PrintSum(5, 3);                    // Prints "8" but that's it

int result = GetSum(5, 3);         // Captures the value
Console.WriteLine(result);          // Can print when needed
int doubled = result * 2;           // Can use in calculations
SaveToDatabase(result);             // Can pass to other methods
```

---

## Best Practices

### Name Methods by What They Return

```csharp
// ✅ Good - clear what's returned
int GetAge()
string GetFullName()
bool IsValid()
double CalculateTotal()
int[] GetAllScores()

// ❌ Bad - unclear
int Age()           // Is it getting or setting?
string Name()       // What about the name?
bool Valid()        // Checking or making valid?
```

### Return Early for Simple Cases

```csharp
// ✅ Good - return early for edge cases
int GetDiscount(int memberLevel)
{
    if (memberLevel <= 0) return 0;
    if (memberLevel == 1) return 10;
    if (memberLevel == 2) return 20;
    return 30;  // Level 3+
}

// Less clear alternative
int GetDiscount(int memberLevel)
{
    int discount;
    if (memberLevel <= 0)
        discount = 0;
    else if (memberLevel == 1)
        discount = 10;
    else if (memberLevel == 2)
        discount = 20;
    else
        discount = 30;
    return discount;
}
```

---

## Quick Reference

| Concept | Syntax |
|---------|--------|
| Void method | `void MethodName() { }` |
| Return int | `int MethodName() { return 42; }` |
| Return string | `string MethodName() { return "text"; }` |
| Return bool | `bool MethodName() { return true; }` |
| Return expression | `return a + b;` |
| Early exit (void) | `return;` |
| Capture return | `int x = MethodName();` |
| Use in condition | `if (IsValid()) { }` |

---

## Key Takeaways

1. The **return type** is specified before the method name
2. Use `void` when a method doesn't return a value
3. The `return` keyword sends a value back and exits the method
4. Return values can be **variables**, **literals**, or **expressions**
5. The returned value **must match** the declared return type
6. **All code paths** must return a value (except `void` methods)
7. Return values can be **captured in variables** or **used directly**
8. Use `return` in `void` methods for **early exit**
9. Prefer **returning values** over printing when data needs to be reused
10. Use **tuples** or **arrays** to return multiple values

---

## Related Topics

- [[docs/csharp/MethodsSyntax\|Methods Syntax]]
- [[docs/csharp/MethodParameters\|Method Parameters]]
- [[docs/csharp/ValueReferenceTypes\|Value Types and Reference Types]]
- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- Tuples
- out Parameters

---

## Source

- [Microsoft Learn: Understand Return Type Syntax](https://learn.microsoft.com/en-us/training/modules/create-c-sharp-methods-return-values/2-exercise-understand-return-type-syntax)

---

#csharp #programming #methods #return-types #fundamentals
