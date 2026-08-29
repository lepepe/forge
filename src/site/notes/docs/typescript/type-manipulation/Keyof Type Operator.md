---
{"dg-publish":true,"permalink":"/docs/typescript/type-manipulation/keyof-type-operator/","tags":["typescript","javascript","frontend","type-manipulation"]}
---

# Keyof Type Operator

## Overview

`keyof` takes an object type and produces a union of its keys, as string (or number) literal types no equivalent exists in C#'s type system, since C# has no way to talk about "the set of a type's member names" at compile time without reflection.

```typescript
type Point = { x: number; y: number };
type P = keyof Point;
// type P = "x" | "y"
```

## With Index Signatures

If the object type has an index signature (see [[docs/typescript/functions-and-objects/Object Types#Index Signatures\|Index Signatures]]), `keyof` reflects that instead of listing literal property names:

```typescript
type Arrayish = { [n: number]: unknown };
type A = keyof Arrayish;
// type A = number

type Mapish = { [k: string]: boolean };
type M = keyof Mapish;
// type M = string | number
```

The `string | number` result for `Mapish` looks surprising at first it's because JavaScript coerces numeric keys to strings under the hood, so `obj[0]` and `obj["0"]` are the same lookup. `keyof` reflects that reality.

---

## Why It Matters

On its own, `keyof` just gives you a union of names the real value shows up combined with other techniques. Constraining one generic parameter by another's keys is the pattern you'll reach for constantly:

```typescript
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3 };
getProperty(x, "a"); // OK
getProperty(x, "z");
// Error: "z" is not a key of x
```

It's also the backbone of [[docs/typescript/type-manipulation/Mapped Types\|Mapped Types]], which iterate `[Property in keyof Type]` to build a new type from every property of an existing one.

---

## Key Takeaways

1. `keyof SomeType` produces a union of that type's property names as literal types
2. An index signature changes what `keyof` produces a `string` index signature yields `string | number`, since JS coerces numeric keys to strings
3. `keyof` has no C# equivalent this is type-level access to a type's own member names, which C# only exposes through runtime reflection
4. Its main use is composing with generics (`Key extends keyof Type`) and mapped types

---

## Related Topics

- [[docs/typescript/type-manipulation/Creating Types from Types\|Creating Types from Types]]
- [[docs/typescript/type-manipulation/Typeof Type Operator\|Typeof Type Operator]]
- [[docs/typescript/type-manipulation/Indexed Access Types\|Indexed Access Types]]
- [[docs/typescript/type-manipulation/Mapped Types\|Mapped Types]]

---

## Source

- [TypeScript Handbook: Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)

---

#typescript #javascript #frontend #type-manipulation
