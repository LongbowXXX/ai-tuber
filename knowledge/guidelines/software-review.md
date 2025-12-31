# Software Review Perspectives

This document outlines the key perspectives for conducting effective code reviews and ensuring software quality.

## 1. Code Review Checklist

### Correctness

- **Functionality:** Does the code perform the intended task correctly?
- **Edge Cases:** Are boundaries and edge cases handled (e.g., null values, empty lists, large inputs)?
- **Logic:** Is the business logic sound and free of flaws?

### Security

- **Vulnerabilities:** Are there standard vulnerabilities (SQLi, XSS, CSRF, etc.)?
- **Input Validation:** Is all external input validated and sanitized?
- **Secrets:** Are there any hardcoded secrets or sensitive data?
- **Authorization:** are permissions properly checked?

### Readability & Maintainability

- **Naming (AI-Native):**
  - **Behavior-Driven:** Function names must describe _what_ they do, not _how_ they do it (e.g., `calculate_total` vs `loop_and_add_prices`).
  - **Standard English:** Use standard, globally recognized software terminology. Verify grammar (Subject-Verb-Object). Avoid cryptic abbreviations or local slang (e.g., `check_auth` is better than `chk_prms`).
  - **Contextual:** Names must include full context to be self-documenting for AI context windows (e.g., `user_id` not `uid`).
  - **Verbs:** Use precise action verbs (e.g., `fetch_user` vs `get_user` vs `load_user`).
  - **Booleans:** Use question forms for boolean variables/functions (e.g., `is_active`, `has_permission`).
  - **No Ambiguity:** Avoid generic names like `data`, `info`, `temp` unless the scope is extremely small (e.g. loops).
- **Structure:**
  - **Single Responsibility:** Does each class/function do exactly one thing? Avoid "God Objects" or "God Functions".
  - **Meaningful Units:** Are modules and functions split by domain concept or logical behavior, rather than arbitrary size or type?
  - **Cohesion:** Do the elements within a class/module belong together?
- **Complexity:** Is the logic overly complex? Can it be simplified?
- **Comments:**
  - **Public APIs:** Public classes and methods MUST have comments (DocStrings/JSDoc) that follow the language's conventions and project policy.
    - _Exception:_ Comments may be omitted if the naming is fully self-evident (e.g., `get_id()`).
  - **Internal:** Are complex sections explained? Are comments up-to-date?
- **Consistency:** Does the code follow the project's coding style and conventions?

### Performance

- **Efficiency:** Are there any obvious performance bottlenecks (e.g., N+1 queries, nested loops)?
- **Resource Usage:** Is memory and resource usage verified?
- **Resource Leaks:** Are streams, database connections, and file handles properly closed/released (e.g., using `try-finally` or `using`/`with` statements)?

### Testing

- **Coverage:** Is the new code covered by automated tests?
- **Quality:** Do the tests actually verify the behavior (not just coverage padding)?
- **Scenarios:** Are failure, success and edge case scenarios testing?

### Documentation

- **API Docs:** If APIs changed, are docs updated?
- **Comments:** Are internal comments clear and helpful?

## 2. PR Quality Checklist

When reviewing the Pull Request itself, ensure it adheres to the strict guidelines defined in:

- [PR Creation Guidelines](./pr-creation-guidelines.md)

**Key Checks:**

- **Description:** Does it explain **WHY** and **WHAT**?
- **Verification:** Are manual/automated verification steps explicitly listed?
- **Completeness:** Are screenshots/recordings included for UI changes?
