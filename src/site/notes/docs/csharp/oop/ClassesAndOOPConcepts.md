---
{"dg-publish":true,"permalink":"/docs/csharp/oop/classes-and-oop-concepts/","tags":["oop","csharp","classes","encapsulation","inheritance","polymorphism","abstraction"]}
---

# Classes and OOP Concepts in C#

## Type Keywords: class, struct, record

### class

A **class** is a blueprint for creating objects. Think of it like a cookie cutter — the class defines the shape, and each cookie (object) is made from that shape. Classes hold data (fields/properties) and behavior (methods).

```csharp
class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    public void SayHello()
    {
        Console.WriteLine($"Hello, I'm {Name}");
    }
}

// Creating an object (instance)
Person person = new Person();
person.Name = "Alice";
person.SayHello();  // "Hello, I'm Alice"
```

**Key points:**
- Reference type (stored on heap)
- Supports inheritance
- Can be null
- Passed by reference

### struct

A **struct** is a lightweight container for small, simple data. Think of it like a sticky note — good for quick, simple information that you copy around rather than share.

```csharp
struct Point
{
    public int X { get; set; }
    public int Y { get; set; }

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }
}

Point p1 = new Point(10, 20);
Point p2 = p1;  // Creates a copy
p2.X = 100;     // p1.X is still 10
```

**Key points:**
- Value type (stored on stack)
- Cannot inherit from other structs
- Cannot be null (unless nullable)
- Passed by value (copied)
- Best for small, immutable data

### record

A **record** is a special class designed for holding data. Think of it like a form — it's meant to represent data and makes it easy to compare, copy, and display.

```csharp
// Record declaration (concise syntax)
record Person(string Name, int Age);

// Using the record
Person p1 = new Person("Alice", 30);
Person p2 = new Person("Alice", 30);

Console.WriteLine(p1 == p2);  // true (compares values, not references)
Console.WriteLine(p1);        // "Person { Name = Alice, Age = 30 }"

// Create a copy with one property changed
Person p3 = p1 with { Age = 31 };
```

**Key points:**
- Immutable by default
- Built-in value equality
- Easy `ToString()` output
- `with` expression for copying
- Great for DTOs and data models

### Comparison

| Feature | class | struct | record |
|---------|-------|--------|--------|
| Type | Reference | Value | Reference |
| Equality | Reference | Value | Value |
| Inheritance | Yes | No | Yes |
| Mutability | Mutable | Mutable | Immutable |
| Best for | Complex objects | Small data | Data transfer |

---

## OOP Concepts

### Encapsulation

**Encapsulation** is hiding the internal details of an object and exposing only what's necessary. Think of a car — you use the steering wheel and pedals, but you don't need to see the engine. It protects data from being changed in unexpected ways.

```csharp
class BankAccount
{
    private decimal balance;  // Hidden from outside

    public decimal Balance    // Controlled access
    {
        get { return balance; }
    }

    public void Deposit(decimal amount)
    {
        if (amount > 0)
            balance += amount;
    }

    public void Withdraw(decimal amount)
    {
        if (amount > 0 && amount <= balance)
            balance -= amount;
    }
}

// Usage
BankAccount account = new BankAccount();
account.Deposit(100);
// account.balance = -500;  // Error: can't access private field
```

**Benefits:**
- Protects data integrity
- Hides complexity
- Easier to change internal implementation

### Inheritance

**Inheritance** allows a class to reuse code from another class. Think of it like family traits — a child inherits characteristics from a parent but can also have their own unique features.

```csharp
// Base class (parent)
class Animal
{
    public string Name { get; set; }

    public void Eat()
    {
        Console.WriteLine($"{Name} is eating");
    }
}

// Derived class (child)
class Dog : Animal
{
    public void Bark()
    {
        Console.WriteLine($"{Name} says Woof!");
    }
}

// Usage
Dog dog = new Dog();
dog.Name = "Buddy";
dog.Eat();   // Inherited from Animal
dog.Bark();  // Unique to Dog
```

**Key terms:**
- `base class` / `parent class` — the class being inherited from
- `derived class` / `child class` — the class that inherits
- `:` — used to inherit from a class

### Abstraction

**Abstraction** means showing only essential features and hiding the details. Think of a TV remote — you press "power" without knowing how the signal works. You define *what* something does, not *how* it does it.

```csharp
// Abstract class — cannot be instantiated directly
abstract class Shape
{
    public abstract double GetArea();  // No implementation

    public void Display()  // Can have regular methods too
    {
        Console.WriteLine($"Area: {GetArea()}");
    }
}

class Circle : Shape
{
    public double Radius { get; set; }

    public override double GetArea()  // Must implement
    {
        return Math.PI * Radius * Radius;
    }
}

class Rectangle : Shape
{
    public double Width { get; set; }
    public double Height { get; set; }

    public override double GetArea()
    {
        return Width * Height;
    }
}

// Usage
Shape circle = new Circle { Radius = 5 };
circle.Display();  // "Area: 78.54..."
```

**Key points:**
- `abstract class` — cannot create instances directly
- `abstract method` — no body, must be overridden
- Forces derived classes to implement specific behavior

### Polymorphism

**Polymorphism** means "many forms" — the same method can behave differently depending on the object. Think of the word "open" — you can open a door, open a book, or open an app. Same word, different actions.

```csharp
class Animal
{
    public virtual void Speak()
    {
        Console.WriteLine("Some sound");
    }
}

class Dog : Animal
{
    public override void Speak()
    {
        Console.WriteLine("Woof!");
    }
}

class Cat : Animal
{
    public override void Speak()
    {
        Console.WriteLine("Meow!");
    }
}

// Polymorphism in action
Animal[] animals = { new Dog(), new Cat(), new Animal() };

foreach (Animal animal in animals)
{
    animal.Speak();
}
// Output:
// Woof!
// Meow!
// Some sound
```

**Key terms:**
- `virtual` — allows a method to be overridden
- `override` — replaces the base class implementation

### Aggregation

**Aggregation** is a "has-a" relationship where one object contains another, but they can exist independently. Think of a classroom and students — a classroom has students, but students can exist without the classroom.

```csharp
class Engine
{
    public void Start() => Console.WriteLine("Engine started");
}

class Car
{
    private Engine engine;  // Car "has-a" Engine

    public Car(Engine engine)
    {
        this.engine = engine;  // Engine passed in, exists independently
    }

    public void StartCar()
    {
        engine.Start();
        Console.WriteLine("Car is running");
    }
}

// Usage
Engine myEngine = new Engine();  // Engine exists on its own
Car myCar = new Car(myEngine);   // Car uses the engine
myCar.StartCar();
```

**Aggregation vs Composition:**
| Relationship | Lifetime | Example |
|--------------|----------|---------|
| Aggregation | Independent | Car has a Driver |
| Composition | Dependent | House has Rooms (rooms can't exist without house) |

---

## Access Modifiers

Access modifiers control who can see and use your code. Think of them like doors with different locks.

### public

**Open to everyone** — accessible from anywhere.

```csharp
public class PublicClass
{
    public string Name { get; set; }  // Anyone can access
}
```

### private

**Hidden inside** — only accessible within the same class.

```csharp
class MyClass
{
    private int secretNumber = 42;  // Only this class can see it

    public int GetSecret()
    {
        return secretNumber;  // Accessed internally
    }
}
```

### internal

**Visible within the project** — accessible only within the same assembly (project).

```csharp
internal class InternalClass
{
    internal void DoSomething() { }
}
// Can be used anywhere in the same project
// Cannot be accessed from other projects
```

### protected

**Visible to family** — accessible within the class and its derived classes.

```csharp
class Parent
{
    protected string familySecret = "inherited";
}

class Child : Parent
{
    public void ShowSecret()
    {
        Console.WriteLine(familySecret);  // Can access parent's protected member
    }
}
```

### file (C# 11+)

**Visible only in this file** — accessible only within the same source file.

```csharp
file class FileOnlyClass
{
    public void DoSomething() { }
}
// Can only be used in this .cs file
// Great for helper classes that shouldn't be exposed
```

### Summary Table

| Modifier | Same Class | Derived Class | Same Project | Other Projects |
|----------|------------|---------------|--------------|----------------|
| `public` | Yes | Yes | Yes | Yes |
| `private` | Yes | No | No | No |
| `protected` | Yes | Yes | No | No |
| `internal` | Yes | Yes | Yes | No |
| `protected internal` | Yes | Yes | Yes | Derived only |
| `private protected` | Yes | Derived in same project | No | No |
| `file` | Same file only | | | |

### Default Access Levels

| Member | Default |
|--------|---------|
| Class members | `private` |
| Top-level class | `internal` |
| Interface members | `public` |
| Struct members | `private` |
