[← Back to Workflow](./workflow.md)

# Release Task Details

## Overview

Create a Release Story when releasing the application.
Bug fixes and small tasks that shouldn't be individual stories are linked to the Release Story.

## Task List

1. [Agree on Version & Tag Name](#1-agree-on-version--tag-name)
2. [Verify Related Fixes](#2-verify-related-fixes)
3. [Run Sanity Test](#3-run-sanity-test)
4. [Vulnerability Check](#4-vulnerability-check)
5. [Static Analysis](#5-static-analysis)
6. [Update Documentation](#6-update-documentation)
7. [License Check](#7-license-check)
8. [Create Release Checklist](#8-create-release-checklist)
9. [Run Pre-release Checks](#9-run-pre-release-checks)
10. [Define Exit Criteria](#10-define-exit-criteria)
11. [Execute Release](#11-execute-release)
12. [Verify Exit Criteria](#12-verify-exit-criteria)

---

### 1. Agree on Version & Tag Name

**Deliverable**: Agreement record on Project Management Tool

**Goal**: Clarify release version naming rules and content.

**Activities**:

- Version decision based on Semantic Versioning (SemVer).
- Git Tag name decision.
- Draft Release Notes core content.
- Record agreement on ticket.
  - **Template**: [Release Version Agreement](../templates/issues/task_version_agreement.md)

**Checkpoints**:

- [ ] Verify using [Release Version Agreement](../templates/issues/task_version_agreement.md).

---

### 2. Verify Related Fixes

**Deliverable**: Confirmation result on Project Management Tool

**Goal**: Ensure all changes linked to the Release Story are included.

**Activities**:

- Check bug fixes linked to Release Story.
- Check feature additions/changes linked to Release Story.
- Check for merge omissions.
- Confirm conflict resolution.
- Record confirmation results on ticket.
  - **Template**: [Verify Related Fixes](../templates/issues/task_verify_related_fixes.md)

**Checkpoints**:

- [ ] Verify using [Verify Related Fixes](../templates/issues/task_verify_related_fixes.md).

---

### 3. Run Sanity Test

**Deliverable**: Sanity Test Result (Issue)

- **Template**: [Sanity Test Task](../templates/issues/task_test_sanity.md)

**Goal**: Ensure the release candidate is stable enough for further testing.

**Activities**:

- Deploy Release Candidate to Staging/Test environment.
- Execute Sanity Test items based on `docs/tests/sanity.md`.
- Record pass/fail.

**Checkpoints**:

- [ ] Verify using [Sanity Test Task](../templates/issues/task_test_sanity.md).

---

### 4. Vulnerability Check

**Deliverable**: Vulnerability Check Result (Issue)

**Goal**: Identify and address security risks.

**Activities**:

- Vulnerability scan of dependency libraries.
  - Python: `pip-audit` or `safety`
  - Node.js: `npm audit` or `yarn audit`
- Check against known vulnerability databases.
- Handle found vulnerabilities.
  - Critical/High: Must fix.
  - Medium: Evaluate risk and decide.
  - Low: Record and consider for future.
- **Template**: [Vulnerability Check Task](../templates/issues/task_vulnerability_check.md)

**Checkpoints**:

- [ ] Verify using [Vulnerability Check Task](../templates/issues/task_vulnerability_check.md).

---

### 5. Static Analysis

**Deliverable**: Static Analysis Result (Project Management Tool)

**Goal**: Detect potential bugs and quality issues via static analysis.

**Activities**:

- Run static analysis tools.
- Analyze detected issues.
- Fix high-priority issues.
- Determine and record False Positives.
- Record check results on ticket.
  - **Template**: [Static Analysis Task](../templates/issues/task_static_analysis.md)

**Checkpoints**:

- [ ] Verify using [Static Analysis Task](../templates/issues/task_static_analysis.md).

---

### 6. Update Documentation

**Deliverable**: Updated Documentation (Git)

- **Template**: [Update Documentation](../templates/issues/task_docs_update.md)

**Goal**: Ensure users and developers have access to the latest info.

**Activities**:

- Update README.md.
- Update CHANGELOG.md or change history.
- Update HowToUse/Tutorials.
- Update API Specs (if applicable).
- Update Dependency List.

**Checkpoints**:

- [ ] Verify using [Update Documentation](../templates/issues/task_docs_update.md).

---

### 7. License Check

**Deliverable**: License List File (Git)

**Goal**: Ensure library licenses are appropriate and avoid legal risks.

**Activities**:

- Retrieve license list of dependencies.
- Update license list file.
- Commit to Git.
- Check license types.
- Identify and handle problematic licenses.
- Update license notices.
- Record confirmation results on ticket.
  - **Template**: [License Check Task](../templates/issues/task_license_check.md)

**Checkpoints**:

- [ ] Verify using [License Check Task](../templates/issues/task_license_check.md).

---

### 8. Create Release Checklist

**Deliverable**: Check items on Project Management Tool

**Goal**: Clarify final check criteria before release.

**Activities**:

- Record release check items on ticket. Includes:
  - Operation Check (Feature verification linked to release).
  - Quality/Security (Vulnerability, Static Analysis, License).
  - Documents (README updates, etc.).
  - Release Artifacts (Build output, etc.).
  - Version Control (Tags, Commits).
- **Template**: [Release Checklist](../templates/issues/task_release_checklist.md)

**Checkpoints**:

- [ ] Verify using [Release Checklist](../templates/issues/task_release_checklist.md).

---

### 9. Run Pre-release Checks

**Deliverable**: Confirmation result on Project Management Tool

**Goal**: Confirm release criteria are met.

**Activities**:

- Execute checks based on items created in 8.
- Record results for each item.
- Handle discovered issues.
- Record confirmation results on ticket.

**Checkpoints**:

- [ ] All check items executed.
- [ ] All check items passed.
- [ ] Issues handled appropriately.
- [ ] Confirmation results recorded on ticket.

---

### 10. Define Exit Criteria

**Deliverable**: Exit Criteria Document (Issue)

- **Template**: [Define Exit Criteria](../templates/issues/task_define_exit_criteria.md)

**Goal**: Clarify criteria for release completion.

**Mandatory Items**:

- [ ] Pre-release checks executed and passed.
- [ ] Release completed.
  - [ ] Release page created.
  - [ ] Release announcement sent.
  - [ ] Git Tag created.
  - [ ] Release artifacts published.

**Checkpoints**:

- [ ] Verify using [Define Exit Criteria](../templates/issues/task_define_exit_criteria.md).

---

### 11. Execute Release

**Deliverable**: Release Page, Release Artifacts

**Goal**: Officially release the new version.

**Activities**:

- Create Git Tag.
- **Template**: [Execute Release](../templates/issues/task_release_execution.md)
- Create GitHub Release Page.
- Publish to Package Registry (if applicable).
- Send release announcement.

**Checkpoints**:

- [ ] Verify using [Execute Release](../templates/issues/task_release_execution.md).

---

### 12. Verify Exit Criteria

**Deliverable**: Confirmation result on Project Management Tool

**Goal**: Confirm Release Story meets completion criteria.

**Activities**:

- Final check based on Exit Criteria.
- **Template**: [Verify Exit Criteria](../templates/issues/task_verify_exit_criteria.md)
- Verification of all deliverables.
- Record confirmation results as comment on ticket.

**Checkpoints**:

- [ ] Verify using [Verify Exit Criteria](../templates/issues/task_verify_exit_criteria.md).
