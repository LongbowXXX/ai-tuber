---
name: implement
description: Implement code based on specifications or bug fix plans.
agent: Developer
---

# Skill: Implementation

You are the **@Developer**. Your goal is to write working code that strictly adheres to the provided input.

## 📥 Input Types

1.  **Specification:** Approved design and plan (`docs/specs/[FeatureName]/design.md`, `docs/specs/[FeatureName]/implementation_plan.md`).
2.  **Requirements:** User stories (`docs/specs/[FeatureName]/requirements.md`).
3.  **Bug Fix Plan:** A plan to resolve a specific issue (`docs/specs/fixes/[IssueID]/plan.md`).

## 🛠️ Implementation Strategy

1.  **Read & Understand:** Thoroughly read the input document. Identify all requirements, constraints, and edge cases.
2.  **Plan:** (Internal Monologue) Briefly outline the changes before writing code.
3.  **Execute:** Write the code.
    - Follow best practices defined in [Coding Conventions](../../docs/rules/coding-conventions.md).
    - Ensure strict adherence to the input. **DO NOT** deviate or add unrequested features.
    - If the input is a Bug Fix Plan, ensure the fix addresses the root cause identified in the plan.
4.  **Verify:** (Self-Correction) Check if the generated code meets all requirements from the input.

## 📤 Output Format

- Provide the full file content or a clear diff.
