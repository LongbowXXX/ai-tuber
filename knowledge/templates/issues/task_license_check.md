---
name: License Check Task
about: Verify dependency licenses for compliance
title: "⚖️ License Check: [Version/Component]"
labels: ["legal", "verification"]
assignees: []
---

## 🎯 Objective

Ensure all third-party libraries comply with the project's license policy (e.g., no GPL contamination for commercial/proprietary projects).

## 🛠️ Tools Used

- [ ] `pip-licenses` (Python)
- [ ] `license-checker` (Node.js)
- [ ] Other:

## 📝 Activities

- [ ] Update `docs/licenses.md` (or equivalent) with the latest dependency list.
- [ ] Commit the updated license list to Git.

## 📊 Findings

### Problematic Licenses (e.g., GPL, AGPL)

- [ ] [Package Name]: [License Type]
  - Usage Context: [Internal Tool / Distributed Binary / SaaS]
  - Action: [Replace / Keep (Exempt)]

### Unknown Licenses

- [ ] [Package Name]
  - Investigation Result:

## ✅ Exit Criteria

- [ ] License list file updated and committed.
- [ ] All dependency licenses checked.
- [ ] No issues with commercial use.
- [ ] Confirmation recorded on ticket.
