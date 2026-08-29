---
{"dg-publish":true,"permalink":"/docs/typescript/fundamentals/everyday-types/","tags":["typescript","javascript","frontend","fundamentals"]}
---

# Everyday Types

## Overview

The types you'll reach for constantly, day to day: primitives, arrays, object shapes, unions, and the two ways to name a shape (`type` and `interface`).

---

## Primitives

```typescript
let isDone: boolean = false;
let age: number = 26;      // no separate int/float - all numbers are `number`
let color: string = "blue";
```

Always lowercase — `string`, `number`, `boolean` — never `String`, `Number`, `Boolean` (those refer to the rarely-used boxed wrapper objects).

## Arrays

```typescript
let numbers: number[];
let strings: Array<string>; // equivalent syntax
```

> **Note:** `[number]` (inside brackets) means something different — a tuple type. See [[docs/typescript/functions-and-objects/Object Types\|Object Types]].

## The `any` Type

`any` opts a value out of type-checking entirely — the escape hatch, closest thing to "just trust me":

```typescript
let obj: any = { x: 0 };
obj.foo();               // no error
obj();                   // no error
const n: number = obj;   // no error
```

Reach for `any` sparingly. The `noImplicitAny` compiler flag (see [[docs/typescript/fundamentals/The Basics\|The Basics]]) turns accidental, un-annotated `any` into a build error.

## Variable Type Annotations

```typescript
let myName: string = "Alice";
let myName = "Alice"; // usually unnecessary - inferred as string
```

---

## Functions

### Parameter and Return Types

```typescript
function greet(name: string) {
  console.log("Hello, " + name.toUpperCase() + "!!");
}
greet(42);
// Error: Argument of type 'number' is not assignable to parameter of type 'string'.

function getFavoriteNumber(): number {
  return 26;
}

async function getFavoriteNumber(): Promise<number> {
  return 26;
}
```

### Contextual Typing

Parameters of a function passed somewhere TypeScript already knows the expected shape get inferred automatically — no annotation needed:

```typescript
const names = ["Alice", "Bob", "Eve"];
names.forEach(function (s) {
  console.log(s.toUpperCase()); // s inferred as string, from the array's element type
});
```

---

## Object Types

```typescript
function printCoord(pt: { x: number; y: number }) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
printCoord({ x: 3, y: 7 });
```

### Optional Properties

```typescript
function printName(obj: { first: string; last?: string }) {
  if (obj.last !== undefined) {
    console.log(obj.last.toUpperCase());
  }
  console.log(obj.last?.toUpperCase()); // optional chaining - same idea as C#'s ?.
}
```

---

## Union Types

A value that can be *one of several* types — TypeScript's answer to overloading a parameter's accepted shape, more direct than C#'s pattern of multiple overloads or a common base type:

```typescript
function printId(id: number | string) {
  console.log("Your ID is: " + id);
}
printId(101);
printId("202");
```

Only operations valid for *every* member of the union are allowed without narrowing first (see [[docs/typescript/fundamentals/Narrowing\|Narrowing]]):

```typescript
function printId(id: number | string) {
  if (typeof id === "string") {
    console.log(id.toUpperCase()); // narrowed to string
  } else {
    console.log(id); // narrowed to number
  }
}
```

Members that exist on *both* sides of the union don't need narrowing at all:

```typescript
function getFirstThree(x: number[] | string) {
  return x.slice(0, 3); // .slice() exists on both array and string
}
```

---

## Naming Shapes: Type Aliases and Interfaces

### Type Aliases

```typescript
type Point = {
  x: number;
  y: number;
};

function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
}

type ID = number | string; // aliases work for unions too, not just object shapes
```

A type alias is purely a *name* — it doesn't create a genuinely distinct type the way a C# class does.

### Interfaces

```typescript
interface Point {
  x: number;
  y: number;
}

function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
}
```

### Type vs. Interface

| | `interface` | `type` |
|---|---|---|
| Extending | `interface Bear extends Animal {}` | `type Bear = Animal & { ... }` |
| Reopening to add fields later | Yes — redeclare the interface | No — cannot be reopened once created |
| Unions, tuples, primitives | Not directly | Yes |

**Rule of thumb:** default to `interface`; reach for `type` when you need a union, a tuple, or another non-object-shape construct.

---

## Type Assertions

Tell TypeScript "I know more about this value's type than you can infer" — similar in spirit to a C# cast, but purely compile-time, with zero runtime check:

```typescript
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
```

TypeScript only allows assertions between overlapping types:

```typescript
const x = "hello" as number;
// Error: Conversion of type 'string' to type 'number' may be a mistake
// because neither type sufficiently overlaps with the other.

const a = expr as any as T; // escape hatch: route through `any` when you're certain
```

Unlike a C# cast, this performs **no runtime check** — asserting a wrong type doesn't throw, it just tells the compiler to trust you.

---

## Literal Types

```typescript
let changingString = "Hello World"; // type: string
const constantString = "Hello World"; // type: "Hello World" (the literal itself)

function printText(s: string, alignment: "left" | "right" | "center") {}
printText("Hello", "left"); // OK
printText("Hello", "centre"); // Error - not one of the allowed literals
```

### Literal Inference

Object properties widen to their general type by default, so they remain reassignable:

```typescript
const obj = { counter: 0 };
obj.counter = 1; // OK - counter's type is number, not literally 0
```

Force literal typing with `as const` when you want the narrow, exact type:

```typescript
const req = { url: "https://example.com", method: "GET" } as const;
```

---

## `null` and `undefined`

With `strictNullChecks` on (recommended — see [[docs/typescript/fundamentals/The Basics\|The Basics]]), you must handle `null`/`undefined` explicitly, much like C#'s nullable reference types:

```typescript
function doSomething(x: string | null) {
  if (x === null) {
    // handle the null case
  } else {
    console.log("Hello, " + x.toUpperCase());
  }
}
```

### Non-null Assertion (`!`)

```typescript
function liveDangerously(x?: number | null) {
  console.log(x!.toFixed()); // "I promise this isn't null/undefined" - no runtime check
}
```

Use sparingly — like a type assertion, it's a compile-time-only promise with no runtime safety net.

---

## Enums

```typescript
enum Direction {
  Up = 1,
  Down = 2,
  Left = 3,
  Right = 4,
}
```

Unlike most TypeScript type constructs, `enum` is **not erased** — it generates real runtime JavaScript. In modern TypeScript, a [[docs/typescript/fundamentals/Narrowing\|discriminated union]] (a plain string-literal field) is usually the preferred, lighter-weight alternative.

## Less Common Primitives

```typescript
const oneHundred: bigint = BigInt(100);
const anotherHundred: bigint = 100n;

const firstName = Symbol("name");
const secondName = Symbol("name");
firstName === secondName; // false - every Symbol() call produces a unique value
```

---

## Key Takeaways

1. Primitives are always lowercase: `string`, `number`, `boolean` — never the capitalized wrapper types
2. Union types (`string | number`) are TypeScript's native way to express "one of several types" — no overloads or shared base class required
3. `interface` and `type` both name object shapes; default to `interface`, switch to `type` for unions/tuples or when you need composition via `&`
4. Type assertions (`as`) and the non-null assertion (`!`) are compile-time-only promises to the compiler — neither performs a runtime check
5. `as const` locks a value to its exact literal type instead of the widened general type object properties get by default

---

## Related Topics

- [[docs/typescript/fundamentals/The Basics\|The Basics]]
- [[docs/typescript/fundamentals/Narrowing\|Narrowing]]
- [[docs/typescript/functions-and-objects/Object Types\|Object Types]]

---

## Source

- [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)

---

#typescript #javascript #frontend #fundamentals
