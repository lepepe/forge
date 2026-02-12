---
{"dg-publish":true,"permalink":"/docs/csharp/oop/quick-reference/","tags":["basics","csharp","summary"]}
---

# C# Quick Reference

A summary of common C# concepts and syntax.

## Data Types

### Whole Numbers
| Type | Range | Size |
|------|-------|------|
| `byte` | 0 to 255 | 8-bit |
| `short` | ±32,767 | 16-bit |
| `int` | ±2.1 billion | 32-bit |
| `long` | ±9.2 quintillion | 64-bit |

Use `int` for most cases, `long` for very large numbers.

### Default Values
| Type | Default |
|------|---------|
| `string` | `null` |
| `int` | `0` |
| `double` | `0.0` |
| `bool` | `false` |

## Variables

### Declaration and Initialization
```csharp
int count;           // Declaration
int count = 0;       // Declaration with initialization
var count = 0;       // Type inference
```

### Variable Lifetime
The lifetime of a variable is limited to the scope of the code block where it's declared.

```csharp
{
    int x = 10;  // x created
}                // x destroyed
```

## Arrays

### Declaration and Initialization
```csharp
int[] numbers = { 1, 2, 3 };
int[] numbers = new int[] { 1, 2, 3 };
int[] numbers = new int[3];  // Empty with size
```

### Accessing Elements
```csharp
numbers[2]           // Access index 2 (third element)
numbers.Length       // Get array length
```

### Check if Element Exists
```csharp
numbers.Contains(3)              // Returns true/false
Array.Exists(numbers, n => n == 3)
```

### Iterating
```csharp
// Using for loop
for (int i = 0; i < numbers.Length; i++)
{
    Console.WriteLine(numbers[i]);
}

// Using foreach
foreach (int n in numbers)
{
    Console.WriteLine(n);
}
```

## Operators

### Comparison Operators
| Operator | Meaning |
|----------|---------|
| `==` | Equal to |
| `!=` | Not equal to |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal |
| `<=` | Less than or equal |

### Logical Operators
| Operator | Meaning |
|----------|---------|
| `!` | NOT (negation) |
| `&&` | AND |
| `\|\|` | OR |
| `^` | XOR |

### Modulo Operator
```csharp
10 % 3  // Result: 1 (remainder of 10 ÷ 3)
```

### Exponentiation
```csharp
Math.Pow(5, 2)  // 5² = 25
```

## Conditional Statements

### Purpose
To group statements together and control their scope.

### if / else if / else
```csharp
if (x > 0)
{
    Console.WriteLine("Positive");
}
else if (x < 0)
{
    Console.WriteLine("Negative");
}
else
{
    Console.WriteLine("Zero");
}
```

### switch
```csharp
switch (dayOfWeek)
{
    case 1:
        dayName = "Monday";
        break;
    case 2:
        dayName = "Tuesday";
        break;
    default:
        dayName = "Unknown";
        break;
}
```

Valid switch expression types: `int`, `char`, `string`, `enum`, `bool`

### Ternary Operator
```csharp
string status = age >= 18 ? "Adult" : "Minor";
```

## Loops

### for Loop
Three components: initialization, condition, final expression (iterator)

```csharp
for (int i = 0; i < 10; i++)
{
    Console.WriteLine(i);
}

// Increment by 2
for (int count = 0; count < 10; count += 2)
// Or: count = count + 2
```

### foreach Loop
Iterates over each element in a collection without managing an index.

```csharp
foreach (string name in names)
{
    Console.WriteLine(name);
}
```

### do-while Loop
```csharp
int i = 0;
do
{
    Console.WriteLine(i);
    i++;
} while (i < 5);
```

### Loop Control
| Statement | Purpose |
|-----------|---------|
| `break` | Exit the loop entirely |
| `continue` | Skip to next iteration |

## Methods

### Definition
```csharp
returnType methodName(parameters)
{
    // body
}
```

### Example
```csharp
void DisplayFullName(string firstName, string lastName)
{
    Console.WriteLine("Full Name: " + firstName + " " + lastName);
}

int Add(int a, int b)
{
    return a + b;
}
```

### Return Type
- Specifies the data type of the value returned
- Use `void` if the method returns nothing
- Must return a value matching the declared type (compile error otherwise)

### Calling Methods
```csharp
PrintMessage();              // No parameters
Greet("Alice");             // With parameters
int sum = Add(5, 3);        // With return value
```

### Main Method
The entry point of a C# console application where program execution begins.

```csharp
static void Main()
{
    // Program starts here
}
```

## Strings

### Replace Substring
```csharp
string result = text.Replace("old", "new");
```

### Format with Placeholders
`{0}` denotes the position of an argument within the format method.

```csharp
Console.WriteLine("{0} is {1} years old", name, age);
String.Format("Hello, {0}!", name);
```

### String Interpolation
```csharp
Console.WriteLine($"{name} is {age} years old");
```

### Date Formatting (Month and Year)
```csharp
date.ToString("MM/yyyy");    // 05/2024
date.ToString("MMMM yyyy");  // May 2024
```

## Code Blocks

### Purpose
To group statements together and control their scope.

### Syntax
```csharp
{
    // Statements
}
```

## Exception Handling

### try-catch Statement
```csharp
try
{
    // Code that might throw
}
catch (Exception e)
{
    // Handle exception
}
```

### Throwing Exceptions
Pass the error message to the exception constructor:

```csharp
throw new Exception("Custom error message");
throw new ArgumentException("Invalid value");
```

### throw vs throw ex
| Syntax | Stack Trace |
|--------|-------------|
| `throw;` | Preserved (preferred) |
| `throw ex;` | Reset (avoid) |

### Custom Exceptions
```csharp
public class CustomException : Exception
{
    public CustomException(string message) : base(message) { }
}
```

### Exception in Catch Block
If thrown, it propagates up the call stack. The `finally` block still executes.

## Type Conversion

### Check if Conversion is Possible
```csharp
// TryParse for strings
if (int.TryParse(input, out int result))
{
    // Conversion succeeded
}

// is keyword for type checking
if (obj is string)
{
    // Can convert
}
```

## Namespaces

### Import a Namespace
```csharp
using System.Collections;
```

## Debugging in Visual Studio

### Inspect Variable Values
- **Hover/DataTips** - Mouse over variable
- **Locals window** - Shows all local variables
- **Watch window** - Track specific variables
- **QuickWatch** - Detailed inspection (Shift+F9)

### Step Commands
| Command | Shortcut | Behavior |
|---------|----------|----------|
| Step Over | F10 | Execute line, skip into methods |
| Step Into | F11 | Execute line, enter methods |
| Step Out | Shift+F11 | Run until method returns |

## C# Compiler

The primary job is to translate C# source code into **Intermediate Language (IL)**.

```
C# Source → IL Code → JIT → Native Machine Code
```

## Boolean Expressions

### Negation
```csharp
bool result = !true;  // false
```

### Example: !(true && false)
```
!(true && false) = !(false) = true
```

### Example: (5 > 3) && (4 < 2)
```
true && false = false
```
