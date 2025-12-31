[← Back to Workflow](./workflow.md)

# Bug Fix Task Details

## Overview

Bug Fix Stories focus on explicitly "Reproduction" and "Prevention" to ensure bugs are fixed permanently and side effects are minimized.

## Task List

1. [Analyze & Plan](#1-analyze--plan)
2. [Create Reproduction Test](#2-create-reproduction-test)
3. [Implement Fix](#3-implement-fix)
4. [Verify Fix (Test)](#4-verify-fix-test)
5. [Verify Side Effects](#5-verify-side-effects)
6. [Update Documentation](#6-update-documentation)
7. [Verify Exit Criteria](#7-verify-exit-criteria)

---

### 1. Analyze & Plan

**Deliverable**: Bug Analysis Issue Comment / Plan

**Goal**: Identify the root cause and decide on a fix approach.

**Activities**:

- Analyze the reported bug.
- Reproduce the bug manually (if possible).
- Identify the root cause.
- Plan the fix.
  - **Template**: [Bug Fix Story](../templates/issues/story_bug_fix.md)
  - **Template**: [Bug Fix Plan](../templates/agents/bug_fix_plan.template.md) (Use this for detailed analysis)

**Checkpoints**:

- [ ] Verify using [Bug Fix Story](../templates/issues/story_bug_fix.md).

---

### 2. Create Reproduction Test

**Deliverable**: Test Code (Git)

**Goal**: Automate reproduction to ensure the bug is fixed and never returns (Regression Testing).

**Activities**:

- Write a test case that fails because of the bug.
- Commit the failing test (Red state).

**Checkpoints**:

- [ ] Test case reproduces the bug (fails as expected).
- [ ] Test code is committed to Git.

---

### 3. Implement Fix

**Deliverable**: Source Code (Git)

**Goal**: Fix the bug.

**Activities**:

- Modify source code to fix the bug.
- Refactor if necessary (ensure safety).
  - **Template**: [Implementation Task](../templates/issues/task_implementation.md)

**Checkpoints**:

- [ ] Verify using [Implementation Task](../templates/issues/task_implementation.md).

---

### 4. Verify Fix (Test)

**Deliverable**: Test Result (Pass)

**Goal**: Confirm the bug is fixed using the reproduction test.

**Activities**:

- Run the reproduction test.
- Check if it passes (Green state).
  - **Template**: [Functional Test Task](../templates/issues/task_test_functional.md)

**Checkpoints**:

- [ ] Verify using [Functional Test Task](../templates/issues/task_test_functional.md).

---

### 5. Verify Side Effects

**Deliverable**: Side Effect Check Result (Issue Comment)

**Goal**: Ensure no other parts of the system are broken.

**Activities**:

- Run Sanity Tests (if critical/high impact).
- Run related feature tests.
- Manual exploratory testing around the affected area.

**Checkpoints**:

- [ ] No side effects observed.
- [ ] Sanity tests pass (if executed).

---

### 6. Update Documentation

**Deliverable**: Updated Documentation (Git)

**Goal**: Keep docs consistent with code behavior.

**Activities**:

- Update specs/design if the fix changed behavior/logic.
- Update CHANGELOG if necessary.
- Update TROUBLESHOOTING or KNOWN_ISSUES if relevant.

**Checkpoints**:

- [ ] Docs are updated to reflect the fix.
- [ ] CHANGELOG is updated.

---

### 7. Verify Exit Criteria

**Deliverable**: Verification Record on Project Management Tool

**Goal**: Confirm the bug fix story is complete.

**Activities**:

- Final check based on Exit Criteria.
  - **Template**: [Verify Exit Criteria](../templates/issues/task_verify_exit_criteria.md)
- Verify all deliverables are in Git.
- Close the issue.

**Checkpoints**:

- [ ] Verify using [Verify Exit Criteria](../templates/issues/task_verify_exit_criteria.md).
