[← Back to Workflow](./workflow.md)

# Feature Task Details

## Task List

1. [Requirement Definition](#1-requirement-definition)
2. [Spec Creation & Agreement](#2-spec-creation--agreement)
3. [Define Exit Criteria](#3-define-exit-criteria)
4. [Design](#4-design)
5. [Update Sanity Checklist](#5-update-sanity-checklist)
6. [Create Test Spec](#6-create-test-spec)
7. [Implementation & Tests](#7-implementation--tests)
8. [Run Sanity Tests](#8-run-sanity-tests)
9. [Run Feature Check](#9-run-feature-check)
10. [Verify Exit Criteria](#10-verify-exit-criteria)

---

### 1. Requirement Definition

**Deliverable**: Requirement Definition (Issue), Requirements Doc (Git)

**Goal**: Clarify WHY we are doing this and WHAT problem we are solving.

**Activities**:

- Define background and purpose.
- Identify user stories.
- Define acceptance criteria.
- **Template**: [Requirement Definition Task](../templates/issues/task_requirement.md)

**Checkpoints**:

- [ ] Verify using [Requirement Definition Task](../templates/issues/task_requirement.md).

---

### 2. Spec Creation & Agreement

**Deliverable**: Updated Specification (Git)

**Goal**: Clarify the requirements of the feature and form a common understanding within the team.

**Activities**:

- Clarify the purpose and background of the feature.
- Identify user stories and requirements.
- Create/Update specifications.
  - **Template**: [Specification Template](../templates/artifacts/specification.template.md)
- Reach agreement with the Product Owner.
- Manage specifications in Git.

**Checkpoints**:

- [ ] Verify using [Specification Template](../templates/artifacts/specification.template.md).
- [ ] See Issue Template for sign-off criteria.

---

### 3. Define Exit Criteria

**Deliverable**: Exit Criteria Document (Issue/Project Management Tool)

- **Template**: [Define Exit Criteria](../templates/issues/task_define_exit_criteria.md)

**Goal**: Clarify the criteria for story completion and ensure quality.

**Activities**:

- Define completion criteria based on specifications.
- List validation items.
- Create Exit Criteria document.

**Checkpoints**:

- [ ] Verify using [Define Exit Criteria](../templates/issues/task_define_exit_criteria.md).

### 4. Design

**Deliverable**: Updated Design Document (Git)

**Goal**: Clarify implementation direction and ensure quality and maintainability.

**Activities**:

- Technical design based on specifications.
- Architecture design.
- Interface design.
- Data model design.
- Design review.
- Team consensus.
- **Template**: [Design Template](../templates/artifacts/design.template.md)

**Important Notes**:

- If there are ambiguities or defects in the spec, **always confirm instead of guessing**.
- If spec revision or doc improvement is needed, **create a ticket**.

**Checkpoints**:

- [ ] Verify using [Design Template](../templates/artifacts/design.template.md).
- [ ] See Issue Template for review criteria.

---

### 5. Update Sanity Checklist

**Deliverable**: Updated Sanity Test Items

**Goal**: Keep the checklist up-to-date for easy system-wide checks before release.

**Activities**:

- Add/Update check items based on spec/design.
- Review existing items (remove obsolete, modify content).
- Update the checklist file.
  - **File**: `docs/tests/sanity.md`
  - **Issue Template**: [Update Sanity Checklist](../templates/issues/task_update_sanity_checklist.md)
- Commit to Git.

**Checkpoints**:

- [ ] Verify using [Update Sanity Checklist](../templates/issues/task_update_sanity_checklist.md).

---

### 6. Create Test Spec

**Deliverable**: Feature Implementation Verification Items (Issue)

**Goal**: Clarify criteria to judge the completion of feature implementation.

**Activities**:

- Create check items based on spec/design.
  - **Template**: [Test Spec](../templates/artifacts/test_spec.template.md)
  - **Issue Template**: [Create Test Spec](../templates/issues/task_create_test_spec.md)
- Define normal and abnormal test cases.
- Define boundary value tests.

**Checkpoints**:

- [ ] Verify using [Create Test Spec](../templates/issues/task_create_test_spec.md).

---

### 7. Implementation & Tests

**Deliverable**: Source Code, Test Code (Git)

**Goal**: Implement functionality based on design and ensure quality.

**Activities**:

- Implementation based on design.
- Creation of unit tests.
  - **Template**: [Implementation Task](../templates/issues/task_implementation.md)
- Code review.
- Continuous Integration.

**Implementation Principles**:

- **Large volume**: Split tickets appropriately.
- **Splitting tickets**: Consider introducing skeleton classes first.
- **Breaking changes**: Create a feature branch (never leave main branch in broken state).

**Checkpoints**:

- [ ] Verify using [Implementation Task](../templates/issues/task_implementation.md).

---

### 8. Run Sanity Tests

**Deliverable**: Sanity Test Results (Issue)

**Goal**: Perform a quick system-wide check to ensure no regression.

**Activities**:

- Operation check based on updated Sanity Checklist.
  - **Checklist**: `docs/tests/sanity.md`
- Record results (Ticket Comment).
  - **Template**: [Sanity Test Task](../templates/issues/task_test_sanity.md)

**Checkpoints**:

- [ ] Verify using [Sanity Test Task](../templates/issues/task_test_sanity.md).

---

### 9. Run Feature Check

**Deliverable**: Feature Implementation Verification Results (Issue)

**Goal**: Confirm the completion of feature implementation.

**Activities**:

- Operation check based on created check items.
- Record results (Ticket Comment).
  - **Template**: [Functional Test Task](../templates/issues/task_test_functional.md)

**Checkpoints**:

- [ ] Verify using [Functional Test Task](../templates/issues/task_test_functional.md).

---

### 10. Verify Exit Criteria

**Deliverable**: Verification Record on Project Management Tool

**Goal**: Confirm that the story meets the completion criteria.

**Activities**:

- Final check based on Exit Criteria document.
  - **Template**: [Verify Exit Criteria](../templates/issues/task_verify_exit_criteria.md)
- Verification of all deliverables.
- Record confirmation results as a comment on the ticket.

**Checkpoints**:

- [ ] Verify using [Verify Exit Criteria](../templates/issues/task_verify_exit_criteria.md).
