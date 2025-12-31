# Environment-Agnostic Tool Support

## Problem

Official GitHub Copilot best practices suggest explicitly defining the `tools` available to an agent or prompt. However, this approach has significant downsides when generating prompts automatically:

- **Environment Variability**: Developers' environments vary significantly (different Extensions, MCP servers). Hardcoding tools inadvertently disables access to context-specific tools that the user might have installed.
- **Hallucinations**: AI models frequently hallucinate tool names that do not exist explicitly or use incorrect names, leading to broken prompts or errors.

If an AI-generated prompt explicitly hardcodes a list of `tools`, it limits flexibility and increases the risk of including invalid tools.

## Solution

**Deliberately ignore** the best practice of explicit tool specification when generating new custom prompts or agents. Instead, omit the `tools` property entirely. This allows the default behavior to take over, which generally permits access to all tools available in the current context (including those from Extensions and MCP servers).

**Exception**: If you are basing a new prompt on a specific existing reference (e.g., copying a strict agent definition), it is acceptable to copy the `tools` list to maintain the intended behavior of that reference.

## Implementation Steps

1.  **Omit `tools` Property**:
    When creating `.prompt.md` or `.agent.md` files, do not generate a `tools: [...]` section.

2.  **User Delegation**:
    If specific tools must be restricted or strictly managed, leave that configuration to the human user.

## Example Template

**Avoid this (unless copying strict reference):**

```markdown
---
name: My Strict Agent
description: An agent with hardcoded tools
tools: ["search", "fetch"]
---
```

**Prefer this (Environment-Agnostic):**

```markdown
---
name: My Flexible Agent
description: An agent that can use whatever tools the user has installed.
---
```

## Benefits

- **Flexibility**: Automatically supports new tools added by extensions or MCP servers without code changes.
- **Portability**: The prompt works across different developer setups without breaking due to missing or extra tools.
- **Power**: Allows the agent to leverage the full capabilities of the user's IDE.
