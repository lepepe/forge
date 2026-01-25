---
{"dg-publish":true,"permalink":"/docs/csharp/array-sort-reverse/"}
---

# Array Sort and Reverse in C#

## Overview

The `Array` class in C# provides built-in methods to manipulate arrays. Two fundamental methods for rearranging array elements are `Sort()` and `Reverse()`.

---

## Array.Sort() Method

Sorts the elements of an array in ascending order (alphanumerically based on the data type).

### Syntax

```csharp
Array.Sort(arrayName);
```

### Example: Sorting Strings

```csharp
string[] pallets = { "B14", "A11", "B12", "A13" };

Console.WriteLine("Original order:");
foreach (var pallet in pallets)
{
    Console.WriteLine($"-- {pallet}");
}

Array.Sort(pallets);

Console.WriteLine("\nSorted order:");
foreach (var pallet in pallets)
{
    Console.WriteLine($"-- {pallet}");
}
```

**Output:**
```
Original order:
-- B14
-- A11
-- B12
-- A13

Sorted order:
-- A11
-- A13
-- B12
-- B14
```

### Example: Sorting Numbers

```csharp
int[] numbers = { 42, 7, 15, 3, 99, 23 };

Array.Sort(numbers);

foreach (var num in numbers)
{
    Console.Write($"{num} ");
}
// Output: 3 7 15 23 42 99
```

---

## Array.Reverse() Method

Reverses the order of elements in an array.

### Syntax

```csharp
Array.Reverse(arrayName);
```

### Example: Reversing an Array

```csharp
string[] pallets = { "A11", "A13", "B12", "B14" };

Console.WriteLine("Original order:");
foreach (var pallet in pallets)
{
    Console.WriteLine($"-- {pallet}");
}

Array.Reverse(pallets);

Console.WriteLine("\nReversed order:");
foreach (var pallet in pallets)
{
    Console.WriteLine($"-- {pallet}");
}
```

**Output:**
```
Original order:
-- A11
-- A13
-- B12
-- B14

Reversed order:
-- B14
-- B12
-- A13
-- A11
```

---

## Combining Sort and Reverse

You can combine these methods to achieve descending order (sort then reverse).

### Example: Descending Order

```csharp
int[] scores = { 85, 92, 78, 95, 88 };

// Sort ascending
Array.Sort(scores);
Console.WriteLine("Ascending: " + string.Join(", ", scores));
// Output: Ascending: 78, 85, 88, 92, 95

// Reverse to get descending
Array.Reverse(scores);
Console.WriteLine("Descending: " + string.Join(", ", scores));
// Output: Descending: 95, 92, 88, 85, 78
```

### Complete Workflow Example

```csharp
string[] pallets = { "B14", "A11", "B12", "A13" };

Console.WriteLine("Original:");
foreach (var pallet in pallets)
{
    Console.WriteLine($"-- {pallet}");
}

Array.Sort(pallets);
Console.WriteLine("\nAfter Sort (A-Z):");
foreach (var pallet in pallets)
{
    Console.WriteLine($"-- {pallet}");
}

Array.Reverse(pallets);
Console.WriteLine("\nAfter Reverse (Z-A):");
foreach (var pallet in pallets)
{
    Console.WriteLine($"-- {pallet}");
}
```

**Output:**
```
Original:
-- B14
-- A11
-- B12
-- A13

After Sort (A-Z):
-- A11
-- A13
-- B12
-- B14

After Reverse (Z-A):
-- B14
-- B12
-- A13
-- A11
```

---

## Important: In-Place Modification

Both `Sort()` and `Reverse()` modify the **original array** directly. They do not return a new array.

```csharp
int[] original = { 3, 1, 4, 1, 5 };

// This modifies 'original' directly
Array.Sort(original);

// 'original' is now { 1, 1, 3, 4, 5 }
```

### Preserving the Original Array

If you need to keep the original array unchanged, create a copy first:

```csharp
int[] original = { 3, 1, 4, 1, 5 };

// Create a copy
int[] sorted = new int[original.Length];
Array.Copy(original, sorted, original.Length);

// Sort the copy
Array.Sort(sorted);

Console.WriteLine("Original: " + string.Join(", ", original));
// Output: Original: 3, 1, 4, 1, 5

Console.WriteLine("Sorted:   " + string.Join(", ", sorted));
// Output: Sorted:   1, 1, 3, 4, 5
```

**Alternative using Clone():**

```csharp
int[] original = { 3, 1, 4, 1, 5 };
int[] sorted = (int[])original.Clone();

Array.Sort(sorted);
```

---

## Sorting Different Data Types

### Strings (Alphabetical)

```csharp
string[] fruits = { "Banana", "Apple", "Cherry", "Date" };
Array.Sort(fruits);
// Result: Apple, Banana, Cherry, Date
```

### Characters

```csharp
char[] letters = { 'd', 'a', 'c', 'b' };
Array.Sort(letters);
// Result: a, b, c, d
```

### Doubles

```csharp
double[] prices = { 19.99, 5.50, 12.75, 8.25 };
Array.Sort(prices);
// Result: 5.50, 8.25, 12.75, 19.99
```

### Case Sensitivity in Strings

By default, string sorting is case-sensitive with uppercase letters coming before lowercase:

```csharp
string[] words = { "banana", "Apple", "cherry", "Banana" };
Array.Sort(words);

foreach (var word in words)
{
    Console.WriteLine(word);
}
```

**Output:**
```
Apple
Banana
banana
cherry
```

---

## Partial Sort and Reverse

You can sort or reverse only a portion of an array.

### Syntax

```csharp
Array.Sort(array, startIndex, length);
Array.Reverse(array, startIndex, length);
```

### Example: Partial Operations

```csharp
int[] numbers = { 5, 2, 8, 1, 9, 3, 7 };

// Sort only elements from index 2, length 3 (elements: 8, 1, 9)
Array.Sort(numbers, 2, 3);

Console.WriteLine(string.Join(", ", numbers));
// Output: 5, 2, 1, 8, 9, 3, 7
//               ^^^^^^^^^ sorted portion
```

```csharp
int[] numbers = { 1, 2, 3, 4, 5, 6, 7 };

// Reverse only elements from index 1, length 4 (elements: 2, 3, 4, 5)
Array.Reverse(numbers, 1, 4);

Console.WriteLine(string.Join(", ", numbers));
// Output: 1, 5, 4, 3, 2, 6, 7
//            ^^^^^^^^^^^ reversed portion
```

---

## Practical Examples

### Sorting Student Grades

```csharp
int[] grades = { 85, 92, 78, 95, 88, 76, 90 };

// Get highest grades (descending)
Array.Sort(grades);
Array.Reverse(grades);

Console.WriteLine("Top 3 grades:");
for (int i = 0; i < 3; i++)
{
    Console.WriteLine($"{i + 1}. {grades[i]}");
}
```

**Output:**
```
Top 3 grades:
1. 95
2. 92
3. 90
```

### Alphabetizing a Name List

```csharp
string[] names = { "Zoe", "Alice", "Bob", "Charlie", "Diana" };

Array.Sort(names);

Console.WriteLine("Alphabetized roster:");
foreach (var name in names)
{
    Console.WriteLine($"- {name}");
}
```

**Output:**
```
Alphabetized roster:
- Alice
- Bob
- Charlie
- Diana
- Zoe
```

### Reversing User Input

```csharp
string[] inputs = { "first", "second", "third", "fourth" };

Array.Reverse(inputs);

Console.WriteLine("Reversed order (LIFO):");
foreach (var item in inputs)
{
    Console.WriteLine(item);
}
```

**Output:**
```
Reversed order (LIFO):
fourth
third
second
first
```

---

## Quick Reference

| Method | Purpose | Modifies Original? |
|--------|---------|-------------------|
| `Array.Sort(arr)` | Sort ascending | Yes |
| `Array.Reverse(arr)` | Reverse order | Yes |
| `Array.Sort(arr, index, length)` | Sort portion | Yes |
| `Array.Reverse(arr, index, length)` | Reverse portion | Yes |

### Common Patterns

```csharp
// Ascending order
Array.Sort(array);

// Descending order
Array.Sort(array);
Array.Reverse(array);

// Keep original, sort copy
int[] copy = (int[])array.Clone();
Array.Sort(copy);
```

---

## Key Takeaways

1. `Array.Sort()` sorts elements in **ascending** order (alphanumerically)
2. `Array.Reverse()` reverses the **current order** of elements
3. Both methods modify the **original array in place**
4. Combine `Sort()` + `Reverse()` for **descending** order
5. Use `Clone()` or `Array.Copy()` to preserve the original array
6. Both methods support **partial operations** with start index and length
7. String sorting is **case-sensitive** by default

---

## Related Topics

- [[docs/csharp/CSharp_For_Loop\|For Loop]]
- [[docs/csharp/CSharp_Value_Reference_Types\|Value Types and Reference Types]]
- [[docs/csharp/CSharp_Learning\|C# Learning Guide]]
- Array Clear, Resize, and Copy
- LINQ OrderBy and OrderByDescending
- List<T> Sort Methods

---

## Source

- [Microsoft Learn: Array Sort and Reverse](https://learn.microsoft.com/en-us/training/modules/csharp-arrays-operations/2-exercise-sort-reverse)

---

#csharp #programming #arrays #sorting #fundamentals #collections
