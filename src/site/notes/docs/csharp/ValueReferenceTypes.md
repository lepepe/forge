---
{"dg-publish":true,"permalink":"/docs/csharp/value-reference-types/","tags":["data-types","value-types","reference-types","types"]}
---

# Value Types and Reference Types in C#

## Overview

In C#, all data types fall into one of two categories:

- **Value Types**: Variables directly contain their data
- **Reference Types**: Variables store a reference (pointer) to their data

Understanding this distinction is fundamental for writing efficient and bug-free C# code.

---

## The Basics: Bits and Bytes

Before diving into data types, it's important to understand how data is stored.

### Bits

A **bit** is the smallest unit of data storage—a binary switch that is either:
- `0` (off)
- `1` (on)

### Bytes

A **byte** consists of **8 bits**, allowing for 256 possible combinations (2^8 = 256).

**Example:** Converting binary to decimal
```
Binary:  1  1  0  0  0  0  1  1
Place:  128 64 32 16  8  4  2  1
Value:  128+64+ 0+ 0+ 0+ 0+ 2+ 1 = 195
```

### Character Encoding (ASCII)

Text is stored as numeric values mapped to characters:

| Character | Decimal | Binary |
|-----------|---------|--------|
| `a` | 97 | 01100001 |
| `b` | 98 | 01100010 |
| `A` | 65 | 01000001 |
| `0` | 48 | 00110000 |

---

## What is a Data Type?

A data type defines:

1. **How much memory** to allocate for a value
2. **The range** of possible values
3. **How the compiler interprets** the stored bits

```csharp
int number = 42;       // Allocates 4 bytes (32 bits)
long bigNumber = 42;   // Allocates 8 bytes (64 bits)
```

---

## Value Types

**Value types** directly contain their data. When you assign a value type variable to another, a **copy** of the value is made.

### Characteristics

- Stored on the **stack** (fast access)
- Contains the actual data
- Assignment creates a **copy**
- Cannot be `null` (unless nullable: `int?`)

### Simple Value Types

C# provides keyword aliases for .NET types:

| Keyword | .NET Type | Size | Range |
|---------|-----------|------|-------|
| `sbyte` | System.SByte | 1 byte | -128 to 127 |
| `byte` | System.Byte | 1 byte | 0 to 255 |
| `short` | System.Int16 | 2 bytes | -32,768 to 32,767 |
| `ushort` | System.UInt16 | 2 bytes | 0 to 65,535 |
| `int` | System.Int32 | 4 bytes | -2.1B to 2.1B |
| `uint` | System.UInt32 | 4 bytes | 0 to 4.2B |
| `long` | System.Int64 | 8 bytes | ±9.2 quintillion |
| `ulong` | System.UInt64 | 8 bytes | 0 to 18.4 quintillion |

### Floating-Point Types

| Keyword | .NET Type | Size | Precision |
|---------|-----------|------|-----------|
| `float` | System.Single | 4 bytes | ~6-9 digits |
| `double` | System.Double | 8 bytes | ~15-17 digits |
| `decimal` | System.Decimal | 16 bytes | 28-29 digits |

```csharp
float f = 3.14f;        // Note the 'f' suffix
double d = 3.14159;     // Default for decimals
decimal m = 3.14159m;   // Note the 'm' suffix (money)
```

### Other Value Types

| Keyword | .NET Type | Description |
|---------|-----------|-------------|
| `bool` | System.Boolean | `true` or `false` |
| `char` | System.Char | Single Unicode character |

```csharp
bool isActive = true;
char letter = 'A';      // Single quotes for char
```

### Struct (Custom Value Type)

```csharp
struct Point
{
    public int X;
    public int Y;
}

Point p1 = new Point { X = 10, Y = 20 };
Point p2 = p1;  // Creates a COPY
p2.X = 99;

Console.WriteLine(p1.X);  // Still 10 (original unchanged)
Console.WriteLine(p2.X);  // 99
```

---

## Reference Types

**Reference types** store a reference (memory address) to their data. When you assign a reference type variable to another, both variables **point to the same object**.

### Characteristics

- Data stored on the **heap**
- Variable holds a **reference** (pointer) to the data
- Assignment copies the **reference**, not the data
- Can be `null`
- Managed by garbage collector

### Common Reference Types

| Type | Description |
|------|-------------|
| `string` | Text (immutable sequence of characters) |
| `object` | Base type of all types |
| `class` | Custom reference types |
| `array` | Collections of elements |
| `interface` | Contracts for classes |
| `delegate` | Type-safe function pointers |

### Example: Reference Type Behavior

```csharp
int[] arr1 = { 1, 2, 3 };
int[] arr2 = arr1;  // Both point to SAME array

arr2[0] = 99;

Console.WriteLine(arr1[0]);  // 99 (changed!)
Console.WriteLine(arr2[0]);  // 99
```

Both `arr1` and `arr2` reference the same array in memory.

---

## Stack vs Heap

### The Stack

- **Fast** memory allocation
- **LIFO** (Last In, First Out) structure
- Stores **value types** and **references**
- Automatically cleaned up when scope ends
- Limited size

### The Heap

- **Slower** memory allocation
- Stores **objects** (reference type data)
- Managed by **garbage collector**
- Larger, more flexible size

### Visual Representation

```
┌─────────────────────────────────────────────────────┐
│                      STACK                          │
├─────────────────────────────────────────────────────┤
│  int number = 42         │  42                      │
│  bool flag = true        │  true                    │
│  string name = "John"    │  ──────────────┐         │
│  int[] scores = {1,2,3}  │  ─────────┐    │         │
└──────────────────────────────────────┼────┼─────────┘
                                       │    │
                           ┌───────────┘    │
                           │                │
┌──────────────────────────┼────────────────┼─────────┐
│                      HEAP│                │         │
├──────────────────────────┼────────────────┼─────────┤
│                          ▼                ▼         │
│               ┌─────────────┐    ┌──────────────┐   │
│               │  [1, 2, 3]  │    │   "John"     │   │
│               └─────────────┘    └──────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Value Type vs Reference Type Comparison

| Feature | Value Type | Reference Type |
|---------|------------|----------------|
| Storage | Stack | Heap (reference on stack) |
| Contains | Actual data | Reference to data |
| Assignment | Copies value | Copies reference |
| Default value | 0, false, etc. | `null` |
| Can be null | No (unless nullable) | Yes |
| Examples | int, bool, struct | string, class, array |

---

## Practical Demonstration

### Value Type Behavior

```csharp
int a = 10;
int b = a;      // Copy the VALUE

b = 20;

Console.WriteLine(a);  // 10 (unchanged)
Console.WriteLine(b);  // 20
```

### Reference Type Behavior

```csharp
class Person
{
    public string Name;
}

Person person1 = new Person { Name = "Alice" };
Person person2 = person1;  // Copy the REFERENCE

person2.Name = "Bob";

Console.WriteLine(person1.Name);  // "Bob" (changed!)
Console.WriteLine(person2.Name);  // "Bob"
```

### Creating Independent Copies of Reference Types

To create a true copy, you must explicitly clone:

```csharp
Person person1 = new Person { Name = "Alice" };
Person person2 = new Person { Name = person1.Name };  // New object

person2.Name = "Bob";

Console.WriteLine(person1.Name);  // "Alice" (unchanged)
Console.WriteLine(person2.Name);  // "Bob"
```

---

## Special Case: Strings

Strings are **reference types** but behave like value types because they are **immutable**.

```csharp
string s1 = "Hello";
string s2 = s1;

s2 = "World";  // Creates a NEW string object

Console.WriteLine(s1);  // "Hello" (unchanged)
Console.WriteLine(s2);  // "World"
```

When you modify a string, a **new string object** is created rather than modifying the original.

---

## Nullable Value Types

Value types cannot normally be `null`, but you can make them nullable:

```csharp
int? nullableInt = null;       // Nullable int
bool? nullableBool = null;     // Nullable bool

if (nullableInt.HasValue)
{
    Console.WriteLine(nullableInt.Value);
}
else
{
    Console.WriteLine("No value");
}

// Null-coalescing operator
int result = nullableInt ?? 0;  // Use 0 if null
```

---

## Key Takeaways

1. **Value types** contain data directly; **reference types** contain a pointer to data
2. Value types are stored on the **stack**; reference type data is stored on the **heap**
3. Assigning a value type **copies the value**; assigning a reference type **copies the reference**
4. Value types cannot be `null` unless declared as nullable (`int?`)
5. Strings are reference types but **immutable**, so they behave like value types
6. Keywords like `int` are **aliases** for .NET types like `System.Int32`
7. Use `decimal` for financial calculations (highest precision)

---

## Related Topics

- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- [[docs/csharp/CodeBlocksVariableScope\|Code Blocks and Variable Scope]]
- Memory Management and Garbage Collection
- Nullable Types
- Structs vs Classes

---

## Source

- [Microsoft Learn: Value Types and Reference Types](https://learn.microsoft.com/en-us/training/modules/csharp-choose-data-type/2-value-reference-types)

---

#csharp #programming #data-types #value-types #reference-types #memory #fundamentals
