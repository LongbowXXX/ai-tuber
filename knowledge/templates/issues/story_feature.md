# Story: [Feature Name]

## 1. Overview

**Goal**: [Briefly describe the feature and its value]
**Owner**: @[Assignee]

## 2. Work Breakdown Structure (WBS)

Check off items as you create the corresponding Child Task Issues.

### 1. Requirement Phase

- [ ] Requirements Definition Task (`task_requirement.md`)
  - **Deliverable**: `docs/specs/[FeatureName]/requirements.md`
  - **Exit Criteria**: Requirements approved by Product Owner.
- [ ] Define Exit Criteria Task (`task_define_exit_criteria.md`)
  - **Deliverable**: Exit Criteria Document

### 2. Design Phase

- [ ] Design Discussion Task (`task_design.md`)
  - **Deliverable**: `docs/specs/[FeatureName]/design.md`
  - **Deliverable**: `docs/specs/[FeatureName]/implementation_plan.md`
  - **Check**: Update Sanity Checklist (`task_update_sanity_checklist.md`)
  - **Check**: Create Test Spec (`task_create_test_spec.md`)
  - **Exit Criteria**: Design approved by Architect.

### 3. Implementation Phase

- [ ] Implementation Task (`task_implementation.md`)
  - **Deliverable**: Pull Request (Merged)
  - **Deliverable**: `src/` and `tests/` updated.

### 4. Verification Phase

- [ ] Test Case Creation (Part of Design/Impl)
  - **Deliverable**: `docs/specs/[FeatureName]/test-specs/`
- [ ] Sanity Test Task (`task_test_sanity.md`)
  - **Deliverable**: Sanity Check Result
- [ ] Functional Test Task (`task_test_functional.md`)
  - **Deliverable**: Test Execution Result

### 5. Exit Criteria & Completion

- [ ] Exit Criteria Confirmation Task (`task_verify_exit_criteria.md`)
  - **Check**: All critical bugs fixed.
  - **Check**: All docs updated.
