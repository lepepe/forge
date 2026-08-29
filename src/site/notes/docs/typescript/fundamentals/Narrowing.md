---
{"dg-publish":true,"permalink":"/docs/typescript/fundamentals/narrowing/","tags":["typescript","javascript","frontend","fundamentals"]}
---

# Narrowing

## Overview

**Narrowing** is TypeScript following your code's control flow and refining a union type down to a more specific type at each point — similar in spirit to pattern matching in C#, but driven entirely by ordinary `if`/`switch`/`typeof` checks rather than a dedicated `switch` pattern syntax.

---

## `typeof` Type Guards

```typescript
function padLeft(padding: number | string, input: string): string {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input; // padding narrowed to number
  }
  return padding + input; // padding narrowed to string
}
```

`typeof` returns one of: `"string"`, `"number"`, `"bigint"`, `"boolean"`, `"symbol"`, `"undefined"`, `"object"`, `"function"`.

> **Quirk:** `typeof null === "object"` in JavaScript — a long-standing language wart. Don't rely on `typeof` alone to rule out `null`.

## Truthiness Narrowing

JavaScript's falsy values are `0`, `NaN`, `""`, `0n`, `null`, and `undefined` — everything else is truthy. This is convenient but can bite you:

```typescript
// Careless - also filters out a legitimately empty string
if (strs) {
  // ...
}

// Better - explicit about what's actually being excluded
if (strs !== null) {
  if (typeof strs === "object") {
    // strs narrowed to array
  } else if (typeof strs === "string") {
    // strs narrowed to string
  }
}
```

Negation (`!`) narrows the *other* way in each branch:

```typescript
if (!values) {
  return values; // values is null or undefined here
} else {
  return values.map((x) => x * factor); // values is number[] here
}
```

## Equality Narrowing

```typescript
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // Only `string` is common to both unions, so both are narrowed to string
    x.toUpperCase();
    y.toLowerCase();
  }
}
```

Loose equality (`==`/`!=`) against `null` catches `undefined` too — a common, idiomatic one-liner:

```typescript
interface Container {
  value: number | null | undefined;
}

function multiplyValue(container: Container, factor: number) {
  if (container.value != null) {
    // value narrowed to number (both null and undefined excluded)
    container.value *= factor;
  }
}
```

## The `in` Operator

Checks whether a property exists on an object — useful for narrowing unions of object shapes that don't share a discriminant field:

```typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    return animal.swim(); // narrowed to Fish
  }
  return animal.fly(); // narrowed to Bird
}
```

## `instanceof`

```typescript
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString()); // narrowed to Date
  } else {
    console.log(x.toUpperCase()); // narrowed to string
  }
}
```

Works the same way it does in C# — checking the prototype chain — just spelled the same, applied to JS's prototype-based objects.

## Narrowing Through Assignment

```typescript
let x = Math.random() < 0.5 ? 10 : "hello world!"; // x: string | number

x = 1;
console.log(x); // x: number

x = "goodbye!";
console.log(x); // x: string

x = true;
// Error: Type 'boolean' is not assignable to type 'string | number'
```

Assignments are always checked against the variable's **declared** type, not whatever it happens to hold at that moment.

## Control Flow Analysis

TypeScript tracks every reachable branch and merges the results:

```typescript
function example() {
  let x: string | number | boolean;
  x = Math.random() < 0.5; // x: boolean

  if (Math.random() < 0.5) {
    x = "hello"; // x: string
  } else {
    x = 100; // x: number
  }

  return x; // x: string | number - the union of both branches
}
```

---

## User-Defined Type Guards (Type Predicates)

Sometimes the built-in checks (`typeof`, `in`, `instanceof`) aren't precise enough. A function can declare its own narrowing rule with a **type predicate** — return type `parameterName is Type`:

```typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

let pet = getSmallPet();
if (isFish(pet)) {
  pet.swim(); // narrowed to Fish
} else {
  pet.fly(); // narrowed to Bird
}
```

Type predicates compose well with array filtering — TypeScript understands the result is filtered:

```typescript
const zoo: (Fish | Bird)[] = [getSmallPet(), getSmallPet(), getSmallPet()];
const underWater: Fish[] = zoo.filter(isFish); // Fish[], not (Fish | Bird)[]
```

---

## Discriminated Unions

The single most useful narrowing pattern for modeling a fixed set of variants — TypeScript's rough equivalent of a C# closed hierarchy or an F#/Rust-style sum type. Give every member of a union a shared, literally-typed field (the **discriminant**):

```typescript
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2; // narrowed to Circle
    case "square":
      return shape.sideLength ** 2; // narrowed to Square
  }
}
```

Compared to modeling this with optional properties on one big interface, a discriminated union needs no non-null assertions, behaves consistently regardless of `strictNullChecks`, and is fully type-safe in every branch.

---

## `never` and Exhaustiveness Checking

`never` represents a value that can't happen — nothing is assignable to it (except `never` itself), but it's assignable to everything else. Assigning the narrowed value in your `default` case to a `never`-typed variable turns "did I handle every case?" into a compile error the moment someone adds a new variant:

```typescript
function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    default:
      const _exhaustiveCheck: never = shape; // OK today - every case is handled
      return _exhaustiveCheck;
  }
}
```

Add a new shape without updating the `switch`, and this same code now fails to compile:

```typescript
interface Triangle {
  kind: "triangle";
  sideLength: number;
}

type Shape = Circle | Square | Triangle;

// ...same switch as above...
// default: const _exhaustiveCheck: never = shape;
// Error: Type 'Triangle' is not assignable to type 'never'.
```

This is the closest TypeScript gets to a compiler-enforced exhaustive `switch` — worth adding as a habit to every discriminated-union `switch` you write.

---

## Key Takeaways

1. Narrowing refines a union type within a branch of your code, based on ordinary runtime checks — `typeof`, `in`, `instanceof`, equality, truthiness
2. Prefer **discriminated unions** (a shared literal field like `kind`) over optional-property object shapes for modeling variants — safer and needs no non-null assertions
3. Write a custom **type predicate** (`x is Type`) when the built-in checks can't express your narrowing logic
4. Add a `never`-typed exhaustiveness check to every discriminated-union `switch` — it turns "forgot to handle a new case" into a compile error

---

## Related Topics

- [[docs/typescript/fundamentals/Everyday Types\|Everyday Types]]
- [[docs/typescript/fundamentals/The Basics\|The Basics]]
- [[docs/typescript/type-manipulation/Conditional Types\|Conditional Types]]

---

## Source

- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

---

#typescript #javascript #frontend #fundamentals
