---
{"dg-publish":true,"permalink":"/docs/typescript/type-manipulation/template-literal-types/","tags":["typescript","javascript","frontend","type-manipulation"]}
---

# Template Literal Types

## Overview

A **template literal type** uses the same backtick syntax as a JavaScript template literal string, but in a type position building new string-literal types by concatenating and interpolating other literal types.

```typescript
type World = "world";
type Greeting = `hello ${World}`;
// type Greeting = "hello world"
```

## Interpolating a Union Produces a Union

Interpolate a union instead of a single literal, and you get every possible combination as a new union of string literals:

```typescript
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";

type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
// "welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id"
```

Multiple interpolated positions **cross-multiply** every combination:

```typescript
type Lang = "en" | "ja" | "pt";
type LocaleMessageIDs = `${Lang}_${AllLocaleIDs}`;
// "en_welcome_email_id" | "en_email_heading_id" | ... | "pt_footer_sendoff_id"
// (3 langs × 4 IDs = 12 literal types, generated, not hand-written)
```

---

## Real Use Case: Deriving Event Names From an Object's Keys

This is where template literal types earn their keep deriving a *new, correct-by-construction* set of string literals directly from another type's shape, using [[docs/typescript/type-manipulation/Keyof Type Operator\|keyof]]:

```typescript
type PropEventSource<Type> = {
  on(eventName: `${string & keyof Type}Changed`, callback: (newValue: any) => void): void;
};

declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>;

const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26,
});

person.on("firstNameChanged", () => {}); // OK

person.on("firstName", () => {});
// Error: not assignable to "firstNameChanged" | "lastNameChanged" | "ageChanged"

person.on("frstNameChanged", () => {});
// Error: typo caught at compile time
```

Both mistakes above using the raw property name, and a typo in the generated event name are compile errors. Neither would be caught by a plain `eventName: string` parameter.

### Making the Callback's Argument Type Match Too

Push the derivation one step further with a generic `Key`, and the callback parameter's type is inferred correctly per event, using [[docs/typescript/type-manipulation/Indexed Access Types\|an indexed access type]]:

```typescript
type PropEventSource<Type> = {
  on<Key extends string & keyof Type>(
    eventName: `${Key}Changed`,
    callback: (newValue: Type[Key]) => void
  ): void;
};

person.on("firstNameChanged", (newName) => {
  // newName: string
  console.log(`new name is ${newName.toUpperCase()}`);
});

person.on("ageChanged", (newAge) => {
  // newAge: number
  if (newAge < 0) {
    console.warn("warning! negative age");
  }
});
```

Three techniques from this section stack here: a template literal builds the event name, `keyof` supplies the valid key set, and an indexed access type (`Type[Key]`) supplies the matching callback parameter type all inferred from one call to `makeWatchedObject`.

---

## Built-In String Manipulation Types

Four intrinsic types (backed directly by JS's own string methods, not reimplemented in the type checker) useful inside a template literal's interpolated position, as in the [[docs/typescript/type-manipulation/Mapped Types#Key Remapping with as\|Mapped Types key-remapping example]]:

```typescript
type Greeting = "Hello, world";

type ShoutyGreeting = Uppercase<Greeting>;   // "HELLO, WORLD"
type QuietGreeting = Lowercase<Greeting>;    // "hello, world"
type Greeting2 = Capitalize<"hello, world">; // "Hello, world"
type Greeting3 = Uncapitalize<"HELLO WORLD">;// "hELLO WORLD"
```

```typescript
type ASCIICacheKey<Str extends string> = `ID-${Uppercase<Str>}`;
type MainID = ASCIICacheKey<"my_app">;
// type MainID = "ID-MY_APP"
```

> **Note:** these are not locale-aware they call the plain, non-locale JS string methods internally.

---

## Key Takeaways

1. Template literal types use JS's own template-string syntax to build new string-literal types at the type level
2. Interpolating a union produces a union of every literal combination multiple interpolated positions cross-multiply
3. Deriving event names (or similar string patterns) from `keyof Type` catches both wrong-name and typo mistakes at compile time something a plain `string` parameter can't do
4. `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` are built-in, non-locale-aware string transforms usable inside a template literal type

---

## Related Topics

- [[docs/typescript/type-manipulation/Creating Types from Types\|Creating Types from Types]]
- [[docs/typescript/type-manipulation/Keyof Type Operator\|Keyof Type Operator]]
- [[docs/typescript/type-manipulation/Mapped Types\|Mapped Types]]

---

## Source

- [TypeScript Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)

---

#typescript #javascript #frontend #type-manipulation
