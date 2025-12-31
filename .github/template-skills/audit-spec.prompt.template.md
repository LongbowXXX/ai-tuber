---
name: audit-spec
description: Audit specification documents for ambiguity, consistency, and architectural compliance.
agent: QualityGuard
---

# Skill: Spec Linter (Specification Audit)

You are supporting the **@QualityGuard**. Your goal is to review specification documents (Requirements, Design, Plans) to ensure they are clear, consistent, and compliant with project standards before implementation begins.

## 📋 Task Initialization

**IMMEDIATELY** use the `#todo` tool to register the following tasks:

1.  **Ambiguity Check**: Scan for vague language.
2.  **Consistency Check**: Verify alignment between strict requirements and technical design.
3.  **Architecture Check**: Ensure compliance with `AGENTS.md` rules.
4.  **Generate Report**: Output the Spec Audit Report.

## 🎯 Objective

Review the provided specification document(s) to prevent "Garbage In, Garbage Out". Ensure the developer has a crystal-clear, feasible, and compliant plan.

## 🛡️ Audit Steps

### 1. Ambiguity Check

- **Scan for Vague Words**: Look for phrases like:
  - "maybe", "probably", "roughly", "about"
  - "should be able to" (unless strictly defined)
  - "user friendly", "fast" (without metrics)
  - "etc.", "and so on"
- **Action**: Flag these as warnings requiring clarification.

### 2. Consistency Check

- **Story vs. Design**: Ensure every User Story has a corresponding technical plan (API endpoint, DB schema change, or UI component).
- **Missing Technical Details**: If a story requires a new field, is the DB migration specified? If it implies a new page, is the route defined?

### 3. Architecture Compliance (AGENTS.md)

- **Check for Violations**:
  - Does the design use the **Repository Pattern**? (Required)
  - Are **Agents** incorrectly assigned runtime roles? (Agents are build-time only).
  - Are strict rules from `AGENTS.md` followed?

## 📝 Output Format

You must output a **Spec Audit Report**.

```markdown
# Spec Audit Report

## 1. Summary

[Brief summary of the spec quality. Is it ready for implementation?]

## 2. Issues & discrepancies

### 🔴 Critical (Must Fix)

- [ ] **Consistency**: User Story "X" implies a database change, but no schema update is listed in the Design section.
- [ ] **Architecture**: The design proposes a direct database query in the controller, violating the Repository Pattern.

### 🟡 Warnings (Clarification Needed)

- [ ] **Ambiguity**: "The system should be fast" - Define "fast" (e.g., < 200ms).
- [ ] **Ambiguity**: "Handle various errors" - List specific error codes to handle.

## 3. Conclusion

[ ] **APPROVE**: The spec is clear, consistent, and compliant. Proceed to Implementation.
[ ] **REQUEST CHANGES**: Address the critical issues above before proceeding.
```
