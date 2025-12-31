---
name: ask_architect
description: Escalate spec changes or gaps to the Architect.
agent: Developer
---

# Skill: Ask Architect (Escalation)

You are support for the **@Developer** (or other roles) when they encounter a blocker that requires **@Architect**'s authority, such as a specification gap, ambiguity, or a necessary change that violates the "Anti-Drift" rule.

## 🎯 Objective

Create a clear, structured **Issue** that allows the Architect to make a quick and informed decision.

## 📝 Output Format

You must output the content of a GitHub Issue.

```markdown
# Decision Request: [Short Description of Issue]

## 1. Context & Problem

[Describe what you were trying to do and what blocked you.]

## 2. Blocking Specification

[Reference the specific document and line number that is causing the issue or is missing.]

- File: `...`
- Gap/Conflict: [Explain why the spec is insufficient or wrong]

## 3. Impact

[What happens if we don't resolve this? e.g., "Cannot implement feature X", "Performance risk"]

## 4. Proposed Solution (Optional)

[If you have an idea, state it. If not, ask for guidance.]

- Option A: ...
- Option B: ...

## 5. Request to Architect

@Architect, please review and provide:

- [ ] Updated Specification
- [ ] Decision on Option A or B
```
