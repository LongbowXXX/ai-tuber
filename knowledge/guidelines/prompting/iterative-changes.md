# Iterative Changes for High-Impact Configs

## Problem

When generating configuration files (like `.vscode/tasks.json` or `settings.json`) or managing lists (like extensions), generating the entire file at once forces the user to review a large block of changes. This often leads to "information overload," making it difficult for the user to accept partial suggestions or verify correctness.

## Solution

Adopt an **Iterative Proposal Loop**. Instead of generating the final file immediately, instruct the agent to propose changes **one by one** (or in small logical groups), explain the rationale, and ask for user confirmation before proceeding to the next item.

## Implementation Steps

1.  **Define the Loop**:
    Explicitly instruct the agent to loop through items and "STOP" to ask for confirmation.

2.  **Propose, Don't Just Do**:
    Frame the interaction as a dialogue: "Should I add X?" rather than "I added X".

3.  **Batch Final Output**:
    Only generate the final file content _after_ the user has confirmed the list of items.

## Example Template

```markdown
## 2. Iterative Configuration (Loop)

**DO NOT** generate the full file immediately. You must propose items **one at a time** to avoid overwhelming the user.

1.  **Pick an Item**: Select one setting or task to propose.
2.  **Propose**: Ask the user: "I recommend adding [Setting X] because [Reason]. Do you agree?"
3.  **Wait**: Wait for user confirmation.
4.  **Repeat**: Continue to the next item.
```

## Benefits

- **Cognitive Load**: Reduces the effort required to review changes.
- **Selective Adoption**: Allows users to easily say "Yes" to some items and "No" to others.
- **Safety**: Prevents accidental overwriting of complex configurations with a "good enough" AI generation.
