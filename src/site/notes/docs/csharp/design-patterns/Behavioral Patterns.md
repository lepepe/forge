---
{"dg-publish":true,"permalink":"/docs/csharp/design-patterns/behavioral-patterns/","tags":["csharp","design-patterns","behavioral","oop","gof"]}
---

# Behavioral Design Patterns

Behavioral patterns are about **how objects communicate and share responsibility** -- assigning behavior between objects while keeping them loosely coupled.

## Chain of Responsibility

Passes a request along a chain of handlers; each handler decides whether to process it or pass it to the next one.

**Analogy:** Tech support escalation -- Level 1 handles simple issues, escalates what it can't to Level 2, then Level 3.

```csharp
public abstract class SupportHandler
{
    protected SupportHandler? Next;

    public SupportHandler SetNext(SupportHandler next)
    {
        Next = next;
        return next;
    }

    public abstract void Handle(int severity);
}

public class Level1Support : SupportHandler
{
    public override void Handle(int severity)
    {
        if (severity <= 1) Console.WriteLine("Level 1: Resolved");
        else Next?.Handle(severity);
    }
}

public class Level2Support : SupportHandler
{
    public override void Handle(int severity)
    {
        if (severity <= 2) Console.WriteLine("Level 2: Resolved");
        else Next?.Handle(severity);
    }
}

public class Level3Support : SupportHandler
{
    public override void Handle(int severity) =>
        Console.WriteLine("Level 3: Resolved (or escalated to a human)");
}

// Usage
var level1 = new Level1Support();
level1.SetNext(new Level2Support()).SetNext(new Level3Support());
level1.Handle(2); // Passes through Level 1 -> handled at Level 2
```

---

## Command

Turns a request into a stand-alone object, so it can be queued, logged, parametrized, or undone.

**Analogy:** A restaurant order slip -- the waiter doesn't cook, they just carry the encapsulated request to the kitchen.

```csharp
public interface ICommand
{
    void Execute();
    void Undo();
}

public class Light
{
    public void On() => Console.WriteLine("Light is ON");
    public void Off() => Console.WriteLine("Light is OFF");
}

public class LightOnCommand : ICommand
{
    private readonly Light _light;
    public LightOnCommand(Light light) => _light = light;

    public void Execute() => _light.On();
    public void Undo() => _light.Off();
}

public class RemoteControl
{
    private readonly Stack<ICommand> _history = new();

    public void Press(ICommand command)
    {
        command.Execute();
        _history.Push(command);
    }

    public void PressUndo()
    {
        if (_history.Count > 0) _history.Pop().Undo();
    }
}

// Usage
var remote = new RemoteControl();
remote.Press(new LightOnCommand(new Light()));
remote.PressUndo(); // Undo works because the request is an object, not a direct call
```

---

## Iterator

Lets you traverse elements of a collection without exposing its internal structure. C# builds this in via `IEnumerable<T>` / `IEnumerator<T>` and `yield return`.

```csharp
public class BookShelf : IEnumerable<string>
{
    private readonly List<string> _books = new();

    public void Add(string book) => _books.Add(book);

    public IEnumerator<string> GetEnumerator()
    {
        foreach (var book in _books)
            yield return book; // Compiler generates the iterator for us
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

// Usage - foreach works because BookShelf implements IEnumerable<T>
var shelf = new BookShelf();
shelf.Add("Clean Code");
shelf.Add("The Pragmatic Programmer");

foreach (var book in shelf)
    Console.WriteLine(book);
```

> **Note:** this is the pattern behind every `foreach` loop you've already written -- `List<T>`, `Dictionary<K,V>`, and arrays are all Iterators under the hood.

---

## Mediator

Reduces chaotic many-to-many dependencies between objects by forcing them to communicate through a central mediator instead of directly.

**Analogy:** An air traffic control tower -- planes don't talk to each other directly, they all talk to the tower.

```csharp
public interface IChatMediator
{
    void SendMessage(string message, User sender);
}

public class ChatRoom : IChatMediator
{
    private readonly List<User> _users = new();

    public void Register(User user) => _users.Add(user);

    public void SendMessage(string message, User sender)
    {
        foreach (var user in _users.Where(u => u != sender))
            user.Receive(message);
    }
}

public class User
{
    private readonly string _name;
    private readonly IChatMediator _mediator;

    public User(string name, IChatMediator mediator)
    {
        _name = name;
        _mediator = mediator;
    }

    public void Send(string message) => _mediator.SendMessage($"{_name}: {message}", this);
    public void Receive(string message) => Console.WriteLine($"[Received] {message}");
}

// Usage - users never reference each other directly
var room = new ChatRoom();
var alice = new User("Alice", room);
var bob = new User("Bob", room);
room.Register(alice);
room.Register(bob);
alice.Send("Hi Bob!"); // Only Bob receives it, routed through the room
```

---

## Memento

Captures and externalizes an object's internal state so it can be restored later, without violating encapsulation.

**Analogy:** Ctrl+Z -- a text editor saves snapshots of your document so you can undo.

```csharp
public class Memento
{
    public string State { get; }
    public Memento(string state) => State = state;
}

public class TextEditor
{
    public string Content { get; set; } = "";

    public Memento Save() => new Memento(Content);
    public void Restore(Memento memento) => Content = memento.State;
}

public class History
{
    private readonly Stack<Memento> _snapshots = new();

    public void Push(Memento memento) => _snapshots.Push(memento);
    public Memento Pop() => _snapshots.Pop();
}

// Usage
var editor = new TextEditor();
var history = new History();

editor.Content = "Hello";
history.Push(editor.Save()); // Snapshot 1

editor.Content = "Hello, world!";
history.Push(editor.Save()); // Snapshot 2

editor.Content = "Oops, broke it";
editor.Restore(history.Pop()); // Back to "Hello, world!"
```

---

## Observer

Defines a subscription mechanism to notify multiple objects automatically about events happening in the object they observe.

**Analogy:** Subscribing to a YouTube channel -- subscribers get notified automatically whenever a new video drops.

```csharp
public interface IObserver
{
    void Update(decimal price);
}

public class Stock
{
    private readonly List<IObserver> _observers = new();
    private decimal _price;

    public void Subscribe(IObserver observer) => _observers.Add(observer);

    public decimal Price
    {
        get => _price;
        set
        {
            _price = value;
            foreach (var observer in _observers)
                observer.Update(_price); // Notify everyone
        }
    }
}

public class PriceDisplay : IObserver
{
    public void Update(decimal price) => Console.WriteLine($"New price: ${price}");
}

// Usage
var stock = new Stock();
stock.Subscribe(new PriceDisplay());
stock.Price = 150.25m; // "New price: $150.25" printed automatically
```

C# has this pattern built in as `event`:

```csharp
public class StockWithEvent
{
    public event Action<decimal>? PriceChanged;

    public void SetPrice(decimal price) => PriceChanged?.Invoke(price);
}

// Usage
var stock2 = new StockWithEvent();
stock2.PriceChanged += price => Console.WriteLine($"New price: ${price}");
stock2.SetPrice(99.99m);
```

---

## State

Lets an object change its behavior when its internal state changes -- it appears as if the object changed its class.

**Analogy:** A traffic light -- the same `Next()` call behaves differently depending on whether it's currently Red, Green, or Yellow.

```csharp
public interface IOrderState
{
    string Name { get; }
    void Next(OrderContext context);
}

public class PendingState : IOrderState
{
    public string Name => "Pending";
    public void Next(OrderContext context) => context.SetState(new ShippedState());
}

public class ShippedState : IOrderState
{
    public string Name => "Shipped";
    public void Next(OrderContext context) => context.SetState(new DeliveredState());
}

public class DeliveredState : IOrderState
{
    public string Name => "Delivered";
    public void Next(OrderContext context) => Console.WriteLine("Already delivered");
}

public class OrderContext
{
    private IOrderState _state = new PendingState();

    public void SetState(IOrderState state) => _state = state;
    public void Advance() => _state.Next(this);
    public string CurrentState => _state.Name;
}

// Usage
var order = new OrderContext();
Console.WriteLine(order.CurrentState); // "Pending"
order.Advance();
Console.WriteLine(order.CurrentState); // "Shipped"
```

---

## Strategy

Defines a family of interchangeable algorithms and lets the client select one at runtime.

**Analogy:** Choosing a route in a maps app -- Fastest, Shortest, Avoid Tolls -- same "navigate" goal, different algorithm.

```csharp
public interface IDiscountStrategy
{
    decimal Apply(decimal total);
}

public class NoDiscount : IDiscountStrategy
{
    public decimal Apply(decimal total) => total;
}

public class PercentageDiscount : IDiscountStrategy
{
    private readonly decimal _percent;
    public PercentageDiscount(decimal percent) => _percent = percent;
    public decimal Apply(decimal total) => total - (total * _percent / 100);
}

public class ShoppingCart
{
    private readonly IDiscountStrategy _discount;
    public ShoppingCart(IDiscountStrategy discount) => _discount = discount;

    public decimal Checkout(decimal total) => _discount.Apply(total);
}

// Usage - swap the algorithm without touching ShoppingCart
var cart = new ShoppingCart(new PercentageDiscount(10));
Console.WriteLine(cart.Checkout(100)); // 90
```

> **Note:** for small algorithms, a `Func<decimal, decimal>` delegate can replace the whole interface hierarchy -- Strategy is one of the patterns C# lambdas made lighter-weight.

---

## Template Method

Defines the skeleton of an algorithm in a base class, letting subclasses override specific steps without changing the overall structure.

**Analogy:** A recipe -- the steps (prep, cook, plate) are fixed, but each dish overrides *how* it cooks.

```csharp
public abstract class DataExporter
{
    // The template method - defines the fixed skeleton
    public void Export()
    {
        FetchData();
        FormatData();
        SaveData();
    }

    protected abstract void FetchData();
    protected abstract void FormatData();

    protected virtual void SaveData() => Console.WriteLine("Saved to default location"); // Optional override
}

public class CsvExporter : DataExporter
{
    protected override void FetchData() => Console.WriteLine("Fetching data for CSV");
    protected override void FormatData() => Console.WriteLine("Formatting as CSV");
}

public class JsonExporter : DataExporter
{
    protected override void FetchData() => Console.WriteLine("Fetching data for JSON");
    protected override void FormatData() => Console.WriteLine("Formatting as JSON");
    protected override void SaveData() => Console.WriteLine("Saved to cloud storage");
}

// Usage - same Export() sequence, different steps underneath
DataExporter exporter = new JsonExporter();
exporter.Export();
```

---

## Visitor

Separates an algorithm from the objects it operates on by moving the operation into a separate "visitor" object, so new operations can be added without modifying the classes themselves.

**Analogy:** An insurance auditor who visits different departments (Sales, IT, HR) -- each department knows how to "host" the auditor, but the audit logic lives with the auditor.

```csharp
public interface IShapeVisitor
{
    void Visit(Circle circle);
    void Visit(Square square);
}

public interface IShape
{
    void Accept(IShapeVisitor visitor);
}

public class Circle : IShape
{
    public double Radius { get; }
    public Circle(double radius) => Radius = radius;
    public void Accept(IShapeVisitor visitor) => visitor.Visit(this);
}

public class Square : IShape
{
    public double Side { get; }
    public Square(double side) => Side = side;
    public void Accept(IShapeVisitor visitor) => visitor.Visit(this);
}

// New operation added without touching Circle or Square
public class AreaVisitor : IShapeVisitor
{
    public void Visit(Circle circle) =>
        Console.WriteLine($"Circle area: {Math.PI * circle.Radius * circle.Radius:F2}");

    public void Visit(Square square) =>
        Console.WriteLine($"Square area: {square.Side * square.Side}");
}

// Usage
List<IShape> shapes = new() { new Circle(3), new Square(4) };
var areaVisitor = new AreaVisitor();
foreach (var shape in shapes)
    shape.Accept(areaVisitor);
```

---

## TL;DR

| Pattern | One-Liner |
|---|---|
| Chain of Responsibility | Passes a request along a chain until someone handles it |
| Command | Wraps a request as an object (queue it, log it, undo it) |
| Iterator | Traverses a collection without exposing its internals |
| Mediator | Routes communication through a central hub instead of peer-to-peer |
| Memento | Saves/restores an object's state (undo) |
| Observer | Notifies subscribers automatically when state changes |
| State | Changes behavior based on internal state (state machine) |
| Strategy | Swaps interchangeable algorithms at runtime |
| Template Method | Fixed algorithm skeleton, overridable steps |
| Visitor | Adds new operations to a class hierarchy without modifying it |

---

## Related Topics

- [[docs/csharp/design-patterns/Design Patterns\|Design Patterns Overview]]
- [[docs/csharp/design-patterns/Creational Patterns\|Creational Patterns]]
- [[docs/csharp/design-patterns/Structural Patterns\|Structural Patterns]]
