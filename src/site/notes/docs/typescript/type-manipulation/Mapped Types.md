---
{"dg-publish":true,"permalink":"/docs/typescript/type-manipulation/mapped-types/","tags":["typescript","javascript","frontend","type-manipulation"]}
---

# Mapped Types

## Overview

A **mapped type** builds a new object type by transforming every property of an existing one walking its keys (usually via [[docs/typescript/type-manipulation/Keyof Type Operator\|keyof]]) and applying the same rule to each.

```typescript
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};

type Features = {
  darkMode: () => void;
  newUserProfile: () => void;
};

type FeatureOptions = OptionsFlags<Features>;
// { darkMode: boolean; newUserProfile: boolean }
```

Nothing here is written per-property add a new method to `Features` and `FeatureOptions` picks it up automatically, no manual sync required.

---

## Mapping Modifiers: `readonly` and `?`

A mapped type can add or strip the `readonly` and `?` modifiers as it maps, using `+`/`-` prefixes (`+` is the default and can be omitted):

```typescript
// Strip readonly from every property
type CreateMutable<Type> = {
  -readonly [Property in keyof Type]: Type[Property];
};

// Strip optionality from every property (make everything required)
type Concrete<Type> = {
  [Property in keyof Type]-?: Type[Property];
};
```

These are exactly the shape of TypeScript's built-in `Readonly<T>`, `Partial<T>`, and `Required<T>` utility types worth knowing they're just mapped types themselves, nothing magic.

---

## Key Remapping with `as`

Since TypeScript 4.1, a mapped type can rename each resulting property, not just retype it combine with [[docs/typescript/type-manipulation/Template Literal Types\|Template Literal Types]] to derive new property *names* from the originals:

```typescript
type Getters<Type> = {
  [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property];
};

interface Person {
  name: string;
  age: number;
  location: string;
}

type LazyPerson = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
//   getLocation: () => string;
// }
```

Mapping a key to `never` **drops it** from the result entirely the pattern for filtering keys out of a mapped type:

```typescript
type RemoveKindField<Type> = {
  [Property in keyof Type as Exclude<Property, "kind">]: Type[Property];
};

interface Circle {
  kind: "circle";
  radius: number;
}

type KindlessCircle = RemoveKindField<Circle>;
// { radius: number }
```

---

## Combined with Conditional Types

Mapped types and [[docs/typescript/type-manipulation/Conditional Types\|Conditional Types]] compose naturally branch on each property's own type while mapping over all of them:

```typescript
type ExtractPII<Type> = {
  [Property in keyof Type]: Type[Property] extends { pii: true } ? true : false;
};

type DBFields = {
  id: { format: "incrementing" };
  name: { type: string; pii: true };
};

type ObjectsNeedingGDPRDeletion = ExtractPII<DBFields>;
// { id: false; name: true }
```

---

## Key Takeaways

1. A mapped type transforms every property of an existing type in one declaration `{ [Property in keyof Type]: NewType }` instead of writing each property by hand
2. `+`/`-` prefixes on `readonly` and `?` add or strip those modifiers during the map; TypeScript's built-in `Readonly<T>`/`Partial<T>`/`Required<T>` are just mapped types using exactly this
3. Key remapping with `as` (TS 4.1+) can rename or entirely drop (map to `never`) a property while mapping
4. Mapped types compose with `keyof`, indexed access, conditional types, and template literal types most real-world type utilities use two or three of these together

---

## Related Topics

- [[docs/typescript/type-manipulation/Creating Types from Types\|Creating Types from Types]]
- [[docs/typescript/type-manipulation/Keyof Type Operator\|Keyof Type Operator]]
- [[docs/typescript/type-manipulation/Conditional Types\|Conditional Types]]
- [[docs/typescript/type-manipulation/Template Literal Types\|Template Literal Types]]

---

## Source

- [TypeScript Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)

---

#typescript #javascript #frontend #type-manipulation
