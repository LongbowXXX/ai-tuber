# Few-Shot Chain of Thought (Reasoning)

## Problem

Standard "Chain of Thought" (CoT) instructions ("Think step by step") are often too abstract, leading models to ramble without structure or skip critical reasoning steps.

## Solution

Provide a concrete _example_ of the expected reasoning process within the prompt. This "Few-Shot" approach aligns the model's internal monologue with the desired depth and structure.

## Implementation Steps

1.  **Define Structure**: Create a `<thinking>` block example.
2.  **Show "Good" Pattern**: Demonstrate how to catch an error or weigh options.

## Example Template

```xml
<example_thinking>
User asked: "Refactor the login function."

1.  **Analyze**: I see the `login` function in `auth.ts`. It uses a callback pattern.
2.  **Critique**: Callbacks are outdated. I should use async/await.
3.  **Safety Check**: Are there any existing tests? Yes, `auth.test.ts`. I must ensure they pass.
4.  **Plan**:
    - Update signature to return Promise.
    - Wrap legacy code.
    - Update tests.
</example_thinking>
```

## Benefits

- **Alignment**: The model copies the _logic structure_ of the example.
- **Consistency**: Produces more predictable and high-quality reasoning outputs.
