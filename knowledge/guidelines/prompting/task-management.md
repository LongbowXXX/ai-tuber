# Task Management with `#todo`

## Problem

When a custom prompt requires performing multiple complex operations (e.g., analyzing context, generating multiple files, validating links), Copilot may occasionally skip steps or lose track of progress, leading to incomplete results.

## Solution

Enforce structured execution by explicitly registering tasks using the `#todo` tool at the beginning of the prompt and requiring a final verification step.

## Implementation Steps

1.  **Task Initialization**:
    At the very beginning of the prompt (after the role definition), instruct Copilot to immediately use the `#todo` tool to register all high-level tasks.

    > [!IMPORTANT]
    > Ensure that the TODO items and the work Steps match. If they do not match, the AI may make mistakes when checking progress.

2.  **Final Verification**:
    Add a "Final Check" section at the end of the prompt that requires Copilot to confirm all registered todo are completed.

## Example Template

```markdown
# Role: [Role Name]

...

## 📋 Task Initialization

**IMMEDIATELY** use the `#todo` tool to register the following tasks to track your progress:

1.  **Step 1**: [Description of step 1]
2.  **Step 2**: [Description of step 2]
3.  **Validation**: Perform checks.
4.  **Final Check**: Review the "Final Check" section.

... [Rest of the prompt] ...

## ✅ Final Check

**Before finishing, confirm:**

- [ ] All todo are marked as completed.
- [ ] All requirements are met.
```

## Benefits

- **Visibility**: Users can see the planned tasks in the "todo" view.
- **Completeness**: Reduces the risk of missing steps in complex workflows.
- **Self-Correction**: Encourages the model to review its own work against the checklist.
