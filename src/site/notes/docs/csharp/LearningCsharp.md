---
{"dg-publish":true,"permalink":"/docs/csharp/learning-csharp/","tags":["introduction","syntax","data-types"]}
---

# C# Learning Guide

## Introduction to C#
C# (pronounced "C sharp") is a modern, object-oriented programming language developed by Microsoft. It's part of the .NET framework and is widely used for building Windows applications, web services, games, and more.

## Basic Syntax
```csharp
using System;

namespace HelloWorld
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello, World!");
        }
    }
}
```

## Data Types
- **Value Types**: int, double, bool, char, struct
- **Reference Types**: string, object, class, interface, array
- **Nullable Types**: int?, double?

```csharp
int age = 25;
string name = "John";
bool isStudent = true;
double pi = 3.14159;
```

## Variables and Constants
```csharp
int x = 10; // Variable
const double PI = 3.14159; // Constant
```

## Control Structures

### If-Else
```csharp
if (condition)
{
    // code
}
else if (anotherCondition)
{
    // code
}
else
{
    // code
}
```

### Loops
```csharp
// For loop
for (int i = 0; i < 10; i++)
{
    Console.WriteLine(i);
}

// While loop
int j = 0;
while (j < 10)
{
    Console.WriteLine(j);
    j++;
}

// Foreach loop
int[] numbers = {1, 2, 3, 4, 5};
foreach (int num in numbers)
{
    Console.WriteLine(num);
}
```

## Classes and Objects
```csharp
public class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    public void Introduce()
    {
        Console.WriteLine($"Hi, I'm {Name} and I'm {Age} years old.");
    }
}

// Usage
Person person = new Person { Name = "Alice", Age = 30 };
person.Introduce();
```

## Inheritance
```csharp
public class Animal
{
    public virtual void MakeSound()
    {
        Console.WriteLine("Some sound");
    }
}

public class Dog : Animal
{
    public override void MakeSound()
    {
        Console.WriteLine("Woof!");
    }
}
```

## Interfaces
```csharp
public interface IShape
{
    double CalculateArea();
}

public class Circle : IShape
{
    public double Radius { get; set; }

    public double CalculateArea()
    {
        return Math.PI * Radius * Radius;
    }
}
```

## Generics
```csharp
public class GenericList<T>
{
    private List<T> items = new List<T>();

    public void Add(T item)
    {
        items.Add(item);
    }

    public T Get(int index)
    {
        return items[index];
    }
}

// Usage
GenericList<string> stringList = new GenericList<string>();
stringList.Add("Hello");
```

## LINQ (Language Integrated Query)
```csharp
int[] numbers = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

var evenNumbers = from num in numbers
                  where num % 2 == 0
                  select num;

// Or using method syntax
var oddNumbers = numbers.Where(n => n % 2 != 0);
```

## Exception Handling
```csharp
try
{
    int result = 10 / 0;
}
catch (DivideByZeroException ex)
{
    Console.WriteLine("Cannot divide by zero: " + ex.Message);
}
finally
{
    Console.WriteLine("This always executes");
}
```

## Asynchronous Programming
```csharp
public async Task<string> GetDataAsync()
{
    await Task.Delay(1000); // Simulate async operation
    return "Data retrieved";
}

// Usage
string data = await GetDataAsync();
```

## Properties and Indexers
```csharp
public class Book
{
    private string title;

    public string Title
    {
        get { return title; }
        set { title = value; }
    }

    // Auto-implemented property
    public string Author { get; set; }

    // Indexer
    private string[] pages = new string[100];

    public string this[int index]
    {
        get { return pages[index]; }
        set { pages[index] = value; }
    }
}
```

## Delegates and Events
```csharp
public delegate void Notify(string message);

public class Publisher
{
    public event Notify OnNotify;

    public void SendNotification(string msg)
    {
        OnNotify?.Invoke(msg);
    }
}
```

## File I/O
```csharp
// Writing to a file
using (StreamWriter writer = new StreamWriter("example.txt"))
{
    writer.WriteLine("Hello, File!");
}

// Reading from a file
using (StreamReader reader = new StreamReader("example.txt"))
{
    string content = reader.ReadToEnd();
    Console.WriteLine(content);
}
```

## Collections
```csharp
// List
List<string> names = new List<string> { "Alice", "Bob", "Charlie" };

// Dictionary
Dictionary<int, string> students = new Dictionary<int, string>();
students.Add(1, "John");
students.Add(2, "Jane");

// Queue and Stack
Queue<string> queue = new Queue<string>();
Stack<int> stack = new Stack<int>();
```

## Namespaces and Using Directives
```csharp
using System;
using System.Collections.Generic;

namespace MyNamespace
{
    class MyClass
    {
        // Code here
    }
}
```

## Best Practices
1. Use meaningful variable and method names
2. Follow C# naming conventions (PascalCase for classes, camelCase for variables)
3. Use properties instead of public fields
4. Implement proper exception handling
5. Use async/await for I/O operations
6. Avoid deep inheritance hierarchies
7. Use interfaces for abstraction

## Resources for Further Learning
- Official Microsoft C# documentation
- Books: "C# in a Nutshell", "Pro C#"
- Online platforms: Pluralsight, Udemy, Coursera
- Practice on LeetCode or HackerRank

## Common Pitfalls
- Forgetting to initialize variables
- Not handling null references properly
- Confusing value types and reference types
- Blocking the UI thread with synchronous operations
- Not disposing of unmanaged resources