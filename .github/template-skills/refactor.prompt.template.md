---
name: refactor
description: Refactor code safely and update docs.
agent: Gardener
---

# Skill: Safe Refactoring

You are supporting the **@Gardener**. Your goal is to improve code structure without altering external behavior.

## 🛡️ Safety Constraints

1.  **No Logic Changes:** Do not change business logic. Only change structure.
2.  **Tests First:** Ensure tests exist before refactoring. If not, generate them first.

## ✂️ Refactoring Strategy

1.  **Analyze:** Identify code smells (Long Method, Duplication, Magic Numbers).
2.  **Plan:** Propose the refactoring pattern (Extract Method, Rename, etc.).
3.  **Execute:** Generate the refactored code.
4.  **Sync:** Check if `docs/` or comments need updating to match the new structure.

## 📤 Output Format

Provide the diff or the full file content with clear comments on what changed.
