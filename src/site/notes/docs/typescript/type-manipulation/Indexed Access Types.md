---
{"dg-publish":true,"permalink":"/docs/typescript/type-manipulation/indexed-access-types/","tags":["typescript","javascript","frontend","type-manipulation"]}
---

# Indexed Access Types

## Overview

An **indexed access type** looks up the type of a specific property on another type, using the same `[]` syntax you'd use to read that property off a real value:

```typescript
type Person = { age: number; name: string; alive: boolean };

type Age = Person["age"];
// type Age = number
```

## The Index Can Be a Type, Not Just One Literal

Since the thing inside the brackets is itself a type, you can index with a union, with [[docs/typescript/type-manipulation/Keyof Type Operator\|keyof]], or with any other type expression:

```typescript
type I1 = Person["age" | "name"];
// type I1 = string | number

type I2 = Person[keyof Person];
// type I2 = string | number | boolean

type AliveOrName = "alive" | "name";
type I3 = Person[AliveOrName];
// type I3 = string | boolean
```

Indexing with a property that doesn't exist is a compile error, same as accessing a nonexistent property on a real object:

```typescript
type I1 = Person["alve"];
// Error: Property 'alve' does not exist on type 'Person'.
```

## Getting an Array's Element Type

Index with `number` to get the type of an array's elements. Combined with [[docs/typescript/type-manipulation/Typeof Type Operator\|typeof]], this is a convenient way to capture the shape of an array literal without writing it out by hand:

```typescript
const MyArray = [
  { name: "Alice", age: 15 },
  { name: "Bob", age: 23 },
  { name: "Eve", age: 38 },
];

type Person = (typeof MyArray)[number];
// type Person = { name: string; age: number }

type Age = (typeof MyArray)[number]["age"];
// type Age = number
```

## Types Only, Not Values

The thing inside the brackets must be a **type**, not a value reference, even if that value happens to hold the right literal string:

```typescript
const key = "age";
type Age = Person[key];
// Error: 'key' refers to a value, but is being used as a type here.
// Did you mean 'typeof key'?
```

A `type` alias for the same literal works, since that genuinely is a type:

```typescript
type key = "age";
type Age = Person[key]; // OK
```

---

## Key Takeaways

1. `Type["propertyName"]` looks up that property's type the type-level version of reading a property off a real object
2. The index itself can be a union, a `keyof` result, or any other type not just one literal property name
3. `Type[number]` extracts an array's element type; combine with `typeof someArrayLiteral` to derive a type from real data instead of writing it by hand
4. The index must be a **type** a `const` holding the right string value doesn't work directly, only a `type` alias does

---

## Related Topics

- [[docs/typescript/type-manipulation/Creating Types from Types\|Creating Types from Types]]
- [[docs/typescript/type-manipulation/Keyof Type Operator\|Keyof Type Operator]]
- [[docs/typescript/type-manipulation/Typeof Type Operator\|Typeof Type Operator]]

---

## Source

- [TypeScript Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)

---

#typescript #javascript #frontend #type-manipulation
