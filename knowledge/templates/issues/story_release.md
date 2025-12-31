# Story: Release v[Version]

## 1. Overview

**Goal**: Release version [Version] to production.
**Owner**: @[ReliabilityEngineer]

## 2. Release WBS

### 1. New Version Agreement

- [ ] Determine Version Number (`task_version_agreement.md`)
- [ ] Update `CHANGELOG.md` with planned changes.

### 2. Pre-Release Checks

- [ ] **Merge Check**: Verify related fixes (`task_verify_related_fixes.md`).
- [ ] **Sanity Check**: Run Sanity Test (`task_test_sanity.md`).
- [ ] **Vulnerability Check**: Run security audit (`task_vulnerability_check.md`).
- [ ] **Static Analysis**: Run static analysis (`task_static_analysis.md`).
- [ ] **License Check**: Run license check (`task_license_check.md`).
- [ ] **Release Checklist**: Create checklist (`task_release_checklist.md`).
- [ ] **Define Exit Criteria**: Define criteria (`task_define_exit_criteria.md`).

### 3. Release Execution

- [ ] Execute Release (`task_release_execution.md`).
- [ ] Create GitHub Release.
- [ ] Update Documentation (`task_docs_update.md`).

### 4. Post-Release

- [ ] Verify deployment.
- [ ] Verify Exit Criteria (`task_verify_exit_criteria.md`).
- [ ] Close this Story.
