---
{"dg-publish":true,"permalink":"/docs/typescript/oop/classes/","tags":["typescript","javascript","frontend","oop","classes"]}
---

# Classes

## Overview

TypeScript classes look almost identical to C# classes on the surface fields, constructors, methods, `public`/`private`/`protected`, `static`, `abstract`, `extends`, `implements`. The syntax is genuinely the most C#-familiar part of the whole language. The differences that matter are underneath: how `this` binds, how visibility is actually enforced, and how class compatibility is checked — see [[docs/typescript/TypeScript for OOP Developers\|TypeScript for OOP Developers]] for the structural-typing background this all builds on.

---

## Fields

```typescript
class Point {
  x: number;
  y: number;
}

const pt = new Point();
pt.x = 0;
pt.y = 0;
```

Give a field an initializer and it runs automatically at construction, same as a C# field initializer:

```typescript
class Point {
  x = 0;
  y = 0;
}

const pt = new Point();
console.log(`${pt.x}, ${pt.y}`); // 0, 0
```

With `strictPropertyInitialization` on, every field must be initialized in the constructor or have an initializer TypeScript's version of definite assignment. Bypass it (rarely, deliberately) with `!`:

```typescript
class OKGreeter {
  name!: string; // "trust me, this gets set some other way"
}
```

### `readonly`

```typescript
class Greeter {
  readonly name: string = "world";

  constructor(otherName?: string) {
    if (otherName !== undefined) {
      this.name = otherName; // OK - still inside the constructor
    }
  }

  err() {
    this.name = "not ok";
    // Error: Cannot assign to 'name' because it is a read-only property.
  }
}
```

Same shallow-only guarantee as `readonly` on an [[docs/typescript/functions-and-objects/Object Types#readonly Properties\|object type]] it protects the binding, not anything nested inside the value.

---

## Constructors

```typescript
class Point {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
```

Constructors support overload signatures the same way [[docs/typescript/functions-and-objects/Functions#Function Overloads\|ordinary functions]] do several public signatures, one shared implementation:

```typescript
class Point {
  x: number = 0;
  y: number = 0;

  constructor(x: number, y: number);
  constructor(xy: string);
  constructor(x: string | number, y: number = 0) {
    // implementation
  }
}
```

A derived class **must** call `super()` before touching `this` TypeScript enforces this at compile time, C# enforces the equivalent (implicit or explicit base constructor call) too, just without needing you to write it out:

```typescript
class Base {
  k = 4;
}

class Derived extends Base {
  constructor() {
    console.log(this.k);
    // Error: 'super' must be called before accessing 'this'
    super();
  }
}
```

---

## Methods, Getters, and Setters

```typescript
class Point {
  x = 10;
  y = 10;

  scale(n: number): void {
    this.x *= n;
    this.y *= n;
  }
}
```

> Inside a method body, a bare name always resolves to the *enclosing lexical scope*, never a class member you must write `this.x`, not `x`, to reach a field. This trips up C# developers occasionally, since C# resolves an unqualified member name against the instance automatically.

```typescript
class C {
  _length = 0;

  get length() {
    return this._length;
  }

  set length(value) {
    this._length = value;
  }
}
```

A property with only a `get` (no `set`) is automatically `readonly` from the outside. Since TS 4.3, the getter and setter don't have to agree on type:

```typescript
class Thing {
  _size = 0;

  get size(): number {
    return this._size;
  }

  set size(value: string | number | boolean) {
    const num = Number(value);
    this._size = Number.isFinite(num) ? num : 0;
  }
}
```

---

## Class Heritage

### `implements`

```typescript
interface Pingable {
  ping(): void;
}

class Sonar implements Pingable {
  ping() {
    console.log("ping!");
  }
}

class Ball implements Pingable {
  pong() {
    console.log("pong!");
  }
  // Error: Class 'Ball' incorrectly implements interface 'Pingable'.
  // Property 'ping' is missing.
}
```

`implements` is purely a compile-time check same as C#'s `: IInterface`, it doesn't add any runtime behavior or change how the class compiles, it just verifies the shape. A class can `implements` multiple interfaces at once.

### `extends`

```typescript
class Animal {
  move() {
    console.log("Moving along!");
  }
}

class Dog extends Animal {
  woof(times: number) {
    for (let i = 0; i < times; i++) console.log("woof!");
  }
}

const d = new Dog();
d.move(); // inherited
d.woof(3);
```

### Overriding Methods

```typescript
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  greet(name?: string) {
    if (name === undefined) {
      super.greet(); // same idea as C#'s base.Greet()
    } else {
      console.log(`Hello, ${name.toUpperCase()}`);
    }
  }
}
```

A derived class's override must remain a valid substitute for the base the same Liskov substitution principle C# enforces, just checked structurally instead of via an explicit `override` keyword requirement.

### Initialization Order

JavaScript (and therefore TypeScript) always initializes in this order:

1. Base class fields
2. Base class constructor body
3. Derived class fields
4. Derived class constructor body

This means a **base constructor never sees derived-class field values** they haven't been assigned yet when the base constructor runs. This is a genuine gotcha coming from C#, where field initializer order and constructor chaining have different (and less surprising) guarantees.

### Inheriting Built-ins

Subclassing a built-in like `Error` needs a manual prototype fix-up for older compilation targets:

```typescript
class MsgError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, MsgError.prototype); // ES5-target compatibility fix-up
  }
}
```

---

## Member Visibility

Spelled the same as C#, enforced differently this is where TypeScript's compile-time-only nature shows up most concretely.

| Modifier | Visible from | Runtime enforcement |
|---|---|---|
| `public` (default) | Anywhere | N/A — always accessible |
| `protected` | The class and its subclasses | None — erased at compile time |
| `private` | The declaring class only | None — erased at compile time |

```typescript
class Greeter {
  public greet() {
    console.log("Hello, " + this.getName());
  }
  protected getName() {
    return "hi";
  }
}

class SpecialGreeter extends Greeter {
  public howdy() {
    console.log("Howdy, " + this.getName()); // OK - protected, same hierarchy
  }
}

const g = new SpecialGreeter();
g.getName();
// Error: getName is protected
```

`protected` members can't be reached across *sibling* subclasses, even though both ultimately derive from the same base:

```typescript
class Base {
  protected x = 1;
}
class Derived1 extends Base {
  protected x = 5;
}
class Derived2 extends Base {
  f2(other: Derived1) {
    other.x = 10;
    // Error: can't reach Derived1's protected x from Derived2
  }
}
```

### `private` Is Compile-Time Only

This is the part with no real C# analogue. TypeScript's `private` is enforced by the type-checker, but the emitted JavaScript has no actual privacy bracket-notation access sails right past it at runtime:

```typescript
class Base {
  private x = 0;
}

const b = new Base();
console.log(b.x);       // Error at compile time
console.log(b["x"]);    // No error at all - works fine at runtime
```

For genuine, runtime-enforced privacy (equivalent to C#'s actual `private`), use JavaScript's native `#` private fields instead these are enforced by the JS engine itself, not just the type-checker:

```typescript
class MySafe {
  #secretKey = 12345;
}

const s = new MySafe();
console.log(s.secretKey);   // Compile error - no such property
console.log(s["secretKey"]); // Also fails - #-fields aren't reachable via bracket notation either
```

> **Rule of thumb:** use `private` for API design and code review discipline; use `#` when you need an actual runtime guarantee.

---

## Static Members

```typescript
class MyClass {
  static x = 0;
  static printX() {
    console.log(MyClass.x);
  }
}

MyClass.printX();
```

Static members support the same visibility modifiers, and are inherited by subclasses, same as C#:

```typescript
class Base {
  static getGreeting() {
    return "Hello world";
  }
}
class Derived extends Base {
  myGreeting = Derived.getGreeting(); // inherited static
}
```

TypeScript has no "static class" construct there's no need for one, since [[docs/typescript/TypeScript for OOP Developers\|TypeScript for OOP Developers]] plain functions and object literals already cover what a C# static utility class is for:

```typescript
// Instead of a static class:
function doSomething() {}
const MyHelperObject = {
  doSomething() {},
};
```

---

## Generic Classes

```typescript
class Box<Type> {
  contents: Type;
  constructor(value: Type) {
    this.contents = value;
  }
}

const b = new Box("hello!"); // Box<string>, inferred
```

See [[docs/typescript/type-manipulation/TypeScript Generics\|TypeScript Generics]] for the general rules the one class-specific gotcha: **static members can't reference the class's type parameter.** There's only one copy of a static member, shared across every instantiation of the generic class, so it can't be tied to any one `Type`:

```typescript
class Box<Type> {
  static defaultValue: Type;
  // Error: static members cannot reference class type parameters
}
```

---

## `this` at Runtime

JavaScript's `this` binding depends entirely on *how* a method is called not on where it's defined. This is the single biggest `this`-related surprise coming from C#, where `this` always just means the current instance, full stop:

```typescript
class MyClass {
  name = "MyClass";
  getName() {
    return this.name;
  }
}

const c = new MyClass();
const obj = {
  name: "obj",
  getName: c.getName, // detached from its original instance
};

console.log(obj.getName()); // "obj" - NOT "MyClass"
```

### Fix 1: Arrow Function Fields

An arrow function field captures `this` lexically at the point it's defined (inside the class), not at the point it's called so it can't be reassigned to a different `this`:

```typescript
class MyClass {
  name = "MyClass";
  getName = () => {
    return this.name;
  };
}

const c = new MyClass();
const g = c.getName;
console.log(g()); // "MyClass" - correct now
```

Trade-off: each instance gets its own copy of the function (a small memory cost per instance), and it can't call `super` the way a real method can.

### Fix 2: A `this` Parameter

Declare the required `this` type as the function's first parameter this is erased at compile time, purely a type-checking annotation, but it means detaching the method now produces a *compile* error instead of a silent runtime bug:

```typescript
class MyClass {
  name = "MyClass";
  getName(this: MyClass) {
    return this.name;
  }
}

const c = new MyClass();
c.getName(); // OK

const g = c.getName;
g();
// Error: The 'this' context of type 'void' is not assignable to method's 'this' of type 'MyClass'.
```

---

## `this` Types

The special type `this` refers to "whatever the current, dynamic subclass actually is" not literally the declaring class. It's how methods stay correctly typed after being inherited:

```typescript
class Box {
  contents = "";
  set(value: string) {
    this.contents = value;
    return this;
  }
}

class ClearableBox extends Box {
  clear() {
    this.contents = "";
  }
}

const a = new ClearableBox();
const b = a.set("hello"); // b: ClearableBox, not Box - .set() returned `this`
```

Used as a parameter type, `this` requires the argument to be an instance of the *exact same* runtime subclass stricter than requiring the base type:

```typescript
class Box {
  content = "";
  sameAs(other: this) {
    return other.content === this.content;
  }
}

class DerivedBox extends Box {
  otherContent = "?";
}

const base = new Box();
const derived = new DerivedBox();
derived.sameAs(base);
// Error: Box is not assignable to DerivedBox's `this`
```

### `this`-Based Type Guards

Same idea as [[docs/typescript/fundamentals/Narrowing#User-Defined Type Guards (Type Predicates)\|user-defined type predicates]], scoped to a class hierarchy `this is Type` as a method's return type narrows the caller's reference:

```typescript
class FileSystemObject {
  constructor(public path: string, private networked: boolean) {}
  isFile(): this is FileRep {
    return this instanceof FileRep;
  }
  isDirectory(): this is Directory {
    return this instanceof Directory;
  }
}

class FileRep extends FileSystemObject {
  constructor(path: string, public content: string) {
    super(path, false);
  }
}
class Directory extends FileSystemObject {
  children: FileSystemObject[] = [];
}

const fso: FileSystemObject = new FileRep("foo/bar.txt", "foo");

if (fso.isFile()) {
  fso.content; // narrowed to FileRep
} else if (fso.isDirectory()) {
  fso.children; // narrowed to Directory
}
```

---

## Parameter Properties

A shorthand unique to TypeScript, with no C# equivalent: prefix a constructor parameter with a visibility modifier, and it's declared *and* assigned as a class field automatically no separate field declaration, no manual `this.x = x` line:

```typescript
class Params {
  constructor(
    public readonly x: number,
    protected y: number,
    private z: number
  ) {
    // body can be empty - the fields are already declared and assigned
  }
}

const a = new Params(1, 2, 3);
a.x; // OK - public
a.z;
// Error: private
```

---

## Abstract Classes and Members

```typescript
abstract class Base {
  abstract getName(): string;

  printName() {
    console.log("Hello, " + this.getName());
  }
}

new Base();
// Error: Cannot create an instance of an abstract class.

class Derived extends Base {
  getName() {
    return "world";
  }
}

new Derived().printName(); // OK
```

Same concept and same keyword as C#'s `abstract` a base class that defines shape without full implementation, and can't be instantiated directly. Forgetting to implement an abstract member is a compile error, same as C#.

An **abstract construct signature** `new () => Base` accepts any concrete (non-abstract) subclass's constructor, while rejecting the abstract base itself:

```typescript
function greet(ctor: new () => Base) {
  new ctor().printName();
}

greet(Derived); // OK
greet(Base);
// Error: cannot pass an abstract constructor to a parameter expecting a concrete one
```

---

## Class Relationships Are Structural

The single biggest departure from C#, worth repeating from [[docs/typescript/TypeScript for OOP Developers\|TypeScript for OOP Developers]] one more time in concrete class form: TypeScript compares classes by their **members**, not by declared inheritance. Two classes with identical shape are interchangeable even with zero shared ancestry:

```typescript
class Point1 {
  x = 0;
  y = 0;
}
class Point2 {
  x = 0;
  y = 0;
}

const p: Point1 = new Point2(); // OK - same shape, no relationship declared
```

An empty class is therefore a supertype of *everything*  it requires zero members, so every value satisfies it:

```typescript
class Empty {}

function fn(x: Empty) {
  // nothing usable on x
}

fn(window); // OK
fn({});     // OK
fn(fn);     // OK
```

---

## Key Takeaways

1. TypeScript class *syntax* (fields, constructors, `extends`/`implements`, `abstract`, `static`) closely mirrors C#  the differences are in what's enforced at runtime, not what's written
2. `public`/`protected`/`private` are **compile-time only**  bracket-notation access bypasses `private` at runtime; use JS's native `#` fields when you need real, engine-enforced privacy
3. `this` binds based on *how* a method is called, not where it's defined use an arrow-function field or an explicit `this` parameter to avoid it silently detaching
4. Parameter properties (`constructor(public x: number)`) are a TypeScript-only shorthand with no C# equivalent  declares and assigns a field in one place
5. Two classes with identical members are mutually assignable with **zero** declared relationship TypeScript compares classes structurally, same as any other type

---

## Related Topics

- [[docs/typescript/TypeScript for OOP Developers\|TypeScript for OOP Developers]]
- [[docs/typescript/type-manipulation/TypeScript Generics\|TypeScript Generics]]
- [[docs/typescript/functions-and-objects/Functions\|Functions]]
- [[docs/typescript/oop/Modules\|Modules]]
- [[docs/csharp/oop/Classes and OOP Concepts\|C# Classes and OOP Concepts]]
- [[docs/csharp/oop/Interfaces, Constructors, and Dependency Injection\|C# Interfaces, Constructors, and Dependency Injection]]

---

## Source

- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)

---

#typescript #javascript #frontend #oop #classes
