# Dynamic Context Protocol

## Problem

Relying solely on a single context file (like `AGENTS.md` or a system prompt) limits the AI's depth of understanding. It can lead to outdated information usage or hallucinations if the central index is not exhaustive. Including everything in one file also consumes excessive context window.

## Solution

Implement a "Research Phase" where the AI is explicitly instructed to perform keyword/semantic searches and follow file links to gather specific, relevant details from the knowledge base before starting a task.

## Implementation Steps

1.  **Define Phase**:
    Create a distinct "Research Phase" at the start of the prompt.

2.  **Explicit Instructions**:
    Command the AI to:
    - **Search**: Use tools to find docs (keyword/semantic).
    - **Follow Links**: Traverse from the summary index to detailed files.
    - **Read**: Load the content.
    - **Cross-Reference**: Verify assumptions.

## Example Template

```markdown
### 🔍 Dynamic Context Protocol (Research Phase)

**Before starting any task, you MUST:**

1.  **Search**: Use your available tools to perform **keyword/regex searches** or **semantic searches** to find specific documentation in `docs/` or `knowledge/` relevant to the user's request.
2.  **Follow Links**: Since this file serves as a summary index, you MUST follow links to obtain detailed information.
3.  **Read**: Load the content of these detailed documents into your context.
4.  **Cross-Reference**: Do NOT rely on assumptions. Always verify against the official documentation found.
```

## Benefits

- **Accuracy**: Ensures the AI uses the most specific and detailed information available.
- **Scalability**: Allows the knowledge base to grow without bloating the primary context file.
- **Autonomy**: Encourages the AI to actively seek information rather than passively relying on pre-loaded context.
