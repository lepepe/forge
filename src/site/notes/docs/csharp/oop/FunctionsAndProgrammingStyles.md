---
{"dg-publish":true,"permalink":"/docs/csharp/oop/functions-and-programming-styles/","tags":["oop","csharp","functions","functional-programming","imperative-programming"]}
---

# Functions and Programming Styles in C#

## Functions in C#

A **function** is a reusable block of code that performs a specific task. Think of it like a recipe — you give it ingredients (inputs), it follows steps, and gives you a result (output). Functions help you organize code, avoid repetition, and make programs easier to read and maintain.

In C#, **functions** are typically called **methods** when defined inside a class.

```csharp
// Method definition
int Add(int a, int b)
{
    return a + b;
}
```

## Imperative vs Functional Programming

### Imperative Style

**Imperative programming** is like giving someone directions: "Walk 10 steps, turn left, open the door." You tell the computer exactly *what to do* and *in what order*. It's the traditional way of programming where you control every step.

Focuses on **how** to do something — step-by-step instructions that change state.

```csharp
// Calculate sum of even numbers
List<int> numbers = new List<int> { 1, 2, 3, 4, 5, 6 };
int sum = 0;

for (int i = 0; i < numbers.Count; i++)
{
    if (numbers[i] % 2 == 0)
    {
        sum += numbers[i];
    }
}
// sum = 12
```

**Characteristics:**
- Uses loops (`for`, `while`, `foreach`)
- Modifies variables (mutable state)
- Explicit control flow
- Tells the computer *how* to do it

### Functional Style

**Functional programming** is like describing what you want: "Give me all the ripe apples from this basket." You don't explain *how* to check each apple — you just describe the result you want. The computer figures out the steps.

Focuses on **what** to do — describes the result using expressions and transformations.

```csharp
// Same calculation, functional style
List<int> numbers = new List<int> { 1, 2, 3, 4, 5, 6 };

int sum = numbers
    .Where(n => n % 2 == 0)
    .Sum();
// sum = 12
```

**Characteristics:**
- Uses LINQ and lambda expressions
- Avoids changing state (immutable)
- Declarative — describes *what* you want
- Chains method calls (fluent syntax)

### Key Differences

| Aspect | Imperative | Functional |
|--------|------------|------------|
| Focus | How to do it | What to do |
| State | Mutable | Immutable |
| Control | Loops, conditionals | Expressions, LINQ |
| Style | Step-by-step | Declarative |

## Lambda Expressions

Anonymous functions used in functional style:

```csharp
// Lambda syntax
Func<int, int> square = x => x * x;
Console.WriteLine(square(5));  // 25

// With multiple parameters
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine(add(3, 4));  // 7

// In LINQ
numbers.Where(n => n > 5);
numbers.Select(n => n * 2);
```

## Common LINQ Methods

```csharp
List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };

numbers.Where(n => n > 2)          // Filter: [3, 4, 5]
numbers.Select(n => n * 2)         // Transform: [2, 4, 6, 8, 10]
numbers.Sum()                      // Aggregate: 15
numbers.Average()                  // Aggregate: 3
numbers.First()                    // First element: 1
numbers.Any(n => n > 3)            // Check: true
numbers.All(n => n > 0)            // Check: true
numbers.OrderBy(n => n)            // Sort ascending
numbers.OrderByDescending(n => n)  // Sort descending
```

## Combining Both Styles

C# supports both — use what fits best:

```csharp
// Mixed approach
var results = new List<string>();

foreach (var item in data.Where(x => x.IsActive))
{
    results.Add(ProcessItem(item));
}
```

## When to Use Each

| Use Imperative When | Use Functional When |
|---------------------|---------------------|
| Performance is critical | Readability matters |
| Complex control flow needed | Data transformations |
| Working with I/O or side effects | Filtering and mapping |
| State changes are necessary | Chaining operations |
