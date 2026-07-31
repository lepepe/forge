---
{"dg-publish":true,"permalink":"/docs/csharp/generics/generics/","tags":["csharp","generics","types","collections","dotnet"]}
---

# Generics in C#

## Overview

A **generic** is a "fill-in-the-blank" for a type. Instead of writing a method or class that only works with `int`, or only with `string`, you write it once using a placeholder (usually named `T`), and let the caller decide what real type fills that blank.

You've already been using generics without realizing it -- `List<T>`, `Dictionary<TKey, TValue>`, and `IEnumerable<T>` are all generic types built into .NET.

---

## The Problem Generics Solve

Imagine writing a method that returns the first item of a list, without generics. You'd need a separate copy for every type:

```csharp
public string GetFirst(List<string> items)
{
    return items[0];
}

public int GetFirst(List<int> items)
{
    return items[0];
}

public Order GetFirst(List<Order> items)
{
    return items[0];
}
// ...and so on, forever, for every type you want to support
```

Generics let you write it **once**, treating the type itself as a parameter:

```csharp
public T GetFirst<T>(List<T> items)
{
    return items[0];
}
```

This is basically what LINQ's `.First()` does under the hood. One method now works with `List<string>`, `List<int>`, `List<Order>` -- anything.

---

## Anatomy of a Generic Method

Breaking down `public T GetFirst<T>(List<T> items)`:

| Part | Meaning |
|---|---|
| `<T>` after the method name | **Declares** the type parameter. "This method introduces a placeholder type called `T`." |
| `T` as the return type | **Uses** `T` -- the method returns whatever type is in the list |
| `List<T>` as the parameter | **Uses** `T` again -- links the list's element type to the same `T` |

**The rule:** declare the type parameter once in `<T>`, then use it anywhere in the signature or body.

You don't have to use `T` everywhere -- the return type and parameter types are independent choices:

```csharp
// T is used for the parameter AND the return type (same type both places)
public T GetFirst<T>(List<T> items) => items[0];

// T is only used for the parameter - the return type is always int
public int GetCount<T>(List<T> items) => items.Count;

// T is only used for the return type - the parameter is always a string
public T Deserialize<T>(string json) => JsonSerializer.Deserialize<T>(json);
```

When the return type and parameter need to be *different* generic types, declare more than one:

```csharp
// TKey and TValue are two separate type parameters
public TValue GetValueAt<TKey, TValue>(TKey key, IDictionary<TKey, TValue> dictionary)
{
    return dictionary[key];
}
```

> **Note:** `T` is a naming convention, not a rule. With a single type parameter, `T` is standard. With multiple, use descriptive names like `TKey`, `TValue`, `TRequest`, `TResponse` -- exactly like `Dictionary<TKey, TValue>` does.

---

## Calling a Generic Method

You fill in `T` with a real type when calling:

```csharp
string firstName = GetFirst<string>(names);
int firstNumber = GetFirst<int>(numbers);
Order firstOrder = GetFirst<Order>(orders);
```

Most of the time, the compiler can figure out `T` on its own (**type inference**), so you can skip it:

```csharp
string firstName = GetFirst(names);   // Compiler infers T = string
int firstNumber = GetFirst(numbers);  // Compiler infers T = int
```

---

## Generic Classes

The same idea applies to classes. Here's a simple wrapper that holds a result value plus a success flag -- useful for wrapping the outcome of a database call, for example:

```csharp
public class Result<T>
{
    public T Value { get; set; }
    public bool Success { get; set; }
}
```

One class, works with any type:

```csharp
var orderResult = new Result<Order> { Value = myOrder, Success = true };
var countResult = new Result<int> { Value = 42, Success = true };
```

Once `<T>` is declared at the **class** level, methods inside the class can use `T` freely without redeclaring it:

```csharp
public class Box<T>
{
    private T _item;

    // No <T> needed here - it already knows T from the class
    public void Store(T item) => _item = item;

    public T Retrieve() => _item;
}
```

---

## Generic Constraints

Sometimes you need to tell the compiler "`T` must follow certain rules." For example, this fails to compile:

```csharp
public T BuildType<T>()
{
    // ERROR: Cannot create an instance of the type 'T'
    var instance = new T();
    return instance;
}
```

The compiler can't guarantee every possible `T` has a parameterless constructor. Add a **constraint** to fix it:

```csharp
public T BuildType<T>() where T : new()
{
    var instance = new T(); // Now allowed
    return instance;
}
```

```csharp
int number = BuildType<int>();       // OK - int has a default constructor
string text = BuildType<string>();   // ERROR - string has no parameterless constructor
```

Common constraints:

| Constraint | Meaning |
|---|---|
| `where T : struct` | `T` must be a non-nullable value type (`int`, `bool`, a custom `struct`, etc.) |
| `where T : class` | `T` must be a reference type (`string`, any class, interface, or array) |
| `where T : new()` | `T` must have a public parameterless constructor |
| `where T : BaseClass` | `T` must be, or derive from, `BaseClass` |
| `where T : IInterface` | `T` must implement `IInterface` |
| `where T : notnull` | `T` must be non-nullable |

You can combine multiple constraints on one type parameter:

```csharp
public T CreateAndValidate<T>() where T : class, IValidatable, new()
{
    var instance = new T();
    instance.Validate();
    return instance;
}
```

---

## Generic Interfaces

Interfaces can be generic too, letting you define a type-safe contract. `IComparable<T>` is a built-in example:

```csharp
public class Product : IComparable<Product>
{
    public string Name { get; set; }
    public decimal Price { get; set; }

    public int CompareTo(Product other) => Price.CompareTo(other.Price);
}
```

Some generic interfaces you'll run into constantly in .NET:

| Interface | Purpose |
|---|---|
| `IEnumerable<T>` | Represents a collection you can loop over |
| `IComparer<T>` | Defines a custom way to sort objects |
| `IEqualityComparer<T>` | Defines a custom way to compare objects for equality |

```csharp
public class ProductComparer : IComparer<Product>
{
    public int Compare(Product x, Product y) => x.Price.CompareTo(y.Price);
}

var products = new List<Product>
{
    new Product { Name = "Laptop", Price = 1200 },
    new Product { Name = "Tablet", Price = 600 }
};

products.Sort(new ProductComparer()); // Sorted cheapest to most expensive
```

---

## Covariance and Contravariance

These sound intimidating but boil down to: *when is it safe to treat `Generic<A>` as `Generic<B>`?*

- **Covariance** (`out`) -- lets you use a more *specific* type where a more *general* one is expected. Think: a basket of apples (`IEnumerable<Apple>`) can be handed to someone who just wants "some fruit" (`IEnumerable<Fruit>`).

  ```csharp
  IEnumerable<string> strings = new List<string>();
  IEnumerable<object> objects = strings; // OK - string is more specific than object
  ```

- **Contravariance** (`in`) -- lets you use a more *general* type where a more *specific* one is expected. Think: a handler built for "any fruit" (`Action<Fruit>`) can process apples just fine (`Action<Apple>`).

  ```csharp
  Action<object> handleObject = obj => Console.WriteLine(obj);
  Action<string> handleString = handleObject; // OK - handling "any object" covers strings too
  ```

> **Rule of thumb:** covariance is about *reading* data (getting things out), contravariance is about *writing/processing* data (passing things in).

---

## Generic Math (.NET 7+)

.NET 7 added interfaces like `INumber<T>` that let you write one method that works across every numeric type (`int`, `double`, `decimal`...) instead of overloading it repeatedly:

```csharp
static T Add<T>(T left, T right) where T : INumber<T>
{
    return left + right;
}

int intResult = Add(5, 10);          // Works with int
double doubleResult = Add(5.5, 10.2); // Works with double
```

---

## Where You'll See Generics Every Day

- **Collections** -- `List<T>`, `Dictionary<TKey, TValue>`, `IEnumerable<T>`
- **Dependency injection** -- `services.AddScoped<IOrderService, OrderService>()` pairs an interface with its implementation using generics
- **MediatR** -- `IRequest<OrderResponse>` tells MediatR "this request produces an `OrderResponse`"
- **Nullable value types** -- `int?` is shorthand for `Nullable<int>`

> **Tip:** you will *use* generics far more often than you'll *write* your own generic classes or methods. Focus first on being comfortable reading `<T>`-style code and understanding what it stands for in context.

---

## Key Takeaways

1. Generics let one method or class work with many types, instead of duplicating code per type
2. Declare the type parameter with `<T>`, then reuse `T` anywhere in that method/class
3. The compiler usually infers `T` automatically -- you rarely have to write `GetFirst<string>(...)`
4. Use **constraints** (`where T : ...`) when your generic code needs to assume something about `T` (like having a constructor, or implementing an interface)
5. `List<T>`, `Dictionary<TKey, TValue>`, and `IEnumerable<T>` are generics you already use daily
6. Covariance (`out`) is about safely reading a more specific type as a general one; contravariance (`in`) is about safely handling a general type as a specific one

---

## Related Topics

- [[docs/csharp/Learning Guide\|C# Learning Guide]]
- [[docs/csharp/oop/Classes and OOP Concepts\|Classes and OOP Concepts]]
- [[docs/csharp/oop/Interfaces, Constructors, and Dependency Injection\|Interfaces, Constructors, and Dependency Injection]]
- [[docs/csharp/generics/Anonymous Types and Tuples\|Anonymous Types and Tuples]]

---

## Source

- [Microsoft Learn: Get started with generic and anonymous types](https://learn.microsoft.com/en-us/training/modules/get-started-generic-anonymous-types/)
- [Microsoft Learn: Generic Type Parameters](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/generic-type-parameters)

---

#csharp #programming #generics #dotnet #types #fundamentals
