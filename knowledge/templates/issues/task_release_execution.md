---
name: Execute Release
about: Perform the release actions
title: "🚀 Execute Release: [Version]"
labels: ["release", "ops"]
assignees: []
---

## 🎯 Objective

Execute the release process to publish the new version to users.

## 📝 Activities

- [ ] **Tagging**: Create and push Git Tag (`vX.Y.Z`).
- [ ] **GitHub Release**: Create release page on GitHub.
  - Title: `vX.Y.Z`
  - Body: Paste Release Notes/CHANGELOG content.
  - Upload: Artifacts (if any).
- [ ] **Publish**: Push to package registry (if applicable).
- [ ] **Announcement**: Send release announcement (Slack, Discord, Email, etc.).

## 📊 Results

- Release URL:

## ✅ Exit Criteria

- [ ] Git Tag created and pushed.
- [ ] GitHub Release Page created.
- [ ] Release notes written.
- [ ] Artifacts uploaded.
- [ ] Published to package registry (if applicable).
- [ ] Release announcement sent.
