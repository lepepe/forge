---
{"dg-publish":true,"permalink":"/docs/typescript/type-script-for-oop-developers/","tags":["typescript","javascript","frontend","oop","type-systems"]}
---

# TypeScript for C# Developers

## Overview

**TypeScript** is JavaScript with a static type-checking layer added on top. It compiles down to plain JavaScript, and this is the important part the types are only a compile-time concept. They're checked while you write code, then stripped away entirely; nothing about them exists when the code actually runs.

Coming from C#, the syntax will feel immediately familiar (classes, interfaces, generics, `public`/`private`). The syntax is *not* where the real learning curve is. The real shift is conceptual: TypeScript's type system works on fundamentally different rules than C#'s, and those rules explain a lot of things that look like "bugs" the first time you see them.

---

## TypeScript Doesn't Change How JavaScript Runs

TypeScript adds zero runtime behavior of its own every `.ts` file is compiled to `.js` before anything executes, and the type annotations are gone by then. This means:

- Learning how JavaScript itself behaves at runtime (type coercion, `this` binding, the DOM, async behavior) matters just as much as learning TypeScript's syntax TypeScript resources won't cover that, JavaScript resources will
- If you're debugging *runtime* behavior, you're debugging JavaScript, not TypeScript

---

## Classes Are Optional, Not Mandatory

In C#, everything lives inside a class even a script-like console app needs a `class Program` with a `static void Main`. There's no such requirement in JavaScript or TypeScript.

```typescript
// Perfectly normal, idiomatic TypeScript - no class in sight
function calculateTotal(items: { price: number }[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

const total = calculateTotal([{ price: 10 }, { price: 20 }]);
```

Free-standing functions operating on plain data are a common, idiomatic pattern not a code smell. Patterns you'd reach for automatically in C# (a static utility class, a singleton) are often just... a function and a variable in TypeScript. That said, TypeScript still fully supports classes, interfaces, and inheritance when the problem actually calls for that shape it's a choice, not a requirement.

---

## The Real Shift: Structural Typing vs. Nominal Typing

This is the concept that trips up C# developers the most.

### How C# Decides If Types Are Compatible

C#'s type system is **nominal** and **reified**:

- **Nominal** a type's identity comes from its *declaration*. A class is only a `IShippable` if it explicitly writes `: IShippable`. Two classes with identical members but no shared interface are completely unrelated as far as the compiler is concerned.
- **Reified** type information exists at runtime. You can call `obj.GetType()` or use `typeof(T)` and get a real answer back.

### How TypeScript Decides If Types Are Compatible

TypeScript's type system is **structural** and **erased**:

- **Structural** a type is just a description of *shape*: what properties and methods exist. If a value has the right shape, it satisfies the type no explicit declaration required. Think of a type as a *set* of values that share something in common, rather than a label attached to one specific class.
- **Erased** types are a compile-time-only construct. After compiling to JavaScript, `interface`s and type annotations don't exist anymore. There's no TypeScript equivalent of `GetType()` for your own interfaces or type aliases.

### Seeing It in Action

```typescript
interface Pointlike {
  x: number;
  y: number;
}

interface Named {
  name: string;
}

function logPoint(point: Pointlike) {
  console.log(`x = ${point.x}, y = ${point.y}`);
}

function logName(x: Named) {
  console.log(`Hello, ${x.name}`);
}

const obj = { x: 0, y: 0, name: "Origin" };

logPoint(obj); // OK - obj has x and y
logName(obj);  // OK - obj also has name
```

`obj` was never declared as a `Pointlike` or a `Named` no `implements` keyword anywhere. It doesn't matter: it has an `x` and a `y`, so it satisfies `Pointlike`; it has a `name`, so it also satisfies `Named`. In C#, `obj` would need to explicitly implement both interfaces before either function would accept it.

### Consequence: Empty Interfaces Accept Almost Anything

```typescript
class Empty {}

function fn(arg: Empty) {
  // ...
}

fn({ k: 10 }); // OK - { k: 10 } has all the properties Empty requires (zero of them)
```

An object satisfies a type if it has *at least* every property that type requires. `Empty` requires nothing, so everything qualifies.

### Consequence: Unrelated Classes Can Be Interchangeable

```typescript
class Car {
  drive() {
    // hit the gas
  }
}

class Golfer {
  drive() {
    // hit the ball far
  }
}

let w: Car = new Golfer(); // OK - same shape, no error
```

`Car` and `Golfer` share no inheritance, no common interface, nothing declared in common — but they both have a `drive()` method with the same signature, so TypeScript treats them as compatible. This would be a compile error in C# without an explicit shared interface. In practice this rarely bites you with real-world classes (their shapes tend to diverge quickly), but it's worth knowing the rule exists.

---

## No Reflection on TypeScript's Own Types

Because types are erased, there's no TypeScript equivalent of `typeof(T).Name` or checking `GetType()` against an `interface`. JavaScript's own `typeof` operator only reports a handful of runtime categories (`"object"`, `"function"`, `"string"`, `"number"`, ...) it can't tell you which `class` or `interface` you're looking at:

```typescript
console.log(typeof new Car()); // "object" - not "Car"
```

If you find yourself wanting to branch on "which interface does this satisfy" at runtime, that's a sign to either check for a specific property directly, or attach an explicit `kind` / discriminant field to your objects there's no built-in reflection to reach for.

---

## Quick Comparison

| Concept                    | C#                                             | TypeScript                                      |
| -------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| Type system                | Nominal — identity from declaration            | Structural identity from shape                  |
| Runtime type info          | Reified `GetType()`, `typeof(T)` work          | Erased types vanish after compiling to JS       |
| Compatibility rule         | Must explicitly `: IInterface` / `: BaseClass` | Matching shape is enough, no declaration needed |
| Basic unit of organization | Class (effectively mandatory)                  | Function or class your choice                   |
| Combining possible types   | Requires a shared base type or interface       | First-class union types: `string \| number`     |

---

## Key Takeaways

1. TypeScript adds no runtime behavior of its own it's a compile-time type checker that fully compiles away to plain JavaScript
2. Classes are a tool in TypeScript, not a requirement free functions operating on plain data are idiomatic, unlike in C#
3. TypeScript's type system is **structural**: a value satisfies a type by having the right shape, with no explicit declaration needed (unlike C#'s **nominal** system)
4. TypeScript's types are **erased** at compile time there's no runtime reflection equivalent to `GetType()` for your own interfaces or type aliases
5. Two unrelated classes with identical method signatures are interchangeable in TypeScript the same code would be a compiler error in C# without a shared interface

---

## Related Topics

- [[docs/csharp/oop/Classes and OOP Concepts\|Classes and OOP Concepts]]
- [[docs/csharp/oop/Interfaces, Constructors, and Dependency Injection\|Interfaces, Constructors, and Dependency Injection]]
- [[docs/csharp/generics/Generics\|Generics]]

---

## Source

- [TypeScript for Java/C# Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-oop.html)

---

#typescript #javascript #frontend #oop #type-systems
