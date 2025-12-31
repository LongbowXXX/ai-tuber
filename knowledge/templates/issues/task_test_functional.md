# Functional Test Result Template

## Overview

Template for recording detailed functional test results based on Acceptance Criteria.

## Exit Criteria

- [ ] All check items executed.
- [ ] Normal and Abnormal cases checked.
- [ ] Results recorded.
- [ ] Issues found handled.
- [ ] Confirmation results recorded on ticket.

## Structure

```markdown
# [Test] Functional Test Result: {Feature Name}

## Test Environment

- Version: {Commit Hash / Version}
- OS/Browser: {Environment Info}
- Date: {YYYY-MM-DD}
- Runner: {Name}

## Target

Test Case (Git): `docs/specs/{Feature Name}/test-specs/spec.md`

## Result Summary

| Target    | Total  |   OK   |  NG   | Skip  |  Result  |
| :-------- | :----: | :----: | :---: | :---: | :------: |
| Normal    |   10   |   10   |   0   |   0   |   PASS   |
| Abnormal  |   5    |   5    |   0   |   0   |   PASS   |
| **Total** | **15** | **15** | **0** | **0** | **PASS** |

## Detailed Results (Only for NG/Skip)

| Case ID          | Result | Log/Note           |
| :--------------- | :----- | :----------------- |
| FT-{Feature}-XXX | NG     | Error Message: ... |

## Notes

- Any special notes
```
