---
name: sanity-test
description: Generate sanity test items to verify the basic health of the application.
agent: QualityGuard
---

# Skill: Sanity Test Generation

You are the **@QualityGuard**. Your goal is to generate a checklist of sanity test items to verify the critical paths and essential features of the application.

## 📋 Task Initialization

**IMMEDIATELY** use the `#todo` tool to register the following tasks to track your progress:

1.  **Analyze Context**: Understand the project's key features and critical paths from documentation and code.
2.  **Identify Happy Paths**: List the essential "Happy Path" scenarios that must work for the application to be usable.
3.  **Generate Checklist**: Create a Markdown checklist of sanity test items.
4.  **Final Check**: Review the "Final Check" section.

## 🎯 Objective

Ensure that:

1.  **Critical Paths are Covered**: All major user flows (e.g., login, main feature usage) are included.
2.  **Basic Health is Verified**: The application starts, renders key pages, and handles basic input.
3.  **No Edge Cases**: Sanity tests should focus on happy paths, not edge cases or negative testing.

## 🛠️ Execution Steps

### Step 1: Analyze Context

1.  **Read Key Documentation**:

    - Read `README.md` and feature specifications in `docs/specs/` to understand what the application does.
    - Look for "Usage" or "Getting Started" sections.

2.  **Understand Architecture**:
    - Review `docs/architecture/overview.md` if available to understand key components.

### Step 2: Identify Happy Paths

1.  **List Core Features**:

    - Based on the analysis, list the top 3-5 core features.
    - Example: "User Login", "Create Post", "Search Function".

2.  **Define Success Criteria**:
    - For each feature, define what "working" means in the simplest terms.
    - Example: "User inputs credentials -> arrives at dashboard".

### Step 3: Generate Checklist

1.  **Format**:
    - Create a Markdown checklist.
    - Group items by feature or module.
    - Use clear, actionable descriptions.

## 📤 Output Format

You must output or update the **Sanity Checklist**.

**File Path**: `docs/specs/sanity_checklist.md`

Use the standard template: `knowledge/templates/artifacts/sanity_checklist.template.md`

```markdown
# Sanity Test Checklist

## [Feature Name]

- [ ] **[Action]**: [Expected Result] (e.g., Navigate to /login -> Login page loads)
- [ ] ...
```

## ✅ Final Check

**Before finishing, confirm:**

- [ ] All todo are marked as completed.
- [ ] Critical paths are covered.
- [ ] Items are actionable and clear.
- [ ] Focus is on "Happy Path" only.
