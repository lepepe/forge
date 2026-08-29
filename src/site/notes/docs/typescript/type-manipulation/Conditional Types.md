---
{"dg-publish":true,"permalink":"/docs/typescript/type-manipulation/conditional-types/","tags":["typescript","javascript","frontend","type-manipulation"]}
---

# Conditional Types

## Overview

A **conditional type** is a type-level ternary: it branches on whether one type is assignable to another, and picks one of two resulting types. There's no C# equivalent this is compile-time branching *on types themselves*, not on values.

```typescript
SomeType extends OtherType ? TrueType : FalseType;
```

```typescript
interface Animal { live(): void; }
interface Dog extends Animal { woof(): void; }

type Example1 = Dog extends Animal ? number : string;
// type Example1 = number

type Example2 = RegExp extends Animal ? number : string;
// type Example2 = string
```

---

## Replacing Overloads with a Conditional Type

The motivating use case: a function whose return type genuinely depends on its input type. In C#, or in plain TypeScript, this normally means [[docs/typescript/functions-and-objects/Functions#Function Overloads\|multiple overload signatures]]:

```typescript
interface IdLabel { id: number; }
interface NameLabel { name: string; }

function createLabel(id: number): IdLabel;
function createLabel(name: string): NameLabel;
function createLabel(nameOrId: string | number): IdLabel | NameLabel;
function createLabel(nameOrId: string | number): IdLabel | NameLabel {
  throw "unimplemented";
}
```

A conditional type expresses the same relationship once, generically, instead of enumerating every case as a separate overload:

```typescript
type NameOrId<T extends number | string> = T extends number ? IdLabel : NameLabel;

function createLabel<T extends number | string>(idOrName: T): NameOrId<T> {
  throw "unimplemented";
}

let a = createLabel("typescript"); // a: NameLabel
let b = createLabel(2.8);           // b: IdLabel
let c = createLabel(Math.random() ? "hello" : 42); // c: NameLabel | IdLabel
```

## Constraining and Defaulting Inside a Conditional

```typescript
type MessageOf<T> = T extends { message: unknown } ? T["message"] : never;

interface Email { message: string; }
interface Dog { bark(): void; }

type EmailMessageContents = MessageOf<Email>; // string
type DogMessageContents = MessageOf<Dog>;      // never - Dog has no `message`
```

A practical, minimal example "unwrap an array's element type, or leave non-arrays alone":

```typescript
type Flatten<T> = T extends any[] ? T[number] : T;

type Str = Flatten<string[]>; // string
type Num = Flatten<number>;   // number
```

---

## `infer`: Capturing a Piece of the Matched Type

`infer` declares a new type variable *inside* the `extends` clause, letting you pull a piece out of the type being checked instead of just branching on it. The `Flatten` example above hardcodes `T[number]`; `infer` generalizes that:

```typescript
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
```

The canonical use: extracting a function's return type is exactly how `ReturnType<T>` (used in [[docs/typescript/type-manipulation/Typeof Type Operator\|Typeof Type Operator]]) is actually implemented:

```typescript
type GetReturnType<Type> = Type extends (...args: never[]) => infer Return ? Return : never;

type Num = GetReturnType<() => number>;                    // number
type Str = GetReturnType<(x: string) => string>;            // string
type Bools = GetReturnType<(a: boolean, b: boolean) => boolean[]>; // boolean[]
```

> **Overloaded functions:** inference is taken from the *last* signature — usually the most general, catch-all one:
>
> ```typescript
> declare function stringOrNum(x: string): number;
> declare function stringOrNum(x: number): string;
> declare function stringOrNum(x: string | number): string | number;
>
> type T1 = ReturnType<typeof stringOrNum>;
> // type T1 = string | number
> ```

---

## Distributive Conditional Types

This is the part most likely to surprise you: when a conditional type's checked type is a **naked generic type parameter**, and you pass it a union, the conditional applies to *each union member separately*, then re-unions the results:

```typescript
type ToArray<Type> = Type extends any ? Type[] : never;

type StrArrOrNumArr = ToArray<string | number>;
// type StrArrOrNumArr = string[] | number[]
// (NOT (string | number)[] !)
```

What's actually happening: `ToArray<string | number>` behaves as `ToArray<string> | ToArray<number>`, evaluated independently, then joined back into a union.

**Prevent distribution** by wrapping both sides of `extends` in `[]` this makes the checked type a single tuple containing the union, rather than the "naked" union itself, which turns off the distributive behavior:

```typescript
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;

type ArrOfStrOrNum = ToArrayNonDist<string | number>;
// type ArrOfStrOrNum = (string | number)[]
```

Whether you want distribution or not depends entirely on what you're modeling there's no universally "correct" choice, just be deliberate about which one you're getting.

---

## Key Takeaways

1. `A extends B ? X : Y` branches at the type level TypeScript has no direct C# analogue for this
2. Conditional types can replace a family of function overloads with one generic type expressing the same input→output relationship
3. `infer` captures a piece of the matched type inside the `extends` clause this is literally how built-ins like `ReturnType<T>` are implemented
4. When the checked type is a bare generic parameter fed a union, the conditional **distributes** over each union member independently wrap both sides in `[]` to opt out when you want the union treated as one whole

---

## Related Topics

- [[docs/typescript/type-manipulation/Creating Types from Types\|Creating Types from Types]]
- [[docs/typescript/fundamentals/Narrowing\|Narrowing]]
- [[docs/typescript/type-manipulation/Mapped Types\|Mapped Types]]

---

## Source

- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

---

#typescript #javascript #frontend #type-manipulation
