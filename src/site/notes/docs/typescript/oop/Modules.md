---
{"dg-publish":true,"permalink":"/docs/typescript/oop/modules/","tags":["typescript","javascript","frontend","modules"]}
---

# Modules

## Overview

C# organizes code into namespaces and assemblies, resolved by the compiler and the CLR. JavaScript's story is messier: there's no single, original module system, and TypeScript has to interoperate with several that evolved over time. This note covers what a module actually is in TS/JS, the modern ES Module syntax you should default to, and how it relates to older CommonJS code you'll still run into.

---

## What Makes a File a Module

Any file with a top-level `import` or `export` is a **module**. A file with *neither* is treated as a plain **script** its top-level declarations leak into the shared global scope, the same as classic pre-module JavaScript `<script>` tags.

```typescript
// no import/export anywhere in this file → script, not a module
// its declarations are visible everywhere, like C# code outside any namespace
```

If you want a file treated as a module purely for its scoping behavior, but it genuinely has nothing to export, add:

```typescript
export {};
```

This turns the file into "a module that exports nothing" enough to give it its own private scope.

Modules execute in **their own scope**, nothing declared inside is visible outside unless explicitly `export`ed, and nothing from another module is visible unless explicitly `import`ed. This is closer to C#'s per-file `using` + namespace model than to a script's shared global scope.

---

## ES Module Syntax (the Modern Default)

### Named Exports

```typescript
// maths.ts
export var pi = 3.14;
export let squareTwo = 1.41;
export const phi = 1.61;
export class RandomNumberGenerator {}
export function absolute(num: number) {
  return num < 0 ? num * -1 : num;
}
```

```typescript
// app.ts
import { pi, phi, absolute } from "./maths.js";
```

> **Note:** even though the source file is `maths.ts`, the import path uses `.js`. TypeScript's module resolution expects the path you'd use once compiled, not the source extension.

### Default Exports

One "main" export per file, imported without braces:

```typescript
// hello.ts
export default function helloWorld() {
  console.log("Hello, world!");
}
```

```typescript
import helloWorld from "./hello.js";
helloWorld();
```

### Renaming, Mixing, and Namespace Imports

```typescript
import { pi as π } from "./maths.js"; // rename on import

import RandomNumberGenerator, { pi as π } from "./maths.js"; // default + named together

import * as math from "./maths.js"; // everything, under one namespace object
math.pi;

import "./maths.js"; // side-effect only - runs the module, imports nothing
```

---

## Exporting and Importing Types

TypeScript types can be exported and imported exactly like values, right alongside them:

```typescript
// animal.ts
export type Cat = { breed: string; yearOfBirth: number };
export interface Dog {
  breeds: string[];
  yearOfBirth: number;
}

// app.ts
import { Cat, Dog } from "./animal.js";
type Animals = Cat | Dog;
```

`import type` restricts an import to types only useful for signaling intent, and for guaranteeing the import is fully erased at compile time (no runtime dependency on the module at all):

```typescript
// valid.ts
import type { Cat, Dog } from "./animal.js";
export type Animals = Cat | Dog;

// app.ts
import type { createCatName } from "./animal.js";
const name = createCatName();
// Error: 'createCatName' cannot be used as a value because it was imported using 'import type'.
```

TypeScript 4.5+ also allows marking individual names inline, mixing value and type imports in one statement:

```typescript
import { createCatName, type Cat, type Dog } from "./animal.js";
```

---

## CommonJS (Older Node.js Code)

Before ES Modules were standardized, Node.js used **CommonJS** you'll still encounter this constantly in older packages and some Node tooling.

```typescript
// exporting
function absolute(num: number) {
  return num < 0 ? num * -1 : num;
}

module.exports = {
  pi: 3.14,
  absolute,
};
```

```typescript
// importing
const maths = require("./maths");
maths.pi; // any - CommonJS imports aren't automatically typed the way ES imports are

const { squareTwo } = require("./maths");
```

TypeScript also has an ES-Module-syntax spelling that compiles down to a CommonJS `require`, useful when you need CommonJS's exact interop behavior but want to stay in the more modern-looking syntax:

```typescript
import fs = require("fs");
const code = fs.readFileSync("hello.ts", "utf8");
```

The `esModuleInterop` compiler flag smooths over the biggest friction point between the two systems — a mismatch in how default exports are represented and is worth turning on in essentially every project mixing the two.

---

## Compiler Options That Affect Modules

Two separate `tsconfig.json` settings, easy to conflate:

| Option   | Controls                                                                                                                                                       |                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `target` | Which JS language features get downleveled (see [[docs/typescript/fundamentals/The Basics#Downleveling                                                                                      \| Downleveling]]) depends on what your runtime actually supports |
| `module` | What module *loader syntax* gets emitted (`ES2020` import/export, `CommonJS` require/exports, `UMD`, etc.) depends on how the output will actually be consumed |                                                                |

The same TypeScript source, compiled with different `module` settings, produces genuinely different JavaScript e.g. an `import` statement becomes a `require()` call for `commonjs`, or stays as-is for `ES2020`. Which one you need depends entirely on your runtime/bundler, not on anything about the TypeScript code itself.

---

## Module Resolution (Brief)

**Module resolution** is how the compiler turns an import string into an actual file. TypeScript ships two strategies:

- **Node** — mirrors how Node.js itself resolves `require()`/`import` in CommonJS mode, with extra handling for `.ts`/`.d.ts` files. This is the one you want for essentially all modern projects.
- **Classic** — the older default when `module` isn't `commonjs`; kept mainly for backwards compatibility.

Relevant `tsconfig.json` flags: `moduleResolution`, `baseUrl`, `paths`, `rootDirs`.

---

## TypeScript Namespaces

TypeScript's own module system, `namespace`, predates ES Modules and is now legacy most of what it did is now covered natively by ES Modules. You'll still encounter it in older `.d.ts` type-definition files and some DefinitelyTyped packages, but new code should default to ES Modules (`import`/`export`) instead.

---

## Key Takeaways

1. A file with any top-level `import`/`export` is a module (its own scope); a file with neither is a global script — add `export {}` to force module scoping on an otherwise export-less file
2. Default to ES Module syntax (`import`/`export`) for new code it's what the rest of the JavaScript ecosystem is converging on
3. Types import/export exactly like values; `import type` (or an inline `type` prefix) guarantees an import is fully erased, with zero runtime dependency on that module
4. CommonJS (`require`/`module.exports`) is still common in the Node.js ecosystem `esModuleInterop` smooths over its friction with ES Module syntax
5. `target` (which JS features to downlevel) and `module` (which module loader syntax to emit) are two independent `tsconfig.json` settings don't conflate them

---

## Related Topics

- [[docs/typescript/oop/Classes\|Classes]]
- [[docs/typescript/fundamentals/The Basics\|The Basics]]

---

## Source

- [TypeScript Handbook: Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)

---

#typescript #javascript #frontend #modules
