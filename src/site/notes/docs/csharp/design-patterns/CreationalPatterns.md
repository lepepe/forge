---
{"dg-publish":true,"permalink":"/docs/csharp/design-patterns/creational-patterns/","tags":["csharp","design-patterns","creational","oop","gof"]}
---

# Creational Design Patterns

Creational patterns deal with **object creation mechanisms** -- ways to create objects while hiding the creation logic, so the code isn't tightly coupled to specific concrete classes.

## Factory Method

Defines an interface for creating an object, but lets subclasses decide which concrete class to instantiate.

**Analogy:** A logistics company plans a delivery without caring whether it goes by truck or ship -- the specific "factory" decides.

```csharp
public interface ITransport
{
    string Deliver();
}

public class Truck : ITransport
{
    public string Deliver() => "Delivering by land in a truck";
}

public class Ship : ITransport
{
    public string Deliver() => "Delivering by sea in a ship";
}

public abstract class Logistics
{
    // The factory method - subclasses decide what gets created
    public abstract ITransport CreateTransport();

    public string PlanDelivery() => CreateTransport().Deliver();
}

public class RoadLogistics : Logistics
{
    public override ITransport CreateTransport() => new Truck();
}

public class SeaLogistics : Logistics
{
    public override ITransport CreateTransport() => new Ship();
}

// Usage
Logistics logistics = new SeaLogistics();
Console.WriteLine(logistics.PlanDelivery()); // "Delivering by sea in a ship"
```

**Key points:**
- Callers depend on the abstract `ITransport`/`Logistics`, never on `Truck` or `Ship` directly
- Adding a new transport type means adding a new class, not editing existing code (Open/Closed Principle)

---

## Abstract Factory

Produces **families of related objects** without specifying their concrete classes, guaranteeing the products in a family are compatible with each other.

**Analogy:** A furniture factory that makes matching sets -- a Victorian chair always pairs with a Victorian sofa, never with a Modern one.

```csharp
public interface IButton { string Render(); }
public interface ICheckbox { string Render(); }

public class WindowsButton : IButton { public string Render() => "Windows-style button"; }
public class WindowsCheckbox : ICheckbox { public string Render() => "Windows-style checkbox"; }

public class MacButton : IButton { public string Render() => "Mac-style button"; }
public class MacCheckbox : ICheckbox { public string Render() => "Mac-style checkbox"; }

public interface IUiFactory
{
    IButton CreateButton();
    ICheckbox CreateCheckbox();
}

public class WindowsUiFactory : IUiFactory
{
    public IButton CreateButton() => new WindowsButton();
    public ICheckbox CreateCheckbox() => new WindowsCheckbox();
}

public class MacUiFactory : IUiFactory
{
    public IButton CreateButton() => new MacButton();
    public ICheckbox CreateCheckbox() => new MacCheckbox();
}

// Usage - swap the entire UI family by swapping one factory
IUiFactory factory = new MacUiFactory();
IButton button = factory.CreateButton();
ICheckbox checkbox = factory.CreateCheckbox();
```

**Key points:**
- One level up from Factory Method: a factory that creates *multiple related products*
- Prevents accidentally mixing incompatible objects (e.g. a `WindowsButton` with a `MacCheckbox`)

---

## Builder

Constructs a complex object **step by step**, so the same construction process can produce different representations.

**Analogy:** Ordering a custom pizza -- you add toppings one at a time instead of calling one giant constructor with ten optional parameters.

```csharp
public class Pizza
{
    public string Size { get; set; } = "";
    public bool Cheese { get; set; }
    public bool Pepperoni { get; set; }
    public bool ExtraSauce { get; set; }

    public override string ToString() =>
        $"{Size} pizza | Cheese: {Cheese} | Pepperoni: {Pepperoni} | Extra sauce: {ExtraSauce}";
}

public class PizzaBuilder
{
    private readonly Pizza _pizza = new();

    public PizzaBuilder SetSize(string size) { _pizza.Size = size; return this; }
    public PizzaBuilder AddCheese() { _pizza.Cheese = true; return this; }
    public PizzaBuilder AddPepperoni() { _pizza.Pepperoni = true; return this; }
    public PizzaBuilder AddExtraSauce() { _pizza.ExtraSauce = true; return this; }

    public Pizza Build() => _pizza;
}

// Usage - fluent and readable, no giant constructor
Pizza pizza = new PizzaBuilder()
    .SetSize("Large")
    .AddCheese()
    .AddPepperoni()
    .Build();
```

**Key points:**
- Chaining methods that `return this` is called a **fluent interface**
- For simple objects, C# object initializers (`new Pizza { Size = "Large" }`) already cover this -- reach for Builder when construction involves validation, ordering, or optional complex steps

---

## Prototype

Creates new objects by **copying (cloning) an existing instance** instead of building one from scratch.

**Analogy:** Cloning a filled-out form instead of re-typing every field from a blank one.

```csharp
public class Enemy
{
    public string Type { get; set; } = "";
    public int Health { get; set; }
    public List<string> Abilities { get; set; } = new();

    public Enemy Clone()
    {
        // Deep copy - a new List instance, not a shared reference
        return new Enemy
        {
            Type = Type,
            Health = Health,
            Abilities = new List<string>(Abilities)
        };
    }
}

// Usage
var orcTemplate = new Enemy { Type = "Orc", Health = 100, Abilities = { "Smash" } };
Enemy orc2 = orcTemplate.Clone();
orc2.Health = 80; // orcTemplate is unaffected
```

**Key points:**
- Watch the difference between a **shallow copy** (copies references -- mutating a shared list affects both objects) and a **deep copy** (copies the data itself)
- Useful when creating an object from scratch is expensive (loaded from a DB, network, or heavy computation) but a similar instance already exists

---

## Singleton

Ensures a class has **only one instance** and provides a global access point to it.

**Analogy:** A company has exactly one CEO -- everyone who asks for "the CEO" gets referred to the same person.

```csharp
public sealed class AppLogger
{
    private static readonly Lazy<AppLogger> _instance = new(() => new AppLogger());

    public static AppLogger Instance => _instance.Value;

    private AppLogger() { } // Private constructor - nobody else can `new` this up

    public void Log(string message) => Console.WriteLine($"[LOG] {message}");
}

// Usage
AppLogger.Instance.Log("Application started");
```

**Key points:**
- `Lazy<T>` gives thread-safe, lazy initialization without manual locking
- The private constructor blocks `new AppLogger()` from outside the class
- In ASP.NET Core apps, prefer registering a service as `AddSingleton<T>` in the DI container instead of hand-rolling this pattern -- see [[docs/csharp/oop/InterfacesConstructorsDi\|Service Lifetimes]]
- **Caution:** Singletons introduce global state, which can hurt testability if overused -- reach for DI-managed lifetimes first

---

## TL;DR

| Pattern | One-Liner |
|---|---|
| Factory Method | Subclass decides which concrete class to instantiate |
| Abstract Factory | Factory that produces a whole family of related objects |
| Builder | Construct a complex object step by step |
| Prototype | Clone an existing object instead of rebuilding it |
| Singleton | Only one instance, globally accessible |

---

## Related Topics

- [[docs/csharp/design-patterns/DesignPatterns\|Design Patterns Overview]]
- [[docs/csharp/design-patterns/StructuralPatterns\|Structural Patterns]]
- [[docs/csharp/design-patterns/BehavioralPatterns\|Behavioral Patterns]]
