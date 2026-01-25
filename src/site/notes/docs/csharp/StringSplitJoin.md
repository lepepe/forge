---
{"dg-publish":true,"permalink":"/docs/csharp/string-split-join/","tags":["strings","string-manipulation","join","split"]}
---

# String Split and Join in C#

## Overview

The `Split()` and `Join()` methods are essential tools for converting between strings and arrays. They are commonly used for parsing data, processing CSV files, and transforming text.

| Method | Direction | Purpose |
|--------|-----------|---------|
| `Split()` | String → Array | Break a string into parts |
| `Join()` | Array → String | Combine array elements into one string |

---

## String.Split() Method

Converts a single string into an array of strings by splitting at a specified delimiter.

### Syntax

```csharp
string[] result = sourceString.Split(delimiter);
```

### Basic Example

```csharp
string data = "apple,banana,cherry,date";
string[] fruits = data.Split(',');

foreach (string fruit in fruits)
{
    Console.WriteLine(fruit);
}
```

**Output:**
```
apple
banana
cherry
date
```

### How It Works

```
Original String:  "apple,banana,cherry,date"
                      ↓ Split(',')
Array Elements:   ["apple", "banana", "cherry", "date"]
                     [0]      [1]       [2]      [3]
```

---

## Split() Variations

### Split by Single Character

```csharp
string csv = "John,25,Engineer";
string[] parts = csv.Split(',');

Console.WriteLine($"Name: {parts[0]}");   // John
Console.WriteLine($"Age: {parts[1]}");    // 25
Console.WriteLine($"Job: {parts[2]}");    // Engineer
```

### Split by Multiple Characters

```csharp
string data = "one;two,three|four";
string[] items = data.Split(',', ';', '|');

foreach (var item in items)
{
    Console.WriteLine(item);
}
// Output: one, two, three, four
```

### Split by String Delimiter

```csharp
string sentence = "Hello---World---Today";
string[] words = sentence.Split("---");

foreach (var word in words)
{
    Console.WriteLine(word);
}
// Output: Hello, World, Today
```

### Split with Limit

Limit the number of resulting elements:

```csharp
string data = "one,two,three,four,five";
string[] parts = data.Split(',', 3);  // Maximum 3 parts

foreach (var part in parts)
{
    Console.WriteLine(part);
}
```

**Output:**
```
one
two
three,four,five
```

### Split and Remove Empty Entries

```csharp
string data = "apple,,banana,,,cherry";
string[] items = data.Split(',', StringSplitOptions.RemoveEmptyEntries);

Console.WriteLine(string.Join(" | ", items));
// Output: apple | banana | cherry
```

### Split and Trim Whitespace

```csharp
string data = " apple , banana , cherry ";
string[] items = data.Split(',', StringSplitOptions.TrimEntries);

Console.WriteLine(string.Join("|", items));
// Output: apple|banana|cherry
```

### Combine Options

```csharp
string data = " apple , , banana ,, cherry ";
string[] items = data.Split(',',
    StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

Console.WriteLine(string.Join("|", items));
// Output: apple|banana|cherry
```

---

## String.Join() Method

Combines array elements into a single string with a specified delimiter between each element.

### Syntax

```csharp
string result = String.Join(delimiter, array);
```

### Basic Example

```csharp
string[] fruits = { "apple", "banana", "cherry", "date" };
string result = String.Join(", ", fruits);

Console.WriteLine(result);
// Output: apple, banana, cherry, date
```

### How It Works

```
Array Elements:   ["apple", "banana", "cherry", "date"]
                     ↓ Join(", ")
Result String:    "apple, banana, cherry, date"
```

---

## Join() Variations

### Join with Different Delimiters

```csharp
string[] words = { "Hello", "World", "Today" };

Console.WriteLine(String.Join(" ", words));    // Hello World Today
Console.WriteLine(String.Join("-", words));    // Hello-World-Today
Console.WriteLine(String.Join("", words));     // HelloWorldToday
Console.WriteLine(String.Join(" | ", words));  // Hello | World | Today
Console.WriteLine(String.Join("\n", words));   // Each on new line
```

### Join Character Array

```csharp
char[] letters = { 'H', 'e', 'l', 'l', 'o' };
string result = String.Join("", letters);

Console.WriteLine(result);  // Hello
```

### Join with Numbers

```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
string result = String.Join(" + ", numbers);

Console.WriteLine(result);  // 1 + 2 + 3 + 4 + 5
```

### Join Portion of Array

```csharp
string[] items = { "a", "b", "c", "d", "e" };

// Join elements from index 1, count 3
string result = String.Join("-", items, 1, 3);

Console.WriteLine(result);  // b-c-d
```

---

## ToCharArray() Method

Converts a string into an array of individual characters.

### Syntax

```csharp
char[] characters = sourceString.ToCharArray();
```

### Example

```csharp
string word = "Hello";
char[] letters = word.ToCharArray();

foreach (char letter in letters)
{
    Console.WriteLine(letter);
}
```

**Output:**
```
H
e
l
l
o
```

### Practical Use: Reverse a String

```csharp
string original = "Hello";
char[] chars = original.ToCharArray();

Array.Reverse(chars);

string reversed = new string(chars);
Console.WriteLine(reversed);  // olleH
```

---

## Complete Workflow Example

A common pattern: Split → Process → Join

```csharp
// Original comma-separated data
string data = "B14,A11,B12,A13";

// Step 1: Split into array
string[] items = data.Split(',');
Console.WriteLine($"Original: {data}");

// Step 2: Sort the array
Array.Sort(items);
Console.WriteLine($"Sorted array: [{String.Join(", ", items)}]");

// Step 3: Reverse the array
Array.Reverse(items);
Console.WriteLine($"Reversed array: [{String.Join(", ", items)}]");

// Step 4: Join back into string
string result = String.Join(",", items);
Console.WriteLine($"Final result: {result}");
```

**Output:**
```
Original: B14,A11,B12,A13
Sorted array: [A11, A13, B12, B14]
Reversed array: [B14, B12, A13, A11]
Final result: B14,B12,A13,A11
```

---

## Practical Examples

### Parsing CSV Data

```csharp
string csvLine = "John Doe,35,Engineer,New York";
string[] fields = csvLine.Split(',');

string name = fields[0];
int age = int.Parse(fields[1]);
string occupation = fields[2];
string city = fields[3];

Console.WriteLine($"{name} is a {age}-year-old {occupation} from {city}.");
// Output: John Doe is a 35-year-old Engineer from New York.
```

### Building a File Path

```csharp
string[] pathParts = { "Users", "john", "Documents", "file.txt" };
string path = String.Join("/", pathParts);

Console.WriteLine(path);
// Output: Users/john/Documents/file.txt
```

### Processing User Input

```csharp
Console.Write("Enter tags (comma-separated): ");
string input = "csharp, programming, tutorial";  // Simulated input

string[] tags = input.Split(',', StringSplitOptions.TrimEntries);

Console.WriteLine("Processed tags:");
foreach (var tag in tags)
{
    Console.WriteLine($"  - {tag}");
}
```

**Output:**
```
Processed tags:
  - csharp
  - programming
  - tutorial
```

### Creating a Sentence from Words

```csharp
string[] words = { "The", "quick", "brown", "fox" };
string sentence = String.Join(" ", words) + ".";

Console.WriteLine(sentence);
// Output: The quick brown fox.
```

### Extracting Domain from Email

```csharp
string email = "user@example.com";
string[] parts = email.Split('@');

string username = parts[0];
string domain = parts[1];

Console.WriteLine($"Username: {username}");  // user
Console.WriteLine($"Domain: {domain}");      // example.com
```

---

## Quick Reference

| Method | Syntax | Result |
|--------|--------|--------|
| Split by char | `str.Split(',')` | String array |
| Split by string | `str.Split("--")` | String array |
| Split with limit | `str.Split(',', 3)` | Max 3 elements |
| Split remove empty | `str.Split(',', StringSplitOptions.RemoveEmptyEntries)` | No empty strings |
| Split and trim | `str.Split(',', StringSplitOptions.TrimEntries)` | Trimmed strings |
| Join with delimiter | `String.Join(",", arr)` | Single string |
| Join portion | `String.Join(",", arr, start, count)` | Partial join |
| To char array | `str.ToCharArray()` | Char array |

---

## StringSplitOptions

| Option | Description |
|--------|-------------|
| `None` | Default behavior |
| `RemoveEmptyEntries` | Exclude empty strings from result |
| `TrimEntries` | Trim whitespace from each element (.NET 5+) |

---

## Key Takeaways

1. `Split()` converts a **string → array** using a delimiter
2. `Join()` converts an **array → string** using a delimiter
3. `ToCharArray()` converts a **string → char array**
4. Use `StringSplitOptions.RemoveEmptyEntries` to exclude empty strings
5. Use `StringSplitOptions.TrimEntries` to automatically trim whitespace
6. Common pattern: **Split → Process → Join** for data transformation
7. Both methods are essential for **parsing** and **formatting** data

---

## Related Topics

- [[docs/csharp/ArraySortReverse\|Array Sort and Reverse]]
- [[docs/csharp/ForLoop\|For Loop]]
- [[docs/csharp/ValueReferenceTypes\|Value Types and Reference Types]]
- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- String Manipulation Methods
- Regular Expressions

---

## Source

- [Microsoft Learn: String Split and Join](https://learn.microsoft.com/en-us/training/modules/csharp-arrays-operations/4-exercise-split-join)

---

#csharp #programming #strings #arrays #parsing #fundamentals #data-transformation
