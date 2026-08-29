---
{"dg-publish":true,"permalink":"/docs/typescript/type-manipulation/typeof-type-operator/","tags":["typescript","javascript","frontend","type-manipulation"]}
---

# Typeof Type Operator

## Overview

JavaScript already has a runtime `typeof` operator, used in an *expression* it returns a string describing a value's runtime category:

```typescript
console.log(typeof "Hello world"); // "string"
```

TypeScript overloads the same keyword for a second, compile-time-only purpose: used in a **type** position, `typeof` refers to the *type* of a variable or property not its runtime category string, its actual TypeScript type:

```typescript
let s = "hello";
let n: typeof s; // n: string
```

By itself that's not very interesting it gets useful once combined with other type operators.

---

## Reusing a Function's Return Type

TypeScript ships a built-in `ReturnType<T>` that extracts a function type's return type (see [[docs/typescript/type-manipulation/Conditional Types\|Conditional Types]] for how something like this is actually built):

```typescript
type Predicate = (x: unknown) => boolean;
type K = ReturnType<Predicate>;
// type K = boolean
```

The common mistake: passing a function *name* directly, rather than its type:

```typescript
function f() {
  return { x: 10, y: 3 };
}

type P = ReturnType<f>;
// Error: 'f' refers to a value, but is being used as a type here.
// Did you mean 'typeof f'?
```

`f` is a *value*; `ReturnType` needs a *type*. `typeof f` bridges that gap "the type of the value `f`":

```typescript
type P = ReturnType<typeof f>;
// type P = { x: number; y: number }
```

This value-vs-type distinction is worth sitting with TypeScript keeps two separate namespaces (one for values, one for types), and a name can exist in either or both. `typeof` is how you cross from the value namespace into the type namespace.

---

## Limitation: Identifiers Only

TypeScript only allows `typeof` on identifiers (variable names) or their properties not on arbitrary expressions, including function *calls*. This is deliberate: it stops you from writing what looks like executable code inside a type position, when nothing there is actually running:

```typescript
let shouldContinue: typeof msgbox("Are you sure you want to continue?");
// Error: ',' expected.
// (this looks like it calls msgbox(), but a type position never executes anything)
```

---

## Key Takeaways

1. `typeof` in an *expression* position is ordinary runtime JavaScript, returning a string like `"string"` or `"object"`
2. `typeof` in a *type* position is TypeScript-only and compile-time-only it refers to a value's inferred TypeScript type, not a runtime string
3. Use `typeof someValue` (not `SomeValue` directly) whenever you need "the type of this value" rather than "this value used as a type" the `ReturnType<typeof f>` pattern is the most common place this comes up
4. `typeof` only accepts identifiers or property access never a function call or other expression, to keep type positions free of anything that looks like it executes

---

## Related Topics

- [[docs/typescript/type-manipulation/Creating Types from Types\|Creating Types from Types]]
- [[docs/typescript/type-manipulation/Keyof Type Operator\|Keyof Type Operator]]
- [[docs/typescript/type-manipulation/Indexed Access Types\|Indexed Access Types]]

---

## Source

- [TypeScript Handbook: Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)

---

#typescript #javascript #frontend #type-manipulation
