# Deliverables List

[← Back to Workflow](./workflow.md)

In this project, we strictly separate "GitHub Issues (Process/Log)" and "Git Repository (Product Assets)" depending on the nature of the deliverable.

## Management Principles

- **Issue**: The history of "Why it happened", discussions, temporary check results, work logs. (Flow)
- **Git**: The definition of "What it is", specifications, designs, code, persistent documentation. (Stock)

## Deliverables Matrix

| Phase          | Deliverable Name         | Location  | Template                                 | Artifact Path (Git)                     | Description                                                                                       |
| :------------- | :----------------------- | :-------- | :--------------------------------------- | :-------------------------------------- | :------------------------------------------------------------------------------------------------ |
| 1. Requirement | Requirement Definition   | Issue     | `issues/task_requirement.md`             | `docs/specs/[Feature]/requirements.md`  | Purpose, Context, Scope, and discussion/agreement on Acceptance Criteria.                         |
| 2. Design      | Design Discussion Record | Issue     | `issues/task_design.md`                  | -                                       | Architecture selection, trade-off considerations, design review history.                          |
|                | Functional Spec          | Git       | `artifacts/specification.template.md`    | `docs/specs/[Feature]/specification.md` | Confirmed functional specifications. Reflects Issue discussions and must be kept up-to-date.      |
|                | Technical Design         | Git       | `artifacts/design.template.md`           | `docs/specs/[Feature]/design.md`        | Confirmed system design, API definitions, DB schema, etc.                                         |
|                | Feature Test Spec        | Git       | `artifacts/test_spec.template.md`        | `docs/specs/[Feature]/test-specs/`      | Functional test cases (procedures/expected results). Saved in `docs/specs/[Feature]/test-specs/`. |
| 3. Impl        | Source Code              | Git       | N/A                                      | `src/`                                  | Product code under `src/`.                                                                        |
|                | Test Code                | Git       | N/A                                      | `tests/`                                | Automated test code under `tests/`.                                                               |
|                | Pull Request             | Git (PR)  | `issues/pull_request.md`                 | -                                       | Code change proposals, reviews, CI results.                                                       |
|                | Sanity Checklist         | Git       | `artifacts/sanity_checklist.template.md` | `docs/tests/sanity.md`                  | Project-wide master list of sanity test items.                                                    |
| 4. Verify      | Sanity Test Result       | Issue     | `issues/task_test_sanity.md`             | -                                       | Results executed based on the list in Git.                                                        |
|                | Functional Test Result   | Issue     | `issues/task_test_functional.md`         | -                                       | Results executed based on test cases in Git.                                                      |
|                | Exit Criteria Check      | Issue     | `issues/task_verify_exit_criteria.md`    | -                                       | Final check to see if release criteria are met.                                                   |
| 5. Release     | Release Agreement        | Issue     | `issues/task_version_agreement.md`       | -                                       | Agreement on version number and tag name.                                                         |
|                | Related Fixes Check      | Issue     | `issues/task_verify_related_fixes.md`    | -                                       | Confirmation that all related fixes are included.                                                 |
|                | Vulnerability Check      | Issue     | `issues/task_vulnerability_check.md`     | -                                       | Security audit results.                                                                           |
|                | Static Analysis Result   | Issue     | `issues/task_static_analysis.md`         | -                                       | Static analysis report.                                                                           |
|                | License Check Result     | Issue/Git | `issues/task_license_check.md`           | `docs/licenses.md`                      | License verification report.                                                                      |
|                | Release Checklist        | Issue     | `issues/task_release_checklist.md`       | -                                       | Final checklist execution record before release.                                                  |
|                | Release Notes            | Git (Rel) | N/A                                      | GitHub Releases                         | Summary of changes per version.                                                                   |
|                | CHANGELOG.md             | Git       | N/A                                      | `CHANGELOG.md`                          | History file.                                                                                     |

## Persistence of Artifacts

Although Issues are searchable after being closed, the "Source of Truth" for the project must always be reflected in Git.
For example, if a "Specification Change" is discussed in an Issue, the discussion remains in the Issue, but the **Decision must be merged into the Specification (`docs/specs/`) on Git**.
AI supports this "Distillation of information from Issue to Git".
