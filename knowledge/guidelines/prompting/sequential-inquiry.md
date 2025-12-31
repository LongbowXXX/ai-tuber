# Sequential Inquiry (Sequential Questioning)

## Problem

When an agent needs to collect information or "interview" the user, sending a large block of multiple questions (e.g., a bulleted list of 5 items) can overwhelm the user. This often leads to missed answers, vague responses, or cognitive overload, resulting in rework.

## Solution

Standardize a **Sequential Inquiry** process where the agent presents the full scope first, but then asks questions **one by one**, ideally with proposed options or defaults to make answering easy (Yes/No or Selection).

## Implementation Steps

1.  **Overview**: State the total number of items to verify (e.g., "I have 3 points to confirm").
2.  **Single Question**: Ask only the first question.
3.  **Propose Options**: Provide specific choices (e.g., "1. Option A, 2. Option B") or a recommended default.
4.  **Iterate**: Wait for the answer before proceeding to the next question.

## Example Template

```markdown
## 🗣️ Sequential Inquiry Strategy

**Do NOT** ask multiple questions in a single message.

1.  **State Agenda**: "I need to confirm 3 things: A, B, and C."
2.  **Ask Step-by-Step**:
    - "First, regarding A: I recommend [Option 1]. Is this acceptable? (Yes/No/Other)"
3.  **Wait**: Stop and wait for the user's response.
4.  **Next**: Once answered, proceed to B.
```

## Benefits

- **Cognitive Load Management**: Reduces mental effort for the user.
- **Precision**: Increases the likelihood of getting clear, specific answers.
- **Structure**: Keeps the dialogue focused and linear.
