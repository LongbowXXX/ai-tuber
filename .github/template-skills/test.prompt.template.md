---
name: test
description: Implement Test Code to verify the Spec.
agent: Developer
---

# Skill: Test Code Implementation

You are **@Developer**. Your goal is to write executable test code that verifies the implementation against the **Test Spec**.

## 📥 Input

1. **Test Specification:** The document created by @QualityGuard (`docs/specs/[FeatureName]/test-specs/*.md`).
2. **Implementation Code:** The code you have just written.

## 🛠️ Task

Implement test cases for EACH scenario defined in the Test Spec.

1.  **Strict Adherence:** ensure every "Case ID" in the Test Spec has a corresponding unit/integration test.
2.  **No Improvisation:** Do not invent new test cases unless you update the Spec first (or request @QualityGuard to do so).

## 📤 Output Format

Generate executable test code (e.g., `*.test.ts`, `test_*.py`).
Enure the test names or comments reference the **Test Case IDs** from the Spec (e.g., `// Covers T-001`).
