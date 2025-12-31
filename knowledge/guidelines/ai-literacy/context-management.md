# Context Management: The Art of feeding AI

> **"AI is only as smart as the context you give it."**

This document explains how to effectively manage the context you provide to GitHub Copilot and other AI tools to get the best possible results.

## 1. Neighboring Tabs (Implicit Context)

GitHub Copilot automatically reads the files you have open in your VS Code tabs (and recently active files) to understand the context of what you are working on. This is called **"Neighboring Tabs"**.

### Best Practices

- **Open Relevant Files**: If you are working on a function that uses a specific Type or Interface, make sure the file defining that Type is open in a tab.
- **Open Tests**: When writing implementation code, keep the corresponding test file open. Copilot will infer the expected behavior from the tests.
- **Close Irrelevant Files**: If you have 20 tabs open from a completely different task (e.g., a different feature or legacy code), Copilot might get confused and pull in irrelevant context. **Close tabs you don't need.**

## 2. @workspace vs #file (Explicit Context)

When using Copilot Chat, you can explicitly control context.

### `@workspace` (The Scout)

- **What it does:** Searches the entire project index (vector database) to find relevant information.
- **When to use:**
  - "Where is the authentication logic defined?"
  - "How do we handle logging in this project?"
  - "Find all usages of `UserDTO`."
- **Pro:** Can find things you don't know the location of.
- **Con:** Can miss things if the keyword match isn't perfect, or get distracted by similar-but-wrong files.

### `#file` (The Sniper)

- **What it does:** Explicitly adds the content of a specific file to the prompt context.
- **When to use:**
  - "Refactor `#UserService.ts` to use `#Result.ts` for error handling."
  - "Write a unit test for `#PaymentController.ts`."
- **Pro:** Guarantees the AI "sees" the exact code you are talking about. Highest accuracy.
- **Con:** You need to know which file is relevant.

### Comparison Table

| Feature      | `@workspace`                             | `#file`                           |
| :----------- | :--------------------------------------- | :-------------------------------- |
| **Scope**    | Entire Project                           | Specific File(s)                  |
| **Agency**   | AI decides what to read                  | Human decides what to read        |
| **Accuracy** | Good for exploration                     | Excellent for implementation      |
| **Use Case** | "Search", "Find", "Explain Architecture" | "Refactor", "Debug", "Write Test" |

### Note on `#codebase`

You might see references to `#codebase` in older documentation or other AI tools. In the current version of GitHub Copilot for VS Code, **`@workspace`** is the standard agent command effectively replacing the need for a separate `#codebase` variable.

- **`@workspace`**: The active agent that searches your codebase.
- **`#codebase`**: Often a deprecated or alternative variable for "all files".

**Rule of Thumb:** Always start with `@workspace` for broad queries.

## Summary

1.  **Passive Context**: Keep your tabs clean. Open only what relates to the current task.
2.  **Active Context**:
    - Use `@workspace` to **find** information.
    - Use `#file` to **feed** specific information for coding tasks.
