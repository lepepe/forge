---
{"dg-publish":true,"permalink":"/docs/csharp/anonymous-types/","tags":["csharp","anonymous-types","tuples","linq","dotnet"]}
---

# Anonymous Types and Tuples in C#

## Overview

Sometimes you need to group a few values together **temporarily**, just within a method, without going through the trouble of defining a whole class for it. C# gives you two lightweight ways to do this: **anonymous types** and **tuples**.

---

## What Is an Anonymous Type?

An anonymous type is an object with read-only properties, created on the spot with `new { ... }` -- no class definition required. The compiler generates a type behind the scenes; you never see or name it yourself.

```csharp
var v = new { Amount = 108, Message = "Hello" };
Console.WriteLine($"{v.Amount} - {v.Message}"); // "108 - Hello"
```

```csharp
var product = new { Name = "Laptop", Price = 1200 };
Console.WriteLine($"Product: {product.Name}, Price: {product.Price}");
```

**Key points:**
- Always declared with `var`, since there's no type name to write
- Properties are **read-only** -- once created, you can't reassign `product.Price = 999`
- Can't contain methods, events, or `null` as a property initializer

---

## Anonymous Types in LINQ

This is where anonymous types shine -- picking out just the fields you need from a query result, without defining a DTO class for it:

```csharp
var products = new[]
{
    new { Name = "Laptop", Price = 1200 },
    new { Name = "Tablet", Price = 600 }
};

var expensive = from p in products
                 where p.Price > 1000
                 select new { p.Name, p.Price };

foreach (var product in expensive)
{
    Console.WriteLine($"Name: {product.Name}, Price: {product.Price}");
}
```

The same thing with method syntax:

```csharp
var expensive = products
    .Where(p => p.Price > 1000)
    .Select(p => new { p.Name, p.Price });
```

> **Note:** anonymous types are `internal` to the assembly they're created in -- you can't return one from a public API or pass it across project boundaries. They also can't be used as a method parameter or return type (since there's no name to write in the signature).

---

## What Is a Tuple?

A tuple groups multiple values into one lightweight, **value type** without any class at all. Unlike anonymous types, tuples support named elements *and* deconstruction.

```csharp
(string Name, decimal Price) product = ("Laptop", 1200);
Console.WriteLine($"{product.Name}: {product.Price}");
```

Tuples are especially handy for returning more than one value from a method:

```csharp
(string Name, int Age) GetPerson()
{
    return ("Alice", 30);
}

var person = GetPerson();
Console.WriteLine($"{person.Name} is {person.Age}");
```

### Deconstruction

Tuples can be unpacked directly into separate variables:

```csharp
var (name, age) = GetPerson();
Console.WriteLine($"{name} is {age}");
```

---

## Anonymous Types vs Tuples

| Feature | Anonymous Types | Tuples |
|---|---|---|
| Underlying kind | Reference type (`class`) | Value type (`struct`) |
| Custom member names | Supported | Supported |
| Deconstruction | Not supported | Supported |
| Mutability | Read-only | Mutable |
| Works in LINQ expression trees | Yes | No |
| Can cross assembly boundaries | No | Yes |

**Rule of thumb:** reach for **anonymous types** in LINQ projections and expression trees; reach for **tuples** when you need to return multiple values from a method or want deconstruction.

---

## Key Takeaways

1. Both anonymous types and tuples group related data without a full class definition
2. Anonymous types: `new { Name = "x", Price = 1 }`, read-only, declared with `var`, common in LINQ `select` projections
3. Tuples: `(string Name, int Age)`, support deconstruction, great for returning multiple values from a method
4. Neither is meant to leave the method/assembly it was created in -- for anything public or long-lived, define a real class or record
5. Avoid relying on the compiler-generated name behind an anonymous type -- it isn't stable across compilations

---

## Related Topics

- [[docs/csharp/Generics\|Generics in C#]]
- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- [[docs/csharp/oop/ClassesAndOOPConcepts\|Classes and OOP Concepts]]

---

## Source

- [Microsoft Learn: Get started with generic and anonymous types](https://learn.microsoft.com/en-us/training/modules/get-started-generic-anonymous-types/)

---

#csharp #programming #anonymous-types #tuples #linq #dotnet
