# Knowledge Retrieval for Latest Specifications

## Problem

Copilot's training data has a cutoff, so it may not know about the latest features, file structures, or tools available in VS Code Copilot (e.g., new prompt file formats, new chat tools).

## Solution

Explicitly instruct Copilot to fetch the latest documentation from official URLs at the beginning of the prompt before performing any generation tasks.

## Implementation Steps

1.  **Identify Critical URLs**:
    Determine which documentation pages contain the specifications relevant to your prompt (e.g., prompt files, custom agents, tools).

2.  **Add Prerequisite Section**:
    Add a section (e.g., "PREREQUISITE: Knowledge Retrieval") that forces Copilot to read these URLs.

## Example Template

```markdown
## 🚨 PREREQUISITE: Knowledge Retrieval

**Before generating or updating, you MUST:**

1.  **Fetch Latest Docs**:
    - `https://code.visualstudio.com/docs/copilot/customization/prompt-files` (for prompt file structure).
    - `https://code.visualstudio.com/docs/copilot/reference/copilot-vscode-features#_chat-tools` (for available tools).
    - `https://code.visualstudio.com/docs/copilot/customization/custom-agents` (for custom agent structure).
```

## Benefits

- **Accuracy**: Ensures generated files comply with the latest schemas and standards.
- **Capability**: Enables the use of the newest tools and features that the model might not inherently know.
