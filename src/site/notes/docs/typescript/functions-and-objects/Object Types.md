---
{"dg-publish":true,"permalink":"/docs/typescript/functions-and-objects/object-types/","tags":["typescript","javascript","frontend","objects"]}
---

# Object Types

## Overview

Everything from property modifiers to arrays, tuples, and combining types the vocabulary for describing the shape of the objects and collections your code actually works with, whether written as an inline object type, an `interface`, or a `type` alias.

---

## Property Modifiers

### Optional Properties (`?`)

```typescript
interface PaintOptions {
  shape: Shape;
  xPos?: number;
  yPos?: number;
}

function paintShape({ shape, xPos = 0, yPos = 0 }: PaintOptions) {
  // destructured with defaults - xPos and yPos are definitely `number` here
}
```

Under `strictNullChecks`, an optional property's type includes `undefined`, so it needs a check or a default before use same discipline as [[docs/typescript/fundamentals/Everyday Types#null and undefined\|handling null/undefined]] anywhere else.

### `readonly` Properties

```typescript
interface SomeType {
  readonly prop: string;
}

function doSomething(obj: SomeType) {
  console.log(obj.prop); // OK to read
  obj.prop = "hello";
  // Error: Cannot assign to 'prop' because it is a read-only property.
}
```

> **Caveat:** `readonly` only prevents *reassigning that property* it doesn't deep-freeze anything nested inside it, and a second reference (alias) to the same object without a `readonly` annotation can still mutate it at runtime. It's a compile-time signal, not a runtime guarantee much like `readonly` in C#, actually, which has the same "shallow" limitation.

### Index Signatures

Describe an object whose property names aren't known ahead of time:

```typescript
interface StringArray {
  [index: number]: string;
}

const myArray: StringArray = getStringArray();
const secondItem = myArray[1]; // string
```

If you mix a `number` and a `string` index signature, the `number` one's return type must be a subtype of the `string` one's because JavaScript always converts a numeric key to a string before doing the actual lookup:

```typescript
interface NumberDictionary {
  [index: string]: number;
  length: number; // OK - number is a subtype of number
  name: string;
  // Error: string is not assignable to the string index type 'number'
}
```

Use a union return type on the index signature to allow more than one value type, and `readonly` to prevent writes through the index:

```typescript
interface ReadonlyStringArray {
  readonly [index: number]: string;
}

let myArray: ReadonlyStringArray = getReadOnlyStringArray();
myArray[2] = "Mallory"; // Error - readonly index signature
```

---

## Excess Property Checks

Assigning an **object literal directly** gets extra scrutiny properties not in the target type are flagged, not silently allowed:

```typescript
interface SquareConfig {
  color?: string;
  width?: number;
}

createSquare({ colour: "red", width: 100 });
// Error: Object literal may only specify known properties, and 'colour'
// does not exist in type 'SquareConfig'. (a caught typo!)
```

This check only fires for object literals, not for values already stored in a variable — a useful escape hatch when the extra properties are intentional:

```typescript
let squareOptions = { colour: "red", width: 100 };
createSquare(squareOptions); // OK - not a literal, so no excess-property check
```

Other ways to opt out deliberately: a type assertion (`as SquareConfig`), or adding a `[propName: string]: unknown` index signature if the type is genuinely meant to accept arbitrary extra properties.

---

## Extending Types

```typescript
interface BasicAddress {
  name?: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

interface AddressWithUnit extends BasicAddress {
  unit: string;
}
```

An interface can extend more than one type at once closer to implementing multiple interfaces in C# than to `extends` on a class:

```typescript
interface Colorful {
  color: string;
}
interface Circle {
  radius: number;
}
interface ColorfulCircle extends Colorful, Circle {}

const cc: ColorfulCircle = { color: "red", radius: 42 };
```

## Intersection Types

The `type`-alias equivalent of combining shapes, using `&` instead of `extends`:

```typescript
type ColorfulCircle = Colorful & Circle;

function draw(circle: Colorful & Circle) {
  console.log(`Color was ${circle.color}`);
  console.log(`Radius was ${circle.radius}`);
}
```

### Extension vs. Intersection When Properties Conflict

These behave differently, and it's a common surprise: `interface extends` **errors** on an incompatible property, while `&` silently collapses it to `never`:

```typescript
// interface: hard error
interface Person { name: string; }
interface Person { name: number; } // Error: conflicting declarations

// intersection: compiles, but `name` becomes unusable
type Staff = Person1 & Person2; // Person1.name: string, Person2.name: number
// staff.name has type `never` - nothing satisfies both at once
```

---

## Generic Object Types

```typescript
interface Box<Type> {
  contents: Type;
}

let boxA: Box<string> = { contents: "hello" };
let boxB: Box<number> = { contents: 123 };

function setContents<Type>(box: Box<Type>, newContents: Type) {
  box.contents = newContents;
}
```

Same idea, same syntax, as [[docs/typescript/type-manipulation/TypeScript Generics\|TypeScript Generics]] on functions and classes a placeholder type filled in per usage instead of writing a separate `Box` type for every possible content type.

### Arrays Are Generic

`number[]` is shorthand for `Array<number>` both spellings are fully interchangeable.

### ReadonlyArray

```typescript
function doStuff(values: ReadonlyArray<string>) {
  const copy = values.slice(); // OK - reading, and non-mutating methods, are fine
  values.push("hello!");
  // Error: Property 'push' does not exist on type 'readonly string[]'.
}
```

Shorthand: `readonly string[]`. Note this isn't bidirectionally assignable with a mutable array — a mutable array can be *widened* to `readonly`, but not the reverse:

```typescript
let x: readonly string[] = [];
let y: string[] = [];

x = y; // OK - mutable can always be used where readonly is expected
y = x;
// Error: readonly string[] is not assignable to string[]
```

### Tuple Types

A fixed-length array where each position has its own specific type TypeScript's answer to a lightweight, unnamed multi-value return, in the spirit of a C# tuple but with a more array-like feel:

```typescript
type StringNumberPair = [string, number];

function doSomething(pair: [string, number]) {
  const a = pair[0]; // string
  const b = pair[1]; // number
  const c = pair[2];
  // Error: Tuple type has no element at index 2.
}
```

Tuples destructure naturally, exactly like arrays:

```typescript
const [inputString, hash] = doSomethingElse(["hello", 42]);
```

**Optional elements** trailing `?` and **rest elements** `...T[]`, which can appear at the start, end, or even middle:

```typescript
type Either2dOr3d = [number, number, number?];

function setCoordinate(coord: Either2dOr3d) {
  const [x, y, z] = coord; // z: number | undefined
  console.log(`Provided coordinates had ${coord.length} dimensions`); // length: 2 | 3
}

type StringNumberBooleans = [string, number, ...boolean[]];
const a: StringNumberBooleans = ["hello", 1];
const b: StringNumberBooleans = ["beautiful", 2, true];
const c: StringNumberBooleans = ["world", 3, true, false, true];
```

Rest-element tuples are exactly how a function's parameter list is typed under the hood:

```typescript
function readButtonInput(...args: [string, number, ...boolean[]]) {
  const [name, version, ...input] = args;
}
// Equivalent, spelled the ordinary way:
function readButtonInput(name: string, version: number, ...input: boolean[]) {}
```

### `readonly` Tuples

```typescript
function doSomething(pair: readonly [string, number]) {
  pair[0] = "hello!";
  // Error: Cannot assign to '0' because it is a read-only property.
}
```

An array literal with `as const` infers as a readonly tuple automatically worth knowing since it can surprise you when passing that value somewhere expecting a mutable one:

```typescript
let point = [3, 4] as const; // readonly [3, 4]

function distanceFromOrigin([x, y]: [number, number]) {}
distanceFromOrigin(point);
// Error: readonly [3, 4] is not assignable to the mutable [number, number]
```

---

## Key Takeaways

1. `readonly` and `?` are compile-time-only property modifiers neither performs a runtime check, and `readonly` doesn't deep-freeze nested content
2. Excess property checks only fire on object **literals** assigned directly route through a variable, a type assertion, or an index signature to opt out deliberately
3. `interface extends` errors on conflicting properties; `&` intersection silently collapses a conflicting property to `never` instead know which one you're using
4. `readonly T[]` / `ReadonlyArray<T>` is one-directionally assignable from a mutable array, never the other way
5. Tuple types (`[string, number, ...boolean[]]`) are how TypeScript models fixed-shape, mixed-type arrays including how a function's own parameter list is represented internally

---

## Related Topics

- [[docs/typescript/type-manipulation/TypeScript Generics\|TypeScript Generics]]
- [[docs/typescript/fundamentals/Everyday Types\|Everyday Types]]
- [[docs/typescript/functions-and-objects/Functions\|Functions]]

---

## Source

- [TypeScript Handbook: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)

---

#typescript #javascript #frontend #objects
