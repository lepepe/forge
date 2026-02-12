---
{"dg-publish":true,"permalink":"/docs/csharp/oop/interfaces-constructors-di/","tags":["csharp","programming","backend","oop"]}
---

# C# Interfaces, Constructors, and Dependency Injection

## Interfaces

Think of it as a **contract** or **promise**. An interface says "any class that uses me MUST have these methods."

```csharp
// The contract
public interface IEmailSender
{
    void SendEmail(string to, string message);
}

// Two different classes following the same contract
public class GmailSender : IEmailSender
{
    public void SendEmail(string to, string message)
    {
        // Send via Gmail
    }
}

public class OutlookSender : IEmailSender
{
    public void SendEmail(string to, string message)
    {
        // Send via Outlook
    }
}
```

**Why?** You can swap implementations without breaking your code. Your code just needs "something that can send email," not specifically Gmail or Outlook.

### A Class Can Implement Multiple Interfaces

Unlike inheritance (one parent only), a class can follow multiple contracts:

```csharp
public interface IEmailSender
{
    void SendEmail(string to, string message);
}

public interface ISmsSender
{
    void SendSms(string phone, string message);
}

// NotificationService follows BOTH contracts
public class NotificationService : IEmailSender, ISmsSender
{
    public void SendEmail(string to, string message)
    {
        // Email logic
    }

    public void SendSms(string phone, string message)
    {
        // SMS logic
    }
}
```

### Interfaces Can Define Properties Too

Interfaces aren't limited to methods:

```csharp
public interface IIdentifiable
{
    int Id { get; }
    string Name { get; set; }
}

public class Product : IIdentifiable
{
    public int Id { get; }
    public string Name { get; set; }

    public Product(int id, string name)
    {
        Id = id;
        Name = name;
    }
}
```

### Default Interface Methods (C# 8+)

Interfaces can provide a default implementation. Classes don't have to override it unless they want to:

```csharp
public interface ILogger
{
    void Log(string message);

    // Default implementation - classes get this for free
    void LogError(string message) => Log($"ERROR: {message}");
}
```

### Naming Convention

Interfaces in C# always start with `I` -- this is a strong convention, not a rule:

| Interface | Implementing Class |
|-----------|-------------------|
| `IEmailSender` | `GmailSender`, `OutlookSender` |
| `IRepository<T>` | `SqlRepository<T>`, `MongoRepository<T>` |
| `ILogger` | `FileLogger`, `ConsoleLogger` |

---

## Constructors

A special method that runs **when you create an object**. It sets up the object's initial state.

```csharp
public class User
{
    public string Name;
    public int Age;

    // Constructor - same name as the class, no return type
    public User(string name, int age)
    {
        Name = name;
        Age = age;
    }
}

// Using it
var user = new User("Lepepe", 30); // Constructor runs here
```

### Constructor Overloading

A class can have multiple constructors with different parameters:

```csharp
public class User
{
    public string Name { get; set; }
    public int Age { get; set; }
    public string Role { get; set; }

    // Full constructor
    public User(string name, int age, string role)
    {
        Name = name;
        Age = age;
        Role = role;
    }

    // Simpler constructor - defaults role to "User"
    public User(string name, int age) : this(name, age, "User") { }
}

var admin = new User("Lepepe", 30, "Admin");
var regular = new User("Guest", 25); // Role defaults to "User"
```

> **Note:** `: this(...)` chains to another constructor in the same class, avoiding code duplication.

### Primary Constructors (C# 12)

A shorthand that puts parameters right on the class declaration:

```csharp
// Before - verbose
public class User
{
    private readonly string _name;
    private readonly int _age;

    public User(string name, int age)
    {
        _name = name;
        _age = age;
    }
}

// After - primary constructor
public class User(string name, int age)
{
    public string Name => name;
    public int Age => age;
}
```

### `required` Properties (C# 11)

Force properties to be set at creation without needing a constructor:

```csharp
public class User
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public int Age { get; set; } // Optional
}

var user = new User { Name = "Lepepe", Email = "lepepe@mail.com" };
// var bad = new User { Name = "Lepepe" }; // Compile error - Email is required
```

---

## Dependency Injection (DI)

Instead of creating objects inside your class, you **pass them in from outside** (usually through the constructor).

### Without DI:

```csharp
public class OrderService
{
    private EmailSender _emailSender = new EmailSender(); // Hardcoded!
}
```

The problem: `OrderService` is glued to `EmailSender`. You can't swap it, mock it, or test it easily.

### With DI:

```csharp
public class OrderService
{
    private readonly IEmailSender _emailSender;

    public OrderService(IEmailSender emailSender) // Injected via constructor
    {
        _emailSender = emailSender;
    }

    public void PlaceOrder(Order order)
    {
        // Process order...
        _emailSender.SendEmail(order.CustomerEmail, "Order confirmed!");
    }
}
```

**Why?** Makes testing easier (you can inject a fake email sender), and you can swap implementations without changing `OrderService`.

### Registering Services in ASP.NET Core

In `Program.cs`, you tell the DI container which implementation to use for each interface:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Register services
builder.Services.AddScoped<IEmailSender, GmailSender>();
builder.Services.AddScoped<IOrderService, OrderService>();

var app = builder.Build();
```

Now when ASP.NET creates an `OrderService`, it automatically injects `GmailSender` as the `IEmailSender`. Want to switch to Outlook? Change one line:

```csharp
builder.Services.AddScoped<IEmailSender, OutlookSender>(); // That's it
```

### Service Lifetimes

How long does the DI container keep an instance alive?

| Method | Lifetime | When to Use |
|--------|----------|-------------|
| `AddTransient<I, T>()` | New instance every time | Lightweight, stateless services |
| `AddScoped<I, T>()` | One instance per HTTP request | Database contexts, request-specific data |
| `AddSingleton<I, T>()` | One instance for the app's lifetime | Caching, configuration, shared state |

```csharp
builder.Services.AddTransient<IEmailSender, GmailSender>();    // New each time
builder.Services.AddScoped<IOrderRepository, SqlRepository>();  // Per request
builder.Services.AddSingleton<ICacheService, MemoryCache>();    // Shared forever
```

> **Rule of thumb:** Start with `AddScoped` for most services. Use `AddTransient` for stateless utilities. Use `AddSingleton` only when you need a single shared instance.

### How It All Connects

```
Interface (contract) ──► Implementation (the actual code)
        │                         │
        ▼                         ▼
   IEmailSender              GmailSender
        │                         │
        └──── DI Container ───────┘
                   │
                   ▼
        OrderService gets IEmailSender
        injected automatically
```

1. **Define** the interface (`IEmailSender`)
2. **Implement** it (`GmailSender`, `OutlookSender`)
3. **Register** in DI container (`AddScoped<IEmailSender, GmailSender>()`)
4. **Inject** via constructor (`OrderService(IEmailSender sender)`)
5. **ASP.NET wires it all up** -- you never call `new` yourself

---

## TL;DR

| Concept | What It Is | One-Liner |
|---------|-----------|-----------|
| **Interface** | Contract/blueprint | "You MUST have these methods" |
| **Constructor** | Setup code when creating objects | Runs on `new MyClass(...)` |
| **Constructor Overloading** | Multiple constructors, different params | Flexible object creation |
| **Primary Constructor** | Shorthand on class declaration (C# 12) | Less boilerplate |
| **Dependency Injection** | Pass dependencies from outside | Don't `new` your own dependencies |
| **Service Lifetimes** | How long DI keeps instances | Transient / Scoped / Singleton |

---

## Related Topics

- [[docs/csharp/LearningCsharp\|C# Learning Guide]]

---

#csharp #programming #backend #oop
