---
name: Release Checklist
about: Final pre-release verification
title: "🚀 Release Checklist: [Version]"
labels: ["release", "verification"]
assignees: []
---

## 🎯 Objective

Perform final verification before executing the release to ensure quality and completeness.

## ✅ Checklist

### 1. Operation Check

- [ ] Feature Verification: All features in this release are verified.
- [ ] Regression: Sanity tests passed?
- [ ] Specific Release Scenarios:

### 2. Quality & Security

- [ ] Vulnerability Check completed? (Link: #IssueID)
- [ ] Static Analysis completed? (Link: #IssueID)
- [ ] License Check completed? (Link: #IssueID)

### 3. Documentation

- [ ] `README.md` updated?
- [ ] `CHANGELOG.md` updated?
- [ ] Version numbers in docs match the release version?

### 4. Artifacts

- [ ] Build successful?
- [ ] Artifacts (binaries/packages) generated correctly?

### 5. Version Control

- [ ] Version number in code updated (e.g., `package.json`, `pyproject.toml`)?
- [ ] All changes committed?

## 🏁 Conclusion

- [ ] **GO**: Ready for Release
- [ ] **NO GO**: Release Aborted (Reason: )

## ✅ Exit Criteria

- [ ] All check items covered.
- [ ] Check items are specific and executable.
- [ ] Check items recorded on ticket.
