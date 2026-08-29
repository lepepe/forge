---
{"dg-publish":true,"permalink":"/docs/typescript/type-manipulation/creating-types-from-types/","tags":["typescript","javascript","frontend","type-manipulation"]}
---

# Creating Types from Types

## Overview

TypeScript's type system isn't just a place to write down shapes by hand it's expressive enough to **compute** new types from existing ones. This is the biggest conceptual leap beyond C#'s type system: C# generics let you parameterize over types, but you can't write a C# type that says "give me the return type of this method" or "make every property of this type optional" the way you can in TypeScript.

This note is the hub for seven closely related techniques. Each has its own page, but they compose constantly — several of the examples below reuse two or three of these at once.

| Technique                         | What it does                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| [[docs/typescript/type-manipulation/TypeScript Generics\|Generics]] | Types that take type parameters the foundation everything else builds on              |
| [[docs/typescript/type-manipulation/Keyof Type Operator\|Keyof Type Operator]]           | Turns an object type's keys into a union of string/number literals                    |
| [[docs/typescript/type-manipulation/Typeof Type Operator\|Typeof Type Operator]]          | Turns a *value's* inferred type into something usable as a type                       |
| [[docs/typescript/type-manipulation/Indexed Access Types\|Indexed Access Types]]          | Looks up the type of a specific property, like `Person["age"]`                        |
| [[docs/typescript/type-manipulation/Conditional Types\|Conditional Types]]             | Type-level `? :` branch on a type relationship, with `infer` to extract a piece of it |
| [[docs/typescript/type-manipulation/Mapped Types\|Mapped Types]]                  | Build a new object type by transforming every property of an existing one             |
| [[docs/typescript/type-manipulation/Template Literal Types\|Template Literal Types]]        | Build new string-literal types by interpolating unions into a template string         |

---

## Why This Matters

The throughline across all seven: instead of writing a type by hand and manually keeping it in sync with another type, you *derive* it. If the source type changes, the derived type updates automatically the type-level equivalent of DRY.

A small preview of what "composing" these looks like this uses `keyof`, an indexed access type, and a mapped type together:

```typescript
interface Person {
  name: string;
  age: number;
}

// keyof: union of Person's keys
type PersonKeys = keyof Person; // "name" | "age"

// Mapped type over those keys, using an indexed access type to reuse each property's own type
type Getters<Type> = {
  [Property in keyof Type]: () => Type[Property];
};

type PersonGetters = Getters<Person>;
// { name: () => string; age: () => number }
```

None of `PersonKeys`, `Getters`, or `PersonGetters` needed to be typed out by hand they're all derived from `Person`.

---

## Key Takeaways

1. TypeScript types can be computed from other types, not just declared from scratch this is the core capability C#'s type system doesn't have an equivalent for
2. These seven techniques are meant to compose most non-trivial type manipulation combines two or three of them
3. Deriving a type instead of duplicating it means it stays in sync automatically when the source type changes

---

## Related Topics

- [[docs/typescript/TypeScript for OOP Developers\|TypeScript for OOP Developers]]
- [[docs/typescript/fundamentals/Everyday Types\|Everyday Types]]

---

## Source

- [TypeScript Handbook: Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)

---

#typescript #javascript #frontend #type-manipulation
