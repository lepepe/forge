---
{"dg-publish":true,"permalink":"/docs/csharp/boolean-expressions/","tags":["operators","string-manipulation","expressions"]}
---

# Boolean Expressions in C#

## Overview

An **expression** is any combination of values (literal or variable), operators, and methods that return a single value. A **Boolean expression** is an expression that evaluates to either `true` or `false`.

Boolean expressions are essential for:
- Decision logic (if statements)
- Branching statements
- Loop conditions
- Validation checks

---

## Equality Operator (`==`)

The equality operator checks if two values are equivalent.

```csharp
Console.WriteLine("a" == "a");      // True
Console.WriteLine("a" == "A");      // False (case-sensitive)
Console.WriteLine(1 == 2);          // False

string myName = "Luiz";
if (myName == "Luiz")
{
    Console.WriteLine("Name matches!");
}
```

> **Note:** String comparisons in C# are case-sensitive by default.

---

## Inequality Operator (`!=`)

The inequality operator returns `true` if two values are NOT equivalent.

```csharp
Console.WriteLine("a" != "A");      // True
Console.WriteLine("a" != "a");      // False
Console.WriteLine(1 != 2);          // True
```

---

## Comparison Operators

Used primarily with numeric data types:

| Operator | Description              | Example      | Result  |
|----------|--------------------------|--------------|---------|
| `>`      | Greater than             | `5 > 3`      | `true`  |
| `<`      | Less than                | `5 < 3`      | `false` |
| `>=`     | Greater than or equal to | `5 >= 5`     | `true`  |
| `<=`     | Less than or equal to    | `5 <= 3`     | `false` |

```csharp
Console.WriteLine(1 > 2);     // False
Console.WriteLine(1 < 2);     // True
Console.WriteLine(1 >= 1);    // True
Console.WriteLine(1 <= 2);    // True
```

---

## String Comparison Best Practices

When comparing strings, especially user input, use helper methods to normalize the data:

| Method      | Purpose                           |
|-------------|-----------------------------------|
| `ToLower()` | Converts string to lowercase      |
| `ToUpper()` | Converts string to uppercase      |
| `Trim()`    | Removes leading/trailing spaces   |

```csharp
string value1 = " a";
string value2 = "A ";

// Without normalization
Console.WriteLine(value1 == value2);  // False

// With normalization
Console.WriteLine(value1.Trim().ToLower() == value2.Trim().ToLower());  // True
```

### Practical Example

```csharp
Console.Write("Enter your name: ");
string userInput = Console.ReadLine();

if (userInput.Trim().ToLower() == "john")
{
    Console.WriteLine("Welcome, John!");
}
```

---

## Methods That Return Boolean Values

The `string` class has several methods that return Boolean values:

### Contains()

Checks if a string contains a specified substring.

```csharp
string pangram = "The quick brown fox jumps over the lazy dog.";
Console.WriteLine(pangram.Contains("fox"));    // True
Console.WriteLine(pangram.Contains("cow"));    // False
```

### StartsWith()

Checks if a string starts with a specified value.

```csharp
string pangram = "The quick brown fox jumps over the lazy dog.";
Console.WriteLine(pangram.StartsWith("The"));      // True
Console.WriteLine(pangram.StartsWith("quick"));    // False
```

### EndsWith()

Checks if a string ends with a specified value.

```csharp
string pangram = "The quick brown fox jumps over the lazy dog.";
Console.WriteLine(pangram.EndsWith("dog."));    // True
Console.WriteLine(pangram.EndsWith("fox"));     // False
```

---

## Logical Negation Operator (`!`)

The "not operator" (`!`) reverses the result of a Boolean expression:
- `true` becomes `false`
- `false` becomes `true`

```csharp
string pangram = "The quick brown fox jumps over the lazy dog.";

Console.WriteLine(!pangram.Contains("fox"));   // False (negates True)
Console.WriteLine(!pangram.Contains("cow"));   // True (negates False)
```

### Negation vs Inequality

These two expressions are equivalent:

```csharp
// Using inequality operator
Console.WriteLine(x != y);

// Using negation with equality
Console.WriteLine(!(x == y));
```

---

## Combining Boolean Expressions

You can combine multiple Boolean expressions using logical operators:

| Operator | Name | Description                          |
|----------|------|--------------------------------------|
| `&&`     | AND  | True if both conditions are true     |
| `\|\|`   | OR   | True if at least one condition is true |
| `!`      | NOT  | Reverses the Boolean value           |

```csharp
int age = 25;
bool hasLicense = true;

// AND - both must be true
if (age >= 18 && hasLicense)
{
    Console.WriteLine("Can drive");
}

// OR - at least one must be true
if (age < 18 || !hasLicense)
{
    Console.WriteLine("Cannot drive");
}
```

---

## Key Takeaways

1. Boolean expressions evaluate to `true` or `false`
2. Use `==` for equality and `!=` for inequality
3. String comparisons are case-sensitive by default
4. Use `Trim()`, `ToLower()`, or `ToUpper()` to normalize strings before comparison
5. Use comparison operators (`>`, `<`, `>=`, `<=`) for numeric comparisons
6. Methods like `Contains()`, `StartsWith()`, `EndsWith()` return Boolean values
7. The logical negation operator (`!`) reverses Boolean results

---

## Related Topics

- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- Conditional Statements (if/else)
- Logical Operators
- Switch Expressions

---

## Source

- [Microsoft Learn: Evaluate Boolean Expressions](https://learn.microsoft.com/en-us/training/modules/csharp-evaluate-boolean-expressions/2-exercise-boolean-expressions)

---

#csharp #programming #boolean #operators #fundamentals
