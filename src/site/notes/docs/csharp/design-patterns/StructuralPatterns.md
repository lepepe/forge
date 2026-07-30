---
{"dg-publish":true,"permalink":"/docs/csharp/design-patterns/structural-patterns/","tags":["csharp","design-patterns","structural","oop","gof"]}
---

# Structural Design Patterns

Structural patterns explain how to **assemble objects and classes into larger structures**, while keeping those structures flexible and efficient.

## Adapter

Makes two incompatible interfaces work together by wrapping one of them.

**Analogy:** A power plug adapter -- it lets a US plug work in an EU socket without changing either one.

```csharp
// The interface our app expects
public interface IJsonLogger
{
    void LogJson(string json);
}

// A third-party class we can't modify, with an incompatible interface
public class LegacyXmlLogger
{
    public void WriteXml(string xml) => Console.WriteLine($"XML: {xml}");
}

// Adapter makes LegacyXmlLogger work where IJsonLogger is expected
public class XmlLoggerAdapter : IJsonLogger
{
    private readonly LegacyXmlLogger _xmlLogger;

    public XmlLoggerAdapter(LegacyXmlLogger xmlLogger) => _xmlLogger = xmlLogger;

    public void LogJson(string json)
    {
        string xml = $"<log>{json}</log>"; // Pretend conversion
        _xmlLogger.WriteXml(xml);
    }
}

// Usage
IJsonLogger logger = new XmlLoggerAdapter(new LegacyXmlLogger());
logger.LogJson("{\"event\":\"started\"}");
```

**Key points:** great for wrapping third-party or legacy code you can't change.

---

## Bridge

Splits a class into two independent hierarchies -- an **abstraction** and an **implementation** -- so each can change without affecting the other.

**Analogy:** A TV remote (abstraction) works with any brand of TV (implementation), as long as both follow the same connection contract.

```csharp
// Implementation hierarchy
public interface IRenderer
{
    string RenderShape(string shape);
}

public class VectorRenderer : IRenderer
{
    public string RenderShape(string shape) => $"Drawing {shape} as vectors";
}

public class RasterRenderer : IRenderer
{
    public string RenderShape(string shape) => $"Drawing {shape} as pixels";
}

// Abstraction hierarchy - holds a reference to the implementation
public abstract class Shape
{
    protected readonly IRenderer Renderer;
    protected Shape(IRenderer renderer) => Renderer = renderer;

    public abstract string Draw();
}

public class Circle : Shape
{
    public Circle(IRenderer renderer) : base(renderer) { }
    public override string Draw() => Renderer.RenderShape("circle");
}

// Usage - mix any shape with any renderer
Shape circle = new Circle(new VectorRenderer());
Console.WriteLine(circle.Draw()); // "Drawing circle as vectors"
```

**Key points:** avoids a combinatorial explosion of subclasses (`VectorCircle`, `RasterCircle`, `VectorSquare`, `RasterSquare`...) by composing two hierarchies instead of multiplying them.

---

## Composite

Composes objects into **tree structures** and lets clients treat individual objects and compositions of objects uniformly.

**Analogy:** A file system -- a folder can contain files and other folders, but both respond to `GetSize()`.

```csharp
public interface IFileSystemItem
{
    int GetSize();
}

public class File : IFileSystemItem
{
    private readonly int _size;
    public File(int size) => _size = size;
    public int GetSize() => _size;
}

public class Folder : IFileSystemItem
{
    private readonly List<IFileSystemItem> _items = new();

    public void Add(IFileSystemItem item) => _items.Add(item);

    public int GetSize() => _items.Sum(item => item.GetSize()); // Recursive
}

// Usage
var root = new Folder();
root.Add(new File(100));

var subFolder = new Folder();
subFolder.Add(new File(50));
subFolder.Add(new File(25));
root.Add(subFolder);

Console.WriteLine(root.GetSize()); // 175 - files and folders treated the same
```

**Key points:** the client code (`GetSize()` caller) doesn't need to know or care whether it's dealing with a leaf (`File`) or a branch (`Folder`).

---

## Decorator

Attaches new behavior to an object dynamically by wrapping it, as a flexible alternative to subclassing.

**Analogy:** Ordering coffee -- start with plain coffee, wrap it with Milk, wrap that with Sugar; each layer adds cost and description.

```csharp
public interface ICoffee
{
    string Description();
    decimal Cost();
}

public class PlainCoffee : ICoffee
{
    public string Description() => "Coffee";
    public decimal Cost() => 2.00m;
}

public abstract class CoffeeDecorator : ICoffee
{
    protected readonly ICoffee Coffee;
    protected CoffeeDecorator(ICoffee coffee) => Coffee = coffee;

    public virtual string Description() => Coffee.Description();
    public virtual decimal Cost() => Coffee.Cost();
}

public class MilkDecorator : CoffeeDecorator
{
    public MilkDecorator(ICoffee coffee) : base(coffee) { }
    public override string Description() => $"{Coffee.Description()} + Milk";
    public override decimal Cost() => Coffee.Cost() + 0.50m;
}

public class SugarDecorator : CoffeeDecorator
{
    public SugarDecorator(ICoffee coffee) : base(coffee) { }
    public override string Description() => $"{Coffee.Description()} + Sugar";
    public override decimal Cost() => Coffee.Cost() + 0.25m;
}

// Usage - stack decorators at runtime, in any combination
ICoffee order = new SugarDecorator(new MilkDecorator(new PlainCoffee()));
Console.WriteLine($"{order.Description()}: ${order.Cost()}"); // "Coffee + Milk + Sugar: $2.75"
```

**Key points:** each decorator implements the same interface as the object it wraps, so decorators can be stacked in any order and any number of times.

---

## Facade

Provides a **simple, unified interface** to a complex subsystem.

**Analogy:** A car's ignition button hides the complexity of fuel injection, battery checks, and starter motors behind one action.

```csharp
// Complex subsystem
public class CpuCheck { public void Run() => Console.WriteLine("CPU check passed"); }
public class MemoryCheck { public void Run() => Console.WriteLine("Memory check passed"); }
public class DiskCheck { public void Run() => Console.WriteLine("Disk check passed"); }

// Facade
public class ComputerFacade
{
    private readonly CpuCheck _cpu = new();
    private readonly MemoryCheck _memory = new();
    private readonly DiskCheck _disk = new();

    public void StartComputer()
    {
        _cpu.Run();
        _memory.Run();
        _disk.Run();
        Console.WriteLine("Computer started");
    }
}

// Usage - one call instead of orchestrating three subsystems yourself
new ComputerFacade().StartComputer();
```

**Key points:** the facade doesn't hide the subsystem entirely -- advanced callers can still use `CpuCheck` directly if they need finer control.

---

## Flyweight

Fits more objects into memory by **sharing common state** between many objects instead of duplicating it in each one.

**Analogy:** A text editor doesn't create a brand-new object per character glyph on screen -- it shares one glyph object per character and stores only the position separately.

```csharp
// Shared, immutable state (the "flyweight")
public class TreeType
{
    public string Name { get; }
    public string Color { get; }
    public string Texture { get; }

    public TreeType(string name, string color, string texture)
    {
        Name = name;
        Color = color;
        Texture = texture;
    }

    public void Draw(int x, int y) => Console.WriteLine($"Drawing {Name} tree at ({x},{y})");
}

// Factory that reuses flyweights instead of creating duplicates
public static class TreeFactory
{
    private static readonly Dictionary<string, TreeType> _types = new();

    public static TreeType GetTreeType(string name, string color, string texture)
    {
        string key = $"{name}_{color}_{texture}";
        if (!_types.TryGetValue(key, out var type))
        {
            type = new TreeType(name, color, texture);
            _types[key] = type; // Cache and reuse
        }
        return type;
    }
}

// Unique, per-instance state stored separately
public class Tree
{
    private readonly int _x, _y;
    private readonly TreeType _type;

    public Tree(int x, int y, TreeType type)
    {
        _x = x;
        _y = y;
        _type = type;
    }

    public void Draw() => _type.Draw(_x, _y);
}

// Usage - a forest of thousands of trees but only a handful of TreeType objects
var oak = TreeFactory.GetTreeType("Oak", "Green", "Rough");
var tree1 = new Tree(10, 20, oak);
var tree2 = new Tree(15, 25, oak); // Reuses the same TreeType instance
```

**Key points:** split object state into **intrinsic** (shared, reusable -- `TreeType`) and **extrinsic** (unique per instance -- `x`, `y`).

---

## Proxy

Provides a **substitute or placeholder** for another object to control access to it -- for lazy loading, caching, access control, or logging.

**Analogy:** A credit card is a proxy for your bank account -- it validates and controls access before touching the real funds.

```csharp
public interface IImage
{
    void Display();
}

public class RealImage : IImage
{
    private readonly string _fileName;

    public RealImage(string fileName)
    {
        _fileName = fileName;
        LoadFromDisk(); // Expensive operation
    }

    private void LoadFromDisk() => Console.WriteLine($"Loading {_fileName} from disk...");

    public void Display() => Console.WriteLine($"Displaying {_fileName}");
}

// Proxy defers creating the expensive RealImage until it's actually needed
public class ImageProxy : IImage
{
    private readonly string _fileName;
    private RealImage? _realImage;

    public ImageProxy(string fileName) => _fileName = fileName;

    public void Display()
    {
        _realImage ??= new RealImage(_fileName); // Lazy load on first use
        _realImage.Display();
    }
}

// Usage - RealImage is never loaded until Display() is called
IImage image = new ImageProxy("photo.png");
Console.WriteLine("Image object created, nothing loaded yet");
image.Display(); // Loads and displays now
```

**Key points:** the proxy implements the same interface as the real object, so callers can't tell the difference -- it's a drop-in replacement that adds control.

---

## TL;DR

| Pattern | One-Liner |
|---|---|
| Adapter | Makes incompatible interfaces work together |
| Bridge | Separates abstraction from implementation so both vary independently |
| Composite | Treats individual objects and groups of objects uniformly (trees) |
| Decorator | Adds behavior to an object dynamically, by wrapping it |
| Facade | Simplified interface in front of a complex subsystem |
| Flyweight | Shares common state to save memory across many objects |
| Proxy | Controls access to another object (lazy load, cache, guard) |

---

## Related Topics

- [[docs/csharp/design-patterns/DesignPatterns\|Design Patterns Overview]]
- [[docs/csharp/design-patterns/CreationalPatterns\|Creational Patterns]]
- [[docs/csharp/design-patterns/BehavioralPatterns\|Behavioral Patterns]]
