# Debugging Guidelines: The Scientific Method

> **"Debugging is like being the detective in a crime movie where you are also the murderer."** — Filipe Fortes

This document defines the standard process and mindset for debugging in the Terraformer project.
The most important thing in bug fixing is not "fixing it quickly" but **"reliably identifying the cause and ensuring the same problem never happens again (prevention of recurrence/horizontal expansion)"**.

## 1. Core Principles

### 🚫 No Guesswork

Fixes based on guesses like "maybe this is the cause" ("Vibe Fix") are strictly prohibited.
You must not change code without a clear stack trace or error logs.

- **Bad**: "It looked like an async issue, so I added `await`."
- **Good**: "I added logs to check the execution order and confirmed that it was being referenced before data acquisition, so I added `await`."

### 🔗 Logical Consistency

Bug reports and fix proposals must be logically connected in a single line through the following three points:

1.  **Symptom**: What is happening?
2.  **Root Cause**: Why is it happening? (Mechanism)
3.  **Fix**: Why does this fix resolve it?

"The cause is unknown, but rewriting the code fixed it" is not acceptable. That merely hides the bug and may create side effects.

### 🛡️ Do No Harm

Confirming that "the bug is fixed" is not enough. The fix is only complete when you confirm that "nothing else is broken".
Always be aware of how the code being fixed is referenced by other functions (dependencies).

### 🌐 Yokoten (Horizontal Expansion)

Suspect that **"a bug occurring in one place may be occurring in other places"**.
Once the cause of a bug is identified, check if similar code patterns or misuse of the same library exist in other files, and eliminate that type of problem from the entire project.

## 2. Investigation Techniques

### 🪵 Instrumentation (Visualization via Logs)

If the cause of the error is not immediately apparent from the logs, do not stare at the code, but **make the code speak**.

- **Console Logging**: Output variable values, function entry/exit, and conditional branch results to logs.
- **Trace IDs**: When multiple asynchronous processes are running, attach request IDs etc. to make logs traceable.

> **Rule**: Debug logs must be deleted after resolution or changed to an appropriate log level (e.g., DEBUG).

### ⏳ Timing & Concurrency (Reproduction of Timing Issues)

Race Conditions and asynchronous timing issues may be difficult to reproduce in normal execution.
In such cases, **intentionally insert delays (Sleep) to support your hypothesis**.

- **Hypothesis**: "Does the error occur because Process A finishes before Process B?"
- **Verification**: Insert `sleep(5000)` immediately after Process A to intentionally let Process B precede.
- **Judgment**: If the error is reliably reproduced with this, the hypothesis is correct. Implement exclusive control or appropriate waiting processes.

### ✂️ Bisection Method

Identifying "when it broke" is a shortcut to identifying the cause.

- **Git Bisect**: Use the bisect feature of the version control system to identify the commit (culprit) where the bug was introduced.

### 🔍 Pattern Search (Search for Similar Patterns)

Use IDE search functions or `grep` for horizontal expansion.

- **Regex Search**: Search for specific description patterns that caused the bug (e.g., forgotten `await`, misuse of specific functions) using regular expressions.
- **Structural Search**: If it cannot be found by simple string search, consider searching based on AST (Abstract Syntax Tree).

## 3. Workflow for @Debugger

AI Agents (`@Debugger`) and human developers must follow the flow below:

1.  **Observation**
    - Read error messages, logs, and user reports.
2.  **Hypothesis**
    - Formulate a hypothesis like "Because XX is YY, error ZZ is occurring".
3.  **Experiment (Reproduction)**
    - **Before writing fix code based on guesses**, verify the hypothesis.
    - Insert logs, `sleep`, or write reproduction tests if necessary.
4.  **Analysis**
    - Identify the specific cause location (file, line number) and logic flaw.
5.  **Impact Analysis**
    - Check where the fix target is referenced from (dependent relationships) and evaluate the risk of regression.
6.  **Fix Planning**
    - Formulate a fix that removes the root cause and minimizes side effects.
7.  **Horizontal Expansion (Yokoten)**
    - **Step**: Identify the code pattern that caused the bug.
    - **Action**: Search the entire project to check if similar patterns exist.
    - **Fix**: If found, include them in the scope of this fix (or raise as a separate Issue).
8.  **Verification (Verification & Regression Testing)**
    - **Step 1: Confirm Fix**: Confirm that the bug is fixed.
    - **Step 2: Confirm No Regression**: Confirm that "related functions" identified in the impact analysis work normally.

## 4. Checklist for Reviewers

When reviewing pull requests (PR) for debug fixes, check the following:

- [ ] **Is the cause clear?**: Is it not just "fixed somehow"?
- [ ] **Is there a reproduction procedure?**: Is it described how the bug was confirmed?
- [ ] **Is the impact range considered?**: Is there mention of the impact on other functions using the fixed part?
- [ ] **Was Horizontal Expansion (Yokoten) performed?**: Is there evidence that "other similar bugs" were checked?
- [ ] **Is testing sufficient?**:
  - Test proving the bug is fixed (Positive Test)
  - Test proving existing functionality is not broken (Regression Test)
