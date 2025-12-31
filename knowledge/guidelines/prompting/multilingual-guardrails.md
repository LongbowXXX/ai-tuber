# Multilingual Instruction Guardrails

## Problem

When generating content in a target language (e.g., Japanese), LLMs often "summarize" or "localize" technical instructions to make them more natural, inadvertently removing critical constraints or reducing the intensity of commands (e.g., turning "MUST" into "should").

## Solution

Inject a **Critical Translation Rule** immediately before the section that must be preserved. Explicitly forbid summarization and require verbatim translation while preserving structure.

## Implementation Steps

1.  **Identify Critical Sections**: Find instructions that constitute the "Constitution" or "Rules of Engagement" (e.g., security protocols, mandatory steps).
2.  **Inject Warning**: Add a block instructing the model to treat the next section as immutable code, not translatable text.

## Example Template

```markdown
> [!IMPORTANT]
> **CRITICAL TRANSLATION RULE**:
> When generating the content below in the **Target Language**, you MUST:
>
> 1. **DO NOT SUMMARIZE**: Translate the text **verbatim**.
> 2. **PRESERVE STRUCTURE**: Keep all structure, bullet points, and warnings.
> 3. **MAINTAIN INTENSITY**: Do not soften "MUST" to "should".
```

## Benefits

- **Consistency**: Ensures agents behave identically regardless of the user's language.
- **Safety**: Prevents the accidental removal of guardrails during translation.
