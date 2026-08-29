---
{"dg-publish":true,"permalink":"/docs/typescript/fundamentals/the-basics/","tags":["typescript","javascript","frontend","fundamentals"]}
---

# The Basics

## Overview

TypeScript is a **static type-checker**: it analyzes your code before it ever runs and flags mistakes that JavaScript would only discover at runtime — or worse, wouldn't catch at all. Think of it the same way a C# compiler catches a type mismatch at build time instead of letting it blow up in production.

```javascript
const message = "Hello World!";
message();
// JavaScript: TypeError: message is not a function (only found when this line runs)
```

```typescript
const message = "hello!";
message();
// TypeScript: Error: This expression is not callable.
// Type 'String' has no call signatures. (caught immediately, while typing)
```

---

## Beyond Crashes: Non-Exception Failures

TypeScript also catches mistakes that JavaScript would silently allow — no crash, just quietly wrong behavior:

```typescript
const user = {
  name: "Daniel",
  age: 26,
};

user.location;
// JavaScript: returns `undefined`, no error
// TypeScript: Error: Property 'location' does not exist on type '{ name: string; age: number; }'
```

This category covers typos (`toLocalLowercase` vs. `toLocaleLowerCase`), forgetting to call a function (`Math.random < 0.5` instead of `Math.random() < 0.5`), and basic logic errors — the kind of thing a code reviewer might catch, except the compiler catches it instantly, every time.

## Types Also Power Your Editor

The same type information that catches errors also drives autocomplete, quick fixes, safe renaming/refactoring, and jump-to-definition — the IDE experience C# developers already take for granted from the CLR's type metadata.

---

## The Compiler: `tsc`

```bash
npm install -g typescript
tsc hello.ts
```

This compiles `hello.ts` into a plain `hello.js` file — TypeScript's job ends at compile time; a browser or Node.js only ever runs the resulting JavaScript.

```typescript
function greet(person, date) {
  console.log(`Hello ${person}, today is ${date}!`);
}
greet("Brendan");
// Error: Expected 2 arguments, but got 1.
```

### TypeScript Still Emits Output by Default — Even With Errors

Unlike a C# build, which refuses to produce a binary when compilation fails, `tsc` emits JavaScript *even when type errors are present*. This is deliberate: it supports gradually migrating an existing JavaScript codebase, where you might know something the type-checker doesn't (yet). To opt into C#-like strictness — refuse to emit when there are errors — use:

```bash
tsc --noEmitOnError hello.ts
```

---

## Explicit Types

Type annotations look similar to C#'s `type name` syntax, just reversed — `name: type`:

```typescript
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Maddison", Date());
// Error: Argument of type 'string' is not assignable to parameter of type 'Date'.
// (calling Date() as a function returns a string; `new Date()` returns a Date object)

greet("Maddison", new Date()); // OK
```

TypeScript infers types whenever it reasonably can, the same way C#'s `var` infers from the right-hand side — you don't need to annotate everything:

```typescript
let msg = "hello there!"; // inferred as string, no annotation needed
```

---

## Types Are Erased at Compile Time

This is the one that surprises C# developers the most: TypeScript types **do not exist at runtime at all**. They're checked, then stripped out entirely during compilation.

```typescript
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
```

compiles to:

```javascript
function greet(person, date) {
  console.log("Hello ".concat(person, ", today is ").concat(date.toDateString(), "!"));
}
```

There's no equivalent of C#'s reified generics or `GetType()` for your own TypeScript types — see [[docs/typescript/TypeScript for OOP Developers\|TypeScript for OOP Developers]] for the fuller structural-vs-nominal contrast this leads to.

## Downleveling

`tsc` can also rewrite modern JavaScript syntax into older syntax for broader browser support — for example, template literals (ES2015) become string concatenation for ES5:

```javascript
// ES2015 source
`Hello ${person}, today is ${date.toDateString()}!`;

// Downleveled to ES5
"Hello ".concat(person, ", today is ").concat(date.toDateString(), "!");
```

```bash
tsc --target es2015 hello.ts
```

The default target is old (ES5-level) for maximum compatibility, but most environments today support ES2015+ directly.

---

## Strictness Settings

TypeScript's type-checking is opt-in and gradual — you dial it up per project. The `strict` flag turns on every strictness check at once:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### `noImplicitAny`

Without this, a parameter TypeScript can't infer silently becomes `any` — the "turn off type-checking for this value" escape hatch. This flag makes that an error instead of a silent fallback:

```typescript
function fn(x) {
  // Error (with noImplicitAny): Parameter 'x' implicitly has an 'any' type.
  return x.flip();
}

function fn(x: string) {
  // Fixed: explicit type
  return x.flip(); // now a real error: string has no .flip()
}
```

### `strictNullChecks`

Without this flag, `null` and `undefined` are assignable to *any* type — similar to reference types in C# before nullable reference types were introduced. With it on, you must explicitly account for `null`/`undefined`, the same way C#'s nullable reference types (`string?`) force you to check before dereferencing:

```typescript
// Without strictNullChecks: allowed, dangerous
let value: string = null;

// With strictNullChecks: caught
// Error: Type 'null' is not assignable to type 'string'.
```

Turning this on is one of the highest-value strictness settings available — null/undefined bugs are a famously common source of runtime crashes in untyped JS.

---

## Key Takeaways

1. TypeScript catches both crashes *and* silent logic errors (like typo'd property access) before code ever runs
2. `tsc` compiles `.ts` → `.js` and, by default, still emits output even with type errors — use `--noEmitOnError` for C#-style strictness
3. Types can usually be inferred; annotate when TypeScript can't infer or when you want to lock down an API's shape
4. **Types are fully erased at compile time** — there is no runtime type information for your own TypeScript types, unlike C#'s reified generics
5. `strict` (and specifically `noImplicitAny` and `strictNullChecks`) is the closest TypeScript gets to C#'s baseline safety — turn it on for new projects

---

## Related Topics

- [[docs/typescript/TypeScript for OOP Developers\|TypeScript for OOP Developers]]
- [[docs/typescript/fundamentals/Everyday Types\|Everyday Types]]
- [[docs/typescript/fundamentals/Narrowing\|Narrowing]]

---

## Source

- [TypeScript Handbook: The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)

---

#typescript #javascript #frontend #fundamentals
