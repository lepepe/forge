---
{"dg-publish":true,"permalink":"/docs/typescript/functions-and-objects/functions/","tags":["typescript","javascript","frontend","functions"]}
---

# More on Functions

## Overview

Functions are first-class values in JavaScript see [[docs/typescript/TypeScript for OOP Developers\|TypeScript for OOP Developers]] for why that matters more than it does in C#. This note covers how to type them precisely: as standalone values, as callable objects, generically, with overloads, and everything around `this`.

---

## Function Type Expressions

The simplest way to type "a function with this shape":

```typescript
function greeter(fn: (a: string) => void) {
  fn("Hello, World");
}

function printToConsole(s: string) {
  console.log(s);
}

greeter(printToConsole);
```

`(a: string) => void` reads as "a function taking one `string` parameter named `a`, returning nothing" the parameter name is required in the syntax, even though it's just documentation. Name it with a `type` alias, same as any other type:

```typescript
type GreetFunction = (a: string) => void;

function greeter(fn: GreetFunction) {
  // ...
}
```

## Call Signatures and Construct Signatures

JavaScript functions can carry their own properties (unlike a C# delegate, which can't). To type "callable, and also has properties," use a **call signature** inside an object type:

```typescript
type DescribableFunction = {
  description: string;
  (someArg: number): boolean; // note: `:` not `=>` here
};

function doSomething(fn: DescribableFunction) {
  console.log(fn.description + " returned " + fn(6));
}
```

A **construct signature** (prefixed with `new`) types something invokable via `new`:

```typescript
type SomeConstructor = {
  new (s: string): SomeObject;
};

function fn(ctor: SomeConstructor) {
  return new ctor("hello");
}
```

Call and construct signatures can coexist on the same type this is how `Date` itself is typed, callable both with and without `new`:

```typescript
interface CallOrConstruct {
  (n?: number): string;
  new (s: string): Date;
}
```

---

## Generic Functions

See [[docs/typescript/type-manipulation/TypeScript Generics\|TypeScript Generics]] for the full picture the short version, in a function signature:

```typescript
function firstElement<Type>(arr: Type[]): Type | undefined {
  return arr[0];
}

const s = firstElement(["a", "b", "c"]); // string
const n = firstElement([1, 2, 3]); // number
```

TypeScript infers type arguments from how you call the function, the same way C# infers `T` from a method call's arguments most of the time:

```typescript
function map<Input, Output>(arr: Input[], func: (arg: Input) => Output): Output[] {
  return arr.map(func);
}

const parsed = map(["1", "2", "3"], (n) => parseInt(n));
// n: string (inferred), parsed: number[]
```

### Constraints

`extends` limits what a type parameter can be TypeScript's equivalent of a C# generic constraint (`where T : ISomething`):

```typescript
function longest<Type extends { length: number }>(a: Type, b: Type) {
  return a.length >= b.length ? a : b;
}

longest([1, 2], [1, 2, 3]); // OK - number[]
longest("alice", "bob");    // OK - "alice" | "bob"
longest(10, 100);
// Error: number doesn't have a .length property
```

A common trap: a constrained type parameter still promises to return *that exact type*, not just anything matching the constraint:

```typescript
function minimumLength<Type extends { length: number }>(obj: Type, minimum: number): Type {
  if (obj.length >= minimum) {
    return obj;
  } else {
    return { length: minimum };
    // Error: { length: number } is not assignable to Type
    // (Type could be something more specific than { length: number })
  }
}
```

### Three Rules for Writing Good Generic Functions

1. **Push type parameters down** infer the return type from the parameter, don't force it to `any`:

   ```typescript
   // Good - return type is Type
   function firstElement1<Type>(arr: Type[]) {
     return arr[0];
   }

   // Bad - return type collapses to any
   function firstElement2<Type extends any[]>(arr: Type) {
     return arr[0];
   }
   ```

2. **Use fewer type parameters** every parameter should relate two or more values; if it only appears once, it's not doing anything:

   ```typescript
   // Good
   function filter1<Type>(arr: Type[], func: (arg: Type) => boolean): Type[] {
     return arr.filter(func);
   }

   // Unnecessary - Func doesn't relate to anything else
   function filter2<Type, Func extends (arg: Type) => boolean>(arr: Type[], func: Func): Type[] {
     return arr.filter(func);
   }
   ```

3. **Type parameters should appear twice** if a parameter is only used once, you almost certainly wanted a concrete type instead:

   ```typescript
   // Bad - Str is used exactly once, gains nothing over `string`
   function greet<Str extends string>(s: Str) {
     console.log("Hello, " + s);
   }

   // Just this
   function greet(s: string) {
     console.log("Hello, " + s);
   }
   ```

---

## Optional Parameters

```typescript
function f(x?: number) {
  // x: number | undefined
}

f();   // OK
f(10); // OK
```

Give a default instead of leaving it optional when you want a concrete fallback rather than `undefined`:

```typescript
function f(x = 10) {
  // x: number (undefined is replaced by 10 before the body runs)
}
```

**Don't** mark a callback parameter optional just because you *could*  only if the caller genuinely might not receive it. Marking it optional when you always pass it forces every caller to needlessly guard against `undefined`.

---

## Function Overloads

For a function callable multiple genuinely different ways, write **overload signatures** above a single implementation:

```typescript
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}

makeDate(12345678);  // OK
makeDate(5, 5, 5);    // OK
makeDate(1, 3);
// Error: no overload expects exactly 2 arguments
```

Unlike C# overloading (separate methods, each with its own body), TypeScript overloads share **one implementation** whose signature stays hidden from callers only the overload signatures above it are visible. The implementation signature must be compatible with every overload signature, or the compiler rejects it.

**Prefer a union parameter over overloads** whenever the underlying logic is genuinely the same overloads can't be called with a value whose type is only known at runtime as a union:

```typescript
// With overloads, this doesn't work: len(Math.random() > 0.5 ? "hello" : [0])
function len(s: string): number;
function len(arr: any[]): number;
function len(x: any) {
  return x.length;
}

// Better: one signature, callable with the union directly
function len(x: any[] | string) {
  return x.length;
}
```

---

## Declaring `this`

```typescript
interface DB {
  filterUsers(filter: (this: User) => boolean): User[];
}

db.filterUsers(function (this: User) {
  return this.admin;
});
```

A `this` parameter (only legal as the *first* parameter) documents and enforces what `this` must be inside the function body it's erased like any other parameter type, never actually passed by the caller. Must use `function`, not an arrow function, for `this` binding to apply at all see [[docs/typescript/oop/Classes#this at Runtime\|this at Runtime in Classes]] for why.

---

## Other Types Worth Knowing

| Type | Meaning |
|---|---|
| `void` | A function that returns nothing meaningful. Not the same as `undefined`. |
| `object` | Any non-primitive value — not `string`/`number`/`bigint`/`boolean`/`symbol`/`null`/`undefined`. Always lowercase; different from `Object` or `{}`. |
| `unknown` | Like `any`, but safe — nothing can be done with an `unknown` value until you narrow it. Prefer this over `any` for values of genuinely unknown shape (e.g. `JSON.parse` results). |
| `never` | A value that can never occur — the return type of a function that always throws, or an unreachable branch. See [[docs/typescript/fundamentals/Narrowing\|Narrowing]] for exhaustiveness checks. |
| `Function` | The global type for "any function value." Callable with anything, returns `any` — usually too loose; prefer a specific function type expression like `() => void`. |

```typescript
function f1(a: any) {
  a.b(); // OK - no safety
}

function f2(a: unknown) {
  a.b();
  // Error: 'a' is of type 'unknown' - must narrow first
}
```

---

## Rest Parameters and Spread Arguments

```typescript
function multiply(n: number, ...m: number[]) {
  return m.map((x) => n * x);
}

multiply(10, 1, 2, 3, 4); // [10, 20, 30, 40]
```

```typescript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
arr1.push(...arr2);
```

TypeScript treats a spread array as mutable by default; use `as const` when you need it inferred as a fixed-length tuple instead:

```typescript
const args = [8, 5] as const;
Math.atan2(...args); // OK - inferred as a 2-tuple, matches atan2's signature
```

## Parameter Destructuring

```typescript
type ABC = { a: number; b: number; c: number };

function sum({ a, b, c }: ABC) {
  console.log(a + b + c);
}
```

---

## Assignability of `void`-Returning Functions

A function *typed* to return `void` is allowed to be implemented by something that returns a value the value is simply ignored. This is what makes patterns like `Array.prototype.push` (returns `number`) legally assignable to a `void`-returning callback:

```typescript
type voidFunc = () => void;

const f1: voidFunc = () => true; // OK - return value discarded

const src = [1, 2, 3];
const dst: number[] = [0];
src.forEach((el) => dst.push(el)); // push returns number, but void is accepted here
```

The one exception: a function **literally declared** with a `void` return type must not itself contain a `return` with a value:

```typescript
function f(): void {
  return true;
  // Error: Type 'boolean' is not assignable to type 'void'.
}
```

---

## Key Takeaways

1. A function type expression `(a: string) => void` is the lightweight way to type a function value; use an object type with a call signature when it also needs its own properties
2. Generic function constraints (`extends`) work like C#'s `where T : X`; follow the three rules (push type parameters down, use fewer of them, make sure each appears twice) to keep generics meaningful
3. TypeScript overloads share one hidden implementation behind multiple public signatures — prefer a union parameter type over overloads when the logic is genuinely shared
4. `unknown` is the safe alternative to `any` same flexibility for callers, but forces narrowing before use
5. A `void`-returning function type accepts any implementation whose return value is simply ignored this is why callbacks like `.forEach()` accept functions that return something

---

## Related Topics

- [[docs/typescript/type-manipulation/TypeScript Generics\|TypeScript Generics]]
- [[docs/typescript/functions-and-objects/Object Types\|Object Types]]
- [[docs/typescript/fundamentals/Narrowing\|Narrowing]]

---

## Source

- [TypeScript Handbook: More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)

---

#typescript #javascript #frontend #functions
