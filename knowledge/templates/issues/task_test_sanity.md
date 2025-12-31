# Sanity Test Result Template

## Overview

Template for recording quick check (health check) results to see if major features are working correctly.

## Structure

```markdown
# [Test] Sanity Test Result

## Environment

- Version: {Commit Hash / Version}

## Checklist Reference

Please execute using the latest Sanity Checklist on Git (`docs/tests/sanity.md`).

## Execution

- [ ] All check items executed.
- [ ] Results recorded.
- [ ] Issues found handled.

**Execution Result**

| Version       |   Result    | Date         | Runner | Note                      |
| :------------ | :---------: | :----------- | :----- | :------------------------ |
| {Commit Hash} | PASS / FAIL | {YYYY-MM-DD} | {Name} | All OK / Failed at ST-003 |
```
