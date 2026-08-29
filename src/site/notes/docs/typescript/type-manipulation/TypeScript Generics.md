---
{"dg-publish":true,"permalink":"/docs/typescript/type-manipulation/type-script-generics/","tags":["typescript","javascript","frontend","generics","type-manipulation"]}
---

# Generics

> **Note:** this covers TypeScript's generics specifically. For the C# side of this comparison, see [[docs/csharp/generics/Generics\|C# Generics]] same core idea (a placeholder type filled in at the call site), different mechanics underneath (TypeScript's are fully erased at compile time; C#'s are reified and exist at runtime — see [[docs/typescript/TypeScript for OOP Developers\|TypeScript for OOP Developers]]).

## Overview

Generics let a function, interface, or class work with a placeholder type instead of one specific type — without falling back to `any` and losing type information entirely.

```typescript
// One fixed type - not reusable
function identity(arg: number): number {
  return arg;
}

// any - reusable, but the caller's type info is lost
function identity(arg: any): any {
  return arg;
}

// Generic - reusable AND type-preserving
function identity<Type>(arg: Type): Type {
  return arg;
}
```

```typescript
let output = identity<string>("myString"); // explicit
let output = identity("myString");         // inferred - TypeScript figures out Type = string
```

---

## Working with a Generic Type Variable

The compiler only lets you use operations valid for *every possible type* the parameter could be — not operations valid for some specific type you have in mind:

```typescript
function loggingIdentity<Type>(arg: Type): Type {
  console.log(arg.length);
  // Error: Property 'length' does not exist on type 'Type'.
  // (Type could be a number, which has no .length)
  return arg;
}
```

Constrain the parameter to an array, and `.length` becomes valid — because now every possible `Type[]` has one:

```typescript
function loggingIdentity<Type>(arg: Type[]): Type[] {
  console.log(arg.length); // OK
  return arg;
}
```

---

## Generic Interfaces and Classes

```typescript
interface GenericIdentityFn<Type> {
  (arg: Type): Type;
}

function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
```

```typescript
class GenericNumber<NumType> {
  zeroValue: NumType;
  add: (x: NumType, y: NumType) => NumType;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = (x, y) => x + y;
```

Same declaration syntax as a C# generic class (`class GenericNumber<NumType>`), with one difference worth remembering: TypeScript generic classes are only generic over their *instance* side — nothing on `static` members can reference the class's type parameter (see [[docs/typescript/oop/Classes#Generic Classes\|Generic Classes]] for why).

---

## Generic Constraints

`extends` on a type parameter restricts what it can be — matches C#'s `where T : ISomething`:

```typescript
interface Lengthwise {
  length: number;
}

function loggingIdentity<Type extends Lengthwise>(arg: Type): Type {
  console.log(arg.length); // OK now - every Type extending Lengthwise has .length
  return arg;
}

loggingIdentity(3);
// Error: number doesn't satisfy Lengthwise
loggingIdentity({ length: 10, value: 3 }); // OK
```

### Constraining One Type Parameter With Another

```typescript
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };
getProperty(x, "a"); // OK
getProperty(x, "m");
// Error: "m" is not a key of x
```

`keyof Type` here is doing real work — see [[docs/typescript/type-manipulation/Keyof Type Operator\|Keyof Type Operator]] for what it produces on its own.

### Using Class Types in Generics

Reference a class by its **constructor function** — `{ new (): Type }` — the same idea C# expresses with a `new()` generic constraint:

```typescript
function create<Type>(c: { new (): Type }): Type {
  return new c();
}

class Animal {
  numLegs: number = 4;
}
class Bee extends Animal {
  numLegs = 6;
  keeper: BeeKeeper = new BeeKeeper();
}

function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}

createInstance(Bee).keeper.hasMask; // OK
```

---

## Generic Parameter Defaults

```typescript
declare function create<
  T extends HTMLElement = HTMLDivElement,
  U extends HTMLElement[] = T[]
>(element?: T, children?: U): Container<T, U>;

const div = create(); // Container<HTMLDivElement, HTMLDivElement[]> - both defaults used
const p = create(new HTMLParagraphElement()); // T inferred, U defaults to T[]
```

Rules: a type parameter with a default becomes optional; required parameters can't follow an optional one; a default must satisfy its own constraint if it has one.

---

## Three Rules for Writing Good Generics

Covered in full with examples in [[docs/typescript/functions-and-objects/Functions#Generic Functions\|More on Functions]] — the short version: push type parameters down to where they're actually used (don't let the return type collapse to `any`), use as few type parameters as the logic genuinely needs, and if a parameter only appears once in the whole signature, replace it with a concrete type instead.

---

## Key Takeaways

1. Generics preserve the caller's exact type through a function/class/interface, where `any` would erase it entirely
2. `extends` constrains a type parameter the same way C#'s `where T : X` does — including constraining one parameter by another (`Key extends keyof Type`)
3. TypeScript generics are fully compile-time and erased; there's no runtime equivalent of C#'s reified generic type — see [[docs/typescript/TypeScript for OOP Developers\|TypeScript for OOP Developers]]
4. Generic classes are only generic over instances — `static` members can't reference the class type parameter
5. `{ new (): Type }` types a constructor function itself, TypeScript's equivalent of a C# `new()` constraint

---

## Related Topics

- [[docs/typescript/type-manipulation/Creating Types from Types\|Creating Types from Types]]
- [[docs/typescript/type-manipulation/Keyof Type Operator\|Keyof Type Operator]]
- [[docs/typescript/functions-and-objects/Functions\|Functions]]
- [[docs/csharp/generics/Generics\|C# Generics]]

---

## Source

- [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

---

#typescript #javascript #frontend #generics #type-manipulation
