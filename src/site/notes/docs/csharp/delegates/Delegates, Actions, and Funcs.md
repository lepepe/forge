---
{"dg-publish":true,"permalink":"/docs/csharp/delegates/delegates-actions-and-funcs/","tags":["csharp","delegates","functions","dotnet"]}
---

# Delegates, Actions, and Funcs in C#

## Overview

A **delegate** is a type that holds a reference to a method — think of it as a variable, but instead of pointing to a piece of data, it points to *behavior* you can invoke later. This is what makes it possible to pass a method around like any other value: store it in a variable, pass it as a parameter, or return it from another method.

You've likely already used delegates without naming them — every lambda you've written for LINQ (see [[docs/csharp/collections/LINQ\|LINQ]]) is being assigned to a delegate behind the scenes.

---

## Custom Delegates

Declaring a delegate defines a *signature* — the parameter types and return type a method must match to be assignable to it.

```csharp
// Declares a delegate type: any method taking a string and returning void fits
public delegate void NotifyHandler(string message);

public class Logger
{
    // A method matching the delegate's signature
    public static void LogToConsole(string message) => Console.WriteLine($"LOG: {message}");
}

// Usage
NotifyHandler notify = Logger.LogToConsole;
notify("Something happened"); // Invokes LogToConsole through the delegate
```

Once `notify` holds a reference to `LogToConsole`, calling `notify(...)` is exactly the same as calling `Logger.LogToConsole(...)` directly — the delegate is just an indirection layer.

In practice, you'll rarely declare your own delegate type like `NotifyHandler` above — .NET ships two generic delegate types, `Action` and `Func`, that cover almost every case.

---

## Action

`Action` represents a method that returns **nothing** (`void`). Generic overloads exist for zero up to sixteen parameters.

```csharp
Action sayHello = () => Console.WriteLine("Hello!");
sayHello();

Action<string> greet = name => Console.WriteLine($"Hello, {name}!");
greet("Alice");

Action<string, int> introduce = (name, age) => Console.WriteLine($"{name} is {age}");
introduce("Bob", 30);
```

Read `Action<string, int>` as "a method that takes a `string` and an `int`, and returns nothing" — the type parameters are always the *input* parameters, in order.

## Func

`Func` represents a method that **returns a value**. The last type parameter is always the return type; everything before it is an input parameter.

```csharp
Func<int> getRandomNumber = () => new Random().Next();
int n = getRandomNumber();

Func<int, int> square = x => x * x;
int result = square(5); // 25

Func<int, int, int> add = (a, b) => a + b;
int sum = add(3, 4); // 7
```

`Func<int, int, int>` reads as "takes two `int`s, returns an `int`" — two inputs, then the return type as the final parameter.

## Predicate

`Predicate<T>` is a specialized shorthand for a `Func` that always returns `bool` — used for pass/fail checks like the ones you pass to LINQ's `.Where()` or `.Any()`.

```csharp
Predicate<int> isEven = x => x % 2 == 0;
bool result = isEven(4); // true

// Equivalent using Func:
Func<int, bool> isEvenFunc = x => x % 2 == 0;
```

You'll see `Predicate<T>` in a handful of older APIs (like `List<T>.Find`), but `Func<T, bool>` is the more common choice in modern code and in LINQ itself.

---

## Action vs Func at a Glance

| Delegate | Returns | Example |
|---|---|---|
| `Action` | Nothing (`void`) | `Action<Order> printOrder = o => Console.WriteLine(o.Id);` |
| `Func` | A value (last type parameter) | `Func<Order, decimal> getCost = o => o.Cost;` |
| `Predicate<T>` | `bool` (specialized `Func<T, bool>`) | `Predicate<Order> isShipped = o => o.Status == "Shipped";` |

---

## Passing Behavior as a Parameter

The real payoff of `Action`/`Func` is writing a method that accepts *behavior* as an argument, instead of hardcoding what happens:

```csharp
public void ProcessOrders(List<Order> orders, Action<Order> onEachOrder)
{
    foreach (var order in orders)
    {
        onEachOrder(order); // The caller decides what happens here
    }
}

// Usage - the caller supplies the behavior
ProcessOrders(orders, order => Console.WriteLine($"Processing {order.Id}"));
ProcessOrders(orders, order => SendConfirmationEmail(order));
```

This is the same mechanism that powers LINQ: `.Where(Func<T, bool> predicate)`, `.Select(Func<T, TResult> selector)`, and every other LINQ method all just accept a delegate you supply.

---

## Multicast Delegates

Delegates can point to **more than one method at once** — invoking the delegate calls every attached method, in the order they were added. Use `+=` to attach and `-=` to detach.

```csharp
Action<string> notify = Logger.LogToConsole;
notify += Logger.LogToFile; // Now points to both methods

notify("Order placed"); // Calls LogToConsole AND LogToFile, in that order

notify -= Logger.LogToFile; // Back to just LogToConsole
```

> **Note:** if a multicast `Func` (not `Action`) has multiple targets, invoking it still only returns the *last* method's result — the earlier calls still run, but their return values are discarded. This is one reason `Func` is rarely used as a multicast delegate in practice, while `Action` commonly is (notification-style code, where you don't care about a return value).

This chaining mechanism is also exactly what powers C#'s `event` keyword — see [[docs/csharp/design-patterns/Behavioral Patterns#Observer\|the Observer pattern]] for how `event Action<T>` is used to let multiple subscribers react to the same notification.

---

## Delegates vs Interfaces

Both let you write code against an abstraction instead of a concrete implementation — see [[docs/csharp/oop/Interfaces, Constructors, and Dependency Injection\|Interfaces, Constructors, and Dependency Injection]] for the interface side of this. Rule of thumb:

| Use a delegate (`Action`/`Func`) when... | Use an interface when... |
|---|---|
| You need a single piece of behavior (one method) | You need multiple related methods grouped as one contract |
| The behavior is likely to be a short lambda | The implementation needs its own state/fields |
| You want the caller to supply logic inline | You want swappable, named implementations (e.g. `GmailSender` vs `OutlookSender`) |

---

## Key Takeaways

1. A delegate is a type-safe reference to a method — it lets you treat behavior as a value you can store, pass around, and invoke later
2. `Action<...>` is for methods that return nothing; `Func<..., TResult>` is for methods that return a value (always the last type parameter)
3. `Predicate<T>` is just a named shorthand for `Func<T, bool>`
4. Passing an `Action`/`Func` as a parameter lets a method's *behavior* be supplied by the caller — this is the mechanism every LINQ method is built on
5. Delegates are multicast: `+=`/`-=` attach and detach multiple methods, and this is the foundation of the `event` keyword

---

## Related Topics

- [[docs/csharp/collections/LINQ\|LINQ]]
- [[docs/csharp/oop/Functions and Programming Styles\|Functions and Programming Styles]]
- [[docs/csharp/generics/Generics\|Generics]]
- [[docs/csharp/design-patterns/Behavioral Patterns\|Behavioral Patterns]]
- [[docs/csharp/oop/Interfaces, Constructors, and Dependency Injection\|Interfaces, Constructors, and Dependency Injection]]
- [[docs/csharp/Learning Guide\|C# Learning Guide]]

---

## Source

- [Microsoft Learn: Delegates](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/)
- [Microsoft Learn: Action Delegate](https://learn.microsoft.com/en-us/dotnet/api/system.action)
- [Microsoft Learn: Func Delegate](https://learn.microsoft.com/en-us/dotnet/api/system.func-1)

---

#csharp #programming #delegates #functions #dotnet
