---
{"dg-publish":true,"permalink":"/docs/csharp/design-patterns/design-patterns/","tags":["csharp","design-patterns","oop","gof","architecture"]}
---

# Design Patterns in C#

Notes based on the Gang of Four (GoF) catalog as organized by [refactoring.guru/design-patterns](https://refactoring.guru/design-patterns), with simple C# examples for each pattern.

## What Are Design Patterns?

A design pattern is a **reusable solution to a common problem** in software design. It's not a finished piece of code you copy-paste -- it's more like a blueprint or recipe you adapt to your own situation. Think of them as a shared vocabulary: when a teammate says "just use a Strategy here," you both immediately picture the same shape of solution without drawing a diagram.

## Why Learn Them?

- **Shared vocabulary** -- "make it a Factory" communicates a whole design in two words
- **Proven solutions** -- these problems (object creation, coupling, algorithm swapping...) have been solved and refined for decades
- **Easier code reviews** -- recognizing a pattern tells you a lot about intent at a glance
- **Not a hammer for every nail** -- overusing patterns adds needless indirection; use them when the problem actually calls for it

## The Three Categories

| Category | Purpose | Question It Answers |
|---|---|---|
| **Creational** | Object creation mechanisms | "How do I create this object flexibly, without hardcoding a concrete class?" |
| **Structural** | How classes/objects are composed into larger structures | "How do I assemble objects together cleanly?" |
| **Behavioral** | How objects communicate and share responsibility | "How do objects interact and delegate work without tight coupling?" |

---

## Pattern Catalog

### [[docs/csharp/design-patterns/CreationalPatterns\|Creational Patterns]]
Concerned with *how objects get created*.

- Factory Method
- Abstract Factory
- Builder
- Prototype
- Singleton

### [[docs/csharp/design-patterns/StructuralPatterns\|Structural Patterns]]
Concerned with *how objects and classes are composed*.

- Adapter
- Bridge
- Composite
- Decorator
- Facade
- Flyweight
- Proxy

### [[docs/csharp/design-patterns/BehavioralPatterns\|Behavioral Patterns]]
Concerned with *how objects communicate and assign responsibility*.

- Chain of Responsibility
- Command
- Iterator
- Mediator
- Memento
- Observer
- State
- Strategy
- Template Method
- Visitor

---

## Pattern Selection Cheat Sheet

| If you need to... | Consider |
|---|---|
| Create objects without hardcoding their concrete class | Factory Method, Abstract Factory |
| Build a complex object step by step | Builder |
| Copy an existing object instead of rebuilding it | Prototype |
| Guarantee only one instance of a class exists | Singleton |
| Make two incompatible interfaces work together | Adapter |
| Let an abstraction and its implementation evolve independently | Bridge |
| Treat a group of objects the same as a single object (trees) | Composite |
| Add behavior to an object without subclassing | Decorator |
| Simplify a complex subsystem behind one entry point | Facade |
| Save memory when you have huge numbers of similar objects | Flyweight |
| Control or delay access to an expensive/sensitive object | Proxy |
| Pass a request through a chain of possible handlers | Chain of Responsibility |
| Turn a request into an object (queue it, log it, undo it) | Command |
| Traverse a collection without exposing its internals | Iterator |
| Stop objects from talking directly to a web of other objects | Mediator |
| Save/restore an object's state (undo) | Memento |
| Notify many objects when one object's state changes | Observer |
| Change behavior based on internal state (state machine) | State |
| Swap between interchangeable algorithms at runtime | Strategy |
| Fix the skeleton of an algorithm but let steps vary | Template Method |
| Add new operations to a class hierarchy without modifying it | Visitor |

---

## Related Topics

- [[docs/csharp/LearningCsharp\|C# Learning Guide]]
- [[docs/csharp/oop/ClassesAndOOPConcepts\|Classes and OOP Concepts]]
- [[docs/csharp/oop/InterfacesConstructorsDi\|Interfaces, Constructors, and Dependency Injection]]

## Source

- [refactoring.guru/design-patterns](https://refactoring.guru/design-patterns)
