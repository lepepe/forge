---
{"dg-publish":true,"permalink":"/docs/csharp/index-of-substring/","tags":["methods","string-manipulation","substring","strings"]}
---

# String Manipulation Methods in C#

## Overview

String manipulation methods are essential tools in C#. They work together to locate, extract, modify, and transform text.

| Method | Purpose |
|--------|---------|
| `IndexOf()` | Find the first position of a character or substring |
| `LastIndexOf()` | Find the last position of a character or substring |
| `IndexOfAny()` | Find the first position of any character in an array |
| `Substring()` | Extract a portion of a string |
| `Remove()` | Remove characters from a specific position |
| `Replace()` | Replace all occurrences of a value |

---

## IndexOf() Method

Locates the position (zero-based index) of a character or string within a larger string.

### Syntax

```csharp
int position = sourceString.IndexOf(searchValue);
int position = sourceString.IndexOf(searchValue, startIndex);
int position = sourceString.IndexOf(searchValue, startIndex, count);
```

### Return Value

- Returns the **zero-based index** of the first occurrence
- Returns **-1** if the value is not found

### Finding a Single Character

```csharp
string message = "Find what is (inside the parentheses)";

int openingPosition = message.IndexOf('(');
int closingPosition = message.IndexOf(')');

Console.WriteLine($"Opening parenthesis at: {openingPosition}");  // 13
Console.WriteLine($"Closing parenthesis at: {closingPosition}");  // 36
```

### Finding a String

```csharp
string message = "What is the value <span>between the tags</span>?";

int openingPosition = message.IndexOf("<span>");
int closingPosition = message.IndexOf("</span>");

Console.WriteLine($"<span> starts at: {openingPosition}");    // 18
Console.WriteLine($"</span> starts at: {closingPosition}");   // 35
```

### Starting From a Specific Position

```csharp
string text = "cat, bat, hat, cat, mat";

int first = text.IndexOf("cat");          // 0
int second = text.IndexOf("cat", 1);      // 15 (starts searching from index 1)
```

### Checking if Value Exists

```csharp
string message = "Hello, World!";

if (message.IndexOf("World") != -1)
{
    Console.WriteLine("Found 'World' in the message");
}

if (message.IndexOf("Goodbye") == -1)
{
    Console.WriteLine("'Goodbye' was not found");
}
```

---

## Substring() Method

Returns a specified portion of a string based on starting position and optional length.

### Syntax

```csharp
// From startIndex to end of string
string result = sourceString.Substring(startIndex);

// From startIndex for specified length
string result = sourceString.Substring(startIndex, length);
```

### Extract From Position to End

```csharp
string message = "Hello, World!";

string result = message.Substring(7);
Console.WriteLine(result);  // "World!"
```

### Extract Specific Length

```csharp
string message = "Hello, World!";

string result = message.Substring(0, 5);
Console.WriteLine(result);  // "Hello"
```

### Visual Representation

```
String:  H  e  l  l  o  ,     W  o  r  l  d  !
Index:   0  1  2  3  4  5  6  7  8  9  10 11 12

Substring(7)      → "World!"        (from index 7 to end)
Substring(0, 5)   → "Hello"         (from index 0, length 5)
Substring(7, 5)   → "World"         (from index 7, length 5)
```

---

## Combining IndexOf() and Substring()

The real power comes from combining these methods to extract dynamic content.

### Extract Text Between Parentheses

```csharp
string message = "Find what is (inside the parentheses)";

int openingPosition = message.IndexOf('(');
int closingPosition = message.IndexOf(')');

// Move past the opening parenthesis
openingPosition += 1;

// Calculate length of content
int length = closingPosition - openingPosition;

string content = message.Substring(openingPosition, length);
Console.WriteLine(content);  // "inside the parentheses"
```

### Extract Text Between Tags

```csharp
string message = "What is the value <span>between the tags</span>?";

const string openSpan = "<span>";
const string closeSpan = "</span>";

int openingPosition = message.IndexOf(openSpan);
int closingPosition = message.IndexOf(closeSpan);

// Move past the opening tag
openingPosition += openSpan.Length;

// Calculate length of content
int length = closingPosition - openingPosition;

string content = message.Substring(openingPosition, length);
Console.WriteLine(content);  // "between the tags"
```

### Step-by-Step Visualization

```
Message: "What is the value <span>between the tags</span>?"
Index:    0         1         2         3         4
          0123456789012345678901234567890123456789012345678

IndexOf("<span>")  → 18
IndexOf("</span>") → 35

openingPosition = 18 + 6 = 24  (skip past "<span>")
length = 35 - 24 = 11

Substring(24, 11) → "between the tags"
```

---

## LastIndexOf() Method

Finds the **last** occurrence of a character or string (searches from the end).

### Syntax

```csharp
int position = sourceString.LastIndexOf(searchValue);
int position = sourceString.LastIndexOf(searchValue, startIndex);
```

### Basic Example

```csharp
string message = "hello there!";

int first_h = message.IndexOf('h');      // 0
int last_h = message.LastIndexOf('h');   // 7

Console.WriteLine($"First 'h' at position {first_h}, last 'h' at position {last_h}.");
// Output: First 'h' at position 0, last 'h' at position 7.
```

### Extract Filename from Path

```csharp
string path = "C:\\Users\\John\\Documents\\file.txt";

int lastBackslash = path.LastIndexOf('\\');
string filename = path.Substring(lastBackslash + 1);

Console.WriteLine(filename);  // "file.txt"
```

### Extract Content from Last Set of Parentheses

When a string has multiple sets of parentheses, use `LastIndexOf()` to get the last one:

```csharp
string message = "(What if) I am (only interested) in the last (set of parentheses)?";

int openingPosition = message.LastIndexOf('(');
openingPosition += 1;
int closingPosition = message.LastIndexOf(')');
int length = closingPosition - openingPosition;

Console.WriteLine(message.Substring(openingPosition, length));
// Output: set of parentheses
```

### Comparing First and Last

```csharp
string text = "cat, bat, hat, cat, mat";

int firstCat = text.IndexOf("cat");      // 0
int lastCat = text.LastIndexOf("cat");   // 15

Console.WriteLine($"First 'cat' at: {firstCat}");
Console.WriteLine($"Last 'cat' at: {lastCat}");
```

---

## Iterating Through All Occurrences

Use a `while` loop to extract all instances of content between delimiters.

### Extract All Content Between Parentheses

```csharp
string message = "(What if) there are (more than) one (set of parentheses)?";

while (true)
{
    int openingPosition = message.IndexOf('(');
    if (openingPosition == -1) break;

    openingPosition += 1;
    int closingPosition = message.IndexOf(')');
    int length = closingPosition - openingPosition;

    Console.WriteLine(message.Substring(openingPosition, length));

    // Remove the processed portion and continue
    message = message.Substring(closingPosition + 1);
}
```

**Output:**
```
What if
more than
set of parentheses
```

**Key Technique:** After extracting content, use `Substring(closingPosition + 1)` to remove the processed portion and continue searching the remaining string.

### Alternative: Track Position Without Modifying String

```csharp
string message = "(first) and (second) and (third)";
int searchStart = 0;

while (true)
{
    int openingPosition = message.IndexOf('(', searchStart);
    if (openingPosition == -1) break;

    int closingPosition = message.IndexOf(')', openingPosition);
    if (closingPosition == -1) break;

    int contentStart = openingPosition + 1;
    int length = closingPosition - contentStart;

    Console.WriteLine(message.Substring(contentStart, length));

    searchStart = closingPosition + 1;
}
```

**Output:**
```
first
second
third
```

---

## IndexOfAny() Method

Finds the first occurrence of **any character** in a specified array.

### Syntax

```csharp
int position = sourceString.IndexOfAny(char[] anyOf);
```

### Example

```csharp
string message = "Hello, World! How are you?";
char[] punctuation = { ',', '!', '?' };

int firstPunctuation = message.IndexOfAny(punctuation);
Console.WriteLine($"First punctuation at: {firstPunctuation}");  // 5

// Find all punctuation positions
int position = 0;
while ((position = message.IndexOfAny(punctuation, position)) != -1)
{
    Console.WriteLine($"Found '{message[position]}' at position {position}");
    position++;
}
```

**Output:**
```
Found ',' at position 5
Found '!' at position 12
Found '?' at position 25
```

---

## Remove() Method

Removes characters from a string starting at a specific position.

### Syntax

```csharp
string result = sourceString.Remove(startIndex);
string result = sourceString.Remove(startIndex, count);
```

### Basic Example

```csharp
string message = "Hello, World!";

// Remove from position 5 to end
string result1 = message.Remove(5);
Console.WriteLine(result1);  // "Hello"

// Remove 2 characters starting at position 5
string result2 = message.Remove(5, 2);
Console.WriteLine(result2);  // "HelloWorld!"
```

### Remove Fixed-Width Data

Useful when working with fixed-width formatted data:

```csharp
string data = "12345John Smith          5000  3  ";

// Remove 20 characters starting at position 5 (the name field)
string updatedData = data.Remove(5, 20);
Console.WriteLine(updatedData);
// Output: 123455000  3
```

### Visual Representation

```
Original: "Hello, World!"
Index:     0123456789...

Remove(5)      → "Hello"           (removes from index 5 to end)
Remove(5, 2)   → "HelloWorld!"     (removes ", " at positions 5-6)
```

---

## Replace() Method

Replaces all occurrences of a specified value with another value.

### Syntax

```csharp
string result = sourceString.Replace(oldValue, newValue);
```

### Key Characteristic

`Replace()` replaces **EVERY instance** of the specified value throughout the entire string—not just the first or last occurrence.

### Basic Example

```csharp
string message = "Hello, World!";

string result = message.Replace("World", "C#");
Console.WriteLine(result);  // "Hello, C#!"
```

### Replace All Occurrences

```csharp
string text = "cat, cat, cat";

string result = text.Replace("cat", "dog");
Console.WriteLine(result);  // "dog, dog, dog"
```

### Remove Characters (Replace with Empty String)

```csharp
string message = "H_e_l_l_o";

string result = message.Replace("_", "");
Console.WriteLine(result);  // "Hello"
```

### Chaining Multiple Replacements

```csharp
string message = "This--is--ex-amp-le--da-ta";

message = message.Replace("--", " ");   // Replace double dash with space
message = message.Replace("-", "");     // Remove single dashes

Console.WriteLine(message);
// Output: This is example data
```

### Replace Characters

```csharp
string path = "C:/Users/John/Documents";

// Replace forward slash with backslash
string windowsPath = path.Replace('/', '\\');
Console.WriteLine(windowsPath);  // "C:\Users\John\Documents"
```

---

## Remove() vs Replace() Comparison

| Feature | Remove() | Replace() |
|---------|----------|-----------|
| Works by | Position (index) | Value matching |
| Removes/Replaces | Specified count from position | All occurrences |
| Use when | Position is known and fixed | Value can appear anywhere |
| Returns | New string without removed chars | New string with replacements |

### When to Use Each

```csharp
string data = "ID:12345-Name:John-Age:30";

// Use Remove() when you know exact positions
string withoutId = data.Remove(0, 9);  // Remove "ID:12345-"
Console.WriteLine(withoutId);  // "Name:John-Age:30"

// Use Replace() when targeting specific values anywhere
string formatted = data.Replace("-", " | ");
Console.WriteLine(formatted);  // "ID:12345 | Name:John | Age:30"

// Use Replace() to remove all occurrences of something
string clean = data.Replace("-", "");
Console.WriteLine(clean);  // "ID:12345Name:JohnAge:30"
```

---

## Related Methods

| Method | Purpose |
|--------|---------|
| `IndexOf()` | First occurrence of value |
| `LastIndexOf()` | Last occurrence of value |
| `IndexOfAny()` | First occurrence of any character in array |
| `LastIndexOfAny()` | Last occurrence of any character in array |
| `Substring()` | Extract portion of string |
| `Remove()` | Remove characters from position |
| `Replace()` | Replace all occurrences of a value |
| `Contains()` | Returns true/false if value exists |
| `StartsWith()` | Returns true/false if string starts with value |
| `EndsWith()` | Returns true/false if string ends with value |

---

## Practical Examples

### Parse Email Address

```csharp
string email = "john.doe@example.com";

int atPosition = email.IndexOf('@');
int dotPosition = email.LastIndexOf('.');

string username = email.Substring(0, atPosition);
string domain = email.Substring(atPosition + 1, dotPosition - atPosition - 1);
string extension = email.Substring(dotPosition + 1);

Console.WriteLine($"Username: {username}");    // john.doe
Console.WriteLine($"Domain: {domain}");        // example
Console.WriteLine($"Extension: {extension}");  // com
```

### Extract URL Components

```csharp
string url = "https://www.example.com/path/to/page";

int protocolEnd = url.IndexOf("://");
int pathStart = url.IndexOf('/', protocolEnd + 3);

string protocol = url.Substring(0, protocolEnd);
string host = url.Substring(protocolEnd + 3, pathStart - protocolEnd - 3);
string path = url.Substring(pathStart);

Console.WriteLine($"Protocol: {protocol}");  // https
Console.WriteLine($"Host: {host}");          // www.example.com
Console.WriteLine($"Path: {path}");          // /path/to/page
```

### Parse CSV Line

```csharp
string csvLine = "John,Doe,30,Engineer";
int start = 0;
int comma;

Console.WriteLine("Parsed fields:");
while ((comma = csvLine.IndexOf(',', start)) != -1)
{
    Console.WriteLine($"  {csvLine.Substring(start, comma - start)}");
    start = comma + 1;
}
// Don't forget the last field
Console.WriteLine($"  {csvLine.Substring(start)}");
```

**Output:**
```
Parsed fields:
  John
  Doe
  30
  Engineer
```

### Find and Replace First Occurrence

```csharp
string text = "The cat sat on the cat mat";
string find = "cat";
string replace = "dog";

int position = text.IndexOf(find);

if (position != -1)
{
    string result = text.Substring(0, position) +
                    replace +
                    text.Substring(position + find.Length);

    Console.WriteLine(result);  // "The dog sat on the cat mat"
}
```

---

## Best Practices

### Avoid Magic Values

Use `const` variables instead of hardcoded strings:

```csharp
// ❌ Avoid magic values
openingPosition += 6;
message.IndexOf("<span>");

// ✅ Use constants
const string openSpan = "<span>";
openingPosition += openSpan.Length;
message.IndexOf(openSpan);
```

### Always Check for -1

```csharp
string message = "Hello, World!";
int position = message.IndexOf("xyz");

// ❌ Dangerous - will throw exception if not found
// string result = message.Substring(position);

// ✅ Safe approach
if (position != -1)
{
    string result = message.Substring(position);
    Console.WriteLine(result);
}
else
{
    Console.WriteLine("Value not found");
}
```

### Consider Using Contains() for Simple Checks

```csharp
string message = "Hello, World!";

// If you just need to know if it exists
if (message.Contains("World"))
{
    Console.WriteLine("Found!");
}

// Use IndexOf when you need the position
int position = message.IndexOf("World");
if (position != -1)
{
    // Do something with the position
}
```

---

## Quick Reference

| Operation | Code |
|-----------|------|
| Find first occurrence | `str.IndexOf("value")` |
| Find last occurrence | `str.LastIndexOf("value")` |
| Find from position | `str.IndexOf("value", startIndex)` |
| Find any character | `str.IndexOfAny(charArray)` |
| Extract to end | `str.Substring(startIndex)` |
| Extract with length | `str.Substring(startIndex, length)` |
| Remove to end | `str.Remove(startIndex)` |
| Remove specific count | `str.Remove(startIndex, count)` |
| Replace all occurrences | `str.Replace("old", "new")` |
| Remove all occurrences | `str.Replace("value", "")` |
| Check if exists | `str.Contains("value")` |
| Check if not found | `str.IndexOf("value") == -1` |

---

## Key Takeaways

1. `IndexOf()` returns the **zero-based position** of the first match, or **-1** if not found
2. `LastIndexOf()` finds the **last** occurrence (useful for file paths, extensions)
3. `Substring()` extracts text from a **starting position** with optional **length**
4. `Remove()` deletes characters from a **specific position** (fixed-width data)
5. `Replace()` replaces **ALL occurrences** of a value throughout the string
6. Always **check for -1** before using the position from `IndexOf()`
7. Use **constants** instead of magic values for maintainable code
8. `IndexOfAny()` finds the first occurrence of **any character** in an array
9. Use a **while loop** to iterate through multiple occurrences
10. Combine these methods to **parse and transform** string data

---

## Related Topics

- [[docs/csharp/StringSplitJoin\|String Split and Join]]
- [[docs/csharp/StringFormatting\|String Formatting]]
- [[docs/csharp/ForLoop\|For Loop]]
- [[docs/csharp/WhileDoWhileLoops\|While and Do-While Loops]]
- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- String Replace Methods
- Regular Expressions

---

## Source

- [Microsoft Learn: IndexOf() and Substring()](https://learn.microsoft.com/en-us/training/modules/csharp-modify-content/2-exercise-indexof-substring)
- [Microsoft Learn: LastIndexOf() and IndexOfAny()](https://learn.microsoft.com/en-us/training/modules/csharp-modify-content/3-exercise-lastindexof-indexof)
- [Microsoft Learn: Remove() and Replace()](https://learn.microsoft.com/en-us/training/modules/csharp-modify-content/4-exercise-remove-replace)

---

#csharp #programming #strings #indexof #substring #remove #replace #fundamentals #string-manipulation
