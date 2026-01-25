---
{"dg-publish":true,"permalink":"/docs/csharp/string-formatting/","tags":["strings","string-manipulation","formatting"]}
---

# String Formatting in C#

## Overview

C# provides multiple ways to format strings for output. Understanding these techniques is essential for creating readable, well-formatted text in your applications.

---

## String Formatting Methods

| Method | Syntax | Recommended |
|--------|--------|-------------|
| Concatenation | `"Hello " + name` | No |
| Composite Formatting | `String.Format("{0}", value)` | Sometimes |
| String Interpolation | `$"Hello {name}"` | Yes |

---

## Composite Formatting

Uses numbered placeholders `{0}`, `{1}`, etc. within a string template.

### Syntax

```csharp
string result = String.Format("template with {0} and {1}", value0, value1);
```

### Basic Example

```csharp
string first = "Hello";
string second = "World";

string result = String.Format("{0} {1}!", first, second);
Console.WriteLine(result);
// Output: Hello World!
```

### Reordering Tokens

Placeholders can appear in any order:

```csharp
string first = "Hello";
string second = "World";

string result = String.Format("{1} {0}!", first, second);
Console.WriteLine(result);
// Output: World Hello!
```

### Reusing Tokens

The same placeholder can be used multiple times:

```csharp
string name = "Bob";

string result = String.Format("{0}! {0}! {0}!", name);
Console.WriteLine(result);
// Output: Bob! Bob! Bob!
```

---

## String Interpolation (Recommended)

Prefixes the string with `$` and embeds expressions directly in curly braces. This is the **preferred modern approach**.

### Syntax

```csharp
string result = $"template with {expression}";
```

### Basic Example

```csharp
string first = "Hello";
string second = "World";

Console.WriteLine($"{first} {second}!");
// Output: Hello World!
```

### Expressions in Interpolation

You can include any valid C# expression:

```csharp
int a = 5;
int b = 3;

Console.WriteLine($"Sum: {a + b}");           // Sum: 8
Console.WriteLine($"Product: {a * b}");       // Product: 15
Console.WriteLine($"Is greater: {a > b}");    // Is greater: True
```

### Method Calls

```csharp
string name = "alice";

Console.WriteLine($"Hello, {name.ToUpper()}!");
// Output: Hello, ALICE!
```

---

## Escape Sequences

Escape sequences are special character combinations that represent characters that cannot be typed directly.

### Common Escape Sequences

| Sequence | Description | Example Output |
|----------|-------------|----------------|
| `\n` | New line | Line break |
| `\t` | Tab | Horizontal tab |
| `\\` | Backslash | `\` |
| `\"` | Double quote | `"` |
| `\'` | Single quote | `'` |
| `\r` | Carriage return | Return to line start |
| `\0` | Null character | Null |

### Examples

```csharp
// New line
Console.WriteLine("First line\nSecond line");
// Output:
// First line
// Second line

// Tab
Console.WriteLine("Name:\tJohn");
// Output: Name:    John

// Backslash (for file paths)
Console.WriteLine("C:\\Users\\Documents\\file.txt");
// Output: C:\Users\Documents\file.txt

// Quotes inside strings
Console.WriteLine("She said \"Hello!\"");
// Output: She said "Hello!"
```

### Building Formatted Output

```csharp
Console.WriteLine("Invoice\n--------\nItem\tPrice\n--------");
Console.WriteLine("Apple\t$1.99\nOrange\t$2.49");
```

**Output:**
```
Invoice
--------
Item    Price
--------
Apple   $1.99
Orange  $2.49
```

---

## Verbatim Strings (`@`)

Verbatim strings are prefixed with `@` and treat backslashes as literal characters (no escape sequences).

### Syntax

```csharp
string verbatim = @"literal string with \ backslashes";
```

### File Paths (Common Use Case)

```csharp
// Without verbatim (escape backslashes)
string path1 = "C:\\Users\\Documents\\file.txt";

// With verbatim (much cleaner)
string path2 = @"C:\Users\Documents\file.txt";

// Both produce: C:\Users\Documents\file.txt
```

### Multi-Line Strings

Verbatim strings preserve line breaks:

```csharp
string multiLine = @"This is line one.
This is line two.
This is line three.";

Console.WriteLine(multiLine);
```

**Output:**
```
This is line one.
This is line two.
This is line three.
```

### Quotes in Verbatim Strings

Use double quotes (`""`) to include a quote character:

```csharp
string quote = @"She said ""Hello!"" to everyone.";
Console.WriteLine(quote);
// Output: She said "Hello!" to everyone.
```

---

## Verbatim String Interpolation (`$@` or `@$`)

Combine the power of string interpolation with verbatim strings.

### Syntax

```csharp
string result = $@"verbatim with {expression}";
// or
string result = @$"verbatim with {expression}";
```

### Example: File Paths with Variables

```csharp
string username = "John";
string filename = "report.txt";

string path = $@"C:\Users\{username}\Documents\{filename}";
Console.WriteLine(path);
// Output: C:\Users\John\Documents\report.txt
```

### Example: Multi-Line with Variables

```csharp
string name = "Alice";
int age = 30;

string profile = $@"
================================
  User Profile
================================
  Name: {name}
  Age:  {age}
================================";

Console.WriteLine(profile);
```

**Output:**
```

================================
  User Profile
================================
  Name: Alice
  Age:  30
================================
```

### Example: SQL Query

```csharp
string tableName = "Customers";
string columnName = "LastName";

string query = $@"
SELECT *
FROM {tableName}
WHERE {columnName} IS NOT NULL
ORDER BY {columnName}";

Console.WriteLine(query);
```

---

## Unicode Escape Characters

Include special Unicode characters using `\u` followed by a 4-digit hexadecimal code.

### Syntax

```csharp
char symbol = '\uXXXX';  // 4-digit hex code
string text = "Text with \uXXXX symbol";
```

### Common Unicode Characters

| Code | Character | Description |
|------|-----------|-------------|
| `\u0041` | A | Latin capital A |
| `\u00A9` | © | Copyright |
| `\u00AE` | ® | Registered |
| `\u2122` | ™ | Trademark |
| `\u00B0` | ° | Degree |
| `\u2764` | ❤ | Heart |
| `\u2713` | ✓ | Check mark |
| `\u2717` | ✗ | X mark |
| `\u03C0` | π | Pi |
| `\u221E` | ∞ | Infinity |

### Examples

```csharp
// Copyright symbol
Console.WriteLine("Copyright \u00A9 2024");
// Output: Copyright © 2024

// Degree symbol
Console.WriteLine("Temperature: 72\u00B0F");
// Output: Temperature: 72°F

// Check marks
Console.WriteLine("Task 1: \u2713 Complete");
Console.WriteLine("Task 2: \u2717 Incomplete");
// Output:
// Task 1: ✓ Complete
// Task 2: ✗ Incomplete

// Math symbols
Console.WriteLine("Area = \u03C0r\u00B2");
// Output: Area = πr²
```

### Encoding Kon'nichiwa in Japanese

```csharp
Console.WriteLine("\u3053\u3093\u306B\u3061\u306F");
// Output: こんにちは (Kon'nichiwa - Hello in Japanese)
```

---

## Escape Sequences vs Verbatim Strings

| Feature | Escape Sequences | Verbatim Strings |
|---------|------------------|------------------|
| Prefix | None | `@` |
| Backslash | Escape character | Literal character |
| New lines | `\n` required | Preserved literally |
| Quotes | `\"` | `""` |
| Best for | Short strings | Paths, multi-line text |

### Comparison Example

```csharp
// Same output, different approaches:

// Using escape sequences
string path1 = "C:\\Users\\John\\Documents\\file.txt";

// Using verbatim string
string path2 = @"C:\Users\John\Documents\file.txt";

// Using verbatim with interpolation
string user = "John";
string path3 = $@"C:\Users\{user}\Documents\file.txt";
```

---

## Literal Curly Braces in Interpolation

To include literal `{` or `}` in an interpolated string, double them:

```csharp
int value = 42;

Console.WriteLine($"The value is {value}");
// Output: The value is 42

Console.WriteLine($"Use {{braces}} like this: {value}");
// Output: Use {braces} like this: 42
```

---

## Format Specifiers

Format specifiers control how values are displayed. Use them after a colon inside the placeholder.

### Syntax

```csharp
{value:specifier}
{value:specifierPrecision}
```

---

## Currency Format (`:C`)

Formats a number as currency based on the current culture.

```csharp
decimal price = 123.45m;

Console.WriteLine($"Price: {price:C}");
// Output (en-US): Price: $123.45
// Output (fr-FR): Price: 123,45 €
// Output (ja-JP): Price: ¥123
```

### With Precision

```csharp
decimal price = 123.4m;

Console.WriteLine($"Price: {price:C2}");  // $123.40
Console.WriteLine($"Price: {price:C0}");  // $123
```

---

## Number Format (`:N`)

Formats a number with thousands separators and decimal places.

```csharp
decimal value = 123456.78912m;

Console.WriteLine($"Default:    {value:N}");   // 123,456.79
Console.WriteLine($"4 decimals: {value:N4}");  // 123,456.7891
Console.WriteLine($"0 decimals: {value:N0}");  // 123,457
```

---

## Percentage Format (`:P`)

Formats a decimal as a percentage (multiplies by 100 and adds %).

```csharp
decimal tax = .36785m;

Console.WriteLine($"Tax rate: {tax:P}");   // 36.79%
Console.WriteLine($"Tax rate: {tax:P0}");  // 37%
Console.WriteLine($"Tax rate: {tax:P3}");  // 36.785%
```

---

## Fixed-Point Format (`:F`)

Formats with a fixed number of decimal places.

```csharp
double value = 123.4567;

Console.WriteLine($"Fixed: {value:F2}");  // 123.46
Console.WriteLine($"Fixed: {value:F4}");  // 123.4567
Console.WriteLine($"Fixed: {value:F0}");  // 123
```

---

## Decimal Format (`:D`)

Formats integers with a minimum number of digits (pads with zeros).

```csharp
int number = 42;

Console.WriteLine($"Padded: {number:D5}");  // 00042
Console.WriteLine($"Padded: {number:D2}");  // 42
```

---

## Hexadecimal Format (`:X`)

Formats integers as hexadecimal.

```csharp
int value = 255;

Console.WriteLine($"Hex: {value:X}");   // FF
Console.WriteLine($"Hex: {value:x}");   // ff (lowercase)
Console.WriteLine($"Hex: {value:X4}");  // 00FF
```

---

## Format Specifiers Quick Reference

| Specifier | Name | Example | Output |
|-----------|------|---------|--------|
| `:C` | Currency | `{price:C}` | $1,234.56 |
| `:C0` | Currency (no decimals) | `{price:C0}` | $1,235 |
| `:N` | Number | `{value:N}` | 1,234.56 |
| `:N0` | Number (no decimals) | `{value:N0}` | 1,235 |
| `:N4` | Number (4 decimals) | `{value:N4}` | 1,234.5600 |
| `:P` | Percentage | `{rate:P}` | 12.35% |
| `:P0` | Percentage (no decimals) | `{rate:P0}` | 12% |
| `:F2` | Fixed-point | `{value:F2}` | 1234.56 |
| `:D5` | Decimal (padded) | `{num:D5}` | 00042 |
| `:X` | Hexadecimal | `{num:X}` | FF |
| `:E` | Scientific | `{value:E}` | 1.234560E+003 |

---

## Alignment and Padding

Control the width and alignment of formatted values.

### Syntax

```csharp
{value,alignment:format}
```

- **Positive alignment**: Right-aligned
- **Negative alignment**: Left-aligned

### Examples

```csharp
string product = "Apples";
decimal price = 1.99m;

// Right-align in 10 characters
Console.WriteLine($"|{product,10}|{price,10:C}|");
// Output: |    Apples|     $1.99|

// Left-align in 10 characters
Console.WriteLine($"|{product,-10}|{price,-10:C}|");
// Output: |Apples    |$1.99     |
```

### Creating Formatted Tables

```csharp
string[] products = { "Apples", "Oranges", "Bananas" };
decimal[] prices = { 1.99m, 2.49m, 0.79m };

Console.WriteLine($"{"Product",-12}{"Price",8}");
Console.WriteLine(new string('-', 20));

for (int i = 0; i < products.Length; i++)
{
    Console.WriteLine($"{products[i],-12}{prices[i],8:C}");
}
```

**Output:**
```
Product         Price
--------------------
Apples          $1.99
Oranges         $2.49
Bananas         $0.79
```

---

## Culture Considerations

Formatting depends on the user's culture settings.

### Culture Codes

| Code | Region | Currency | Decimal |
|------|--------|----------|---------|
| `en-US` | USA | $1,234.56 | . |
| `en-GB` | UK | £1,234.56 | . |
| `fr-FR` | France | 1 234,56 € | , |
| `de-DE` | Germany | 1.234,56 € | , |
| `ja-JP` | Japan | ¥1,235 | . |

### Setting Culture

```csharp
using System.Globalization;

// Set specific culture
CultureInfo.CurrentCulture = new CultureInfo("fr-FR");

decimal price = 1234.56m;
Console.WriteLine($"Price: {price:C}");
// Output: Price: 1 234,56 €
```

---

## Combining Formatting Techniques

You can mix composite formatting and string interpolation:

```csharp
decimal price = 67.55m;
decimal salePrice = 59.99m;

string message = String.Format("You saved {0:C2} off the regular {1:C2} price. ",
    (price - salePrice), price);

message += $"A discount of {((price - salePrice) / price):P2}!";

Console.WriteLine(message);
// Output: You saved $7.56 off the regular $67.55 price. A discount of 11.19%!
```

---

## Practical Examples

### Invoice Line Item

```csharp
string item = "Widget";
int quantity = 5;
decimal unitPrice = 29.99m;
decimal total = quantity * unitPrice;

Console.WriteLine($"{item,-15} {quantity,5} x {unitPrice,10:C} = {total,12:C}");
// Output: Widget              5 x     $29.99 =      $149.95
```

### Progress Display

```csharp
int completed = 75;
int total = 100;
decimal progress = (decimal)completed / total;

Console.WriteLine($"Progress: {progress:P0} ({completed}/{total})");
// Output: Progress: 75% (75/100)
```

### Scientific Data

```csharp
double measurement = 0.00012345;

Console.WriteLine($"Value: {measurement:E2}");
// Output: Value: 1.23E-004

Console.WriteLine($"Value: {measurement:N6}");
// Output: Value: 0.000123
```

### Order Summary

```csharp
decimal subtotal = 149.95m;
decimal taxRate = 0.0825m;
decimal tax = subtotal * taxRate;
decimal grandTotal = subtotal + tax;

Console.WriteLine($"Subtotal:    {subtotal,10:C}");
Console.WriteLine($"Tax ({taxRate:P2}): {tax,10:C}");
Console.WriteLine($"{"Total:",13}{grandTotal,10:C}");
```

**Output:**
```
Subtotal:       $149.95
Tax (8.25%):     $12.37
       Total:   $162.32
```

---

## Key Takeaways

1. **String interpolation** (`$"..."`) is the preferred modern approach
2. Use **composite formatting** (`String.Format`) when you need to reorder or reuse placeholders
3. **Format specifiers** control display: `:C` (currency), `:N` (number), `:P` (percentage)
4. Add a **number** after the specifier for precision: `:C2`, `:N4`, `:P0`
5. Use **alignment** for creating formatted tables: `{value,10}` or `{value,-10}`
6. Formatting respects **culture settings** (affects currency symbols, decimal separators)
7. Use **escape sequences** (`\n`, `\t`, `\\`) for special characters in regular strings
8. Use **verbatim strings** (`@"..."`) for file paths and multi-line text
9. Combine both with **`$@"..."`** for interpolated verbatim strings
10. Use **Unicode escapes** (`\uXXXX`) for special symbols

---

## Related Topics

- [[docs/csharp/StringSplitJoin\|String Split and Join]]
- [[docs/csharp/CastingConversion\|Data Type Casting and Conversion]]
- [[docs/csharp/ValueReferenceTypes\|Value Types and Reference Types]]
- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- DateTime Formatting
- Regular Expressions

---

## Source

- [Microsoft Learn: String Formatting Basics](https://learn.microsoft.com/en-us/training/modules/csharp-format-strings/2-string-formatting-basics)
- [Microsoft Learn: String Interpolation](https://learn.microsoft.com/en-us/training/modules/csharp-format-strings/3-exercise-string-interpolation)

---

#csharp #programming #strings #formatting #fundamentals #interpolation #escape-sequences #verbatim
