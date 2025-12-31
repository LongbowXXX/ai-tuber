# Simulation-Based Verification (Perspective Taking & Evidence)

## Problem

When simply asking the AI to "check for consistency" or "review documents," it often performs a superficial pattern match. It may miss deep logical gaps. Furthermore, without explicit evidence logs, the user cannot easily verify _what_ the AI actually checked, forcing them to blindly trust the summary or read verbose internal thought logs.

## Solution

Instruct the AI to **Simulate** a specific scenario from a specific **Perspective** (e.g., "New Developer") and **Record Evidence** for every check. Force it to perform a "Mental Walkthrough" step-by-step. For each step, it must explicitly log the **Input** (what it found), the **Verdict** (Pass/Fail), and the **Evidence** (specific file/line or logic) in the final output.

## Implementation Steps

1.  **Define the Perspective**: Explicitly state who the AI is simulating (e.g., "You are a new developer joining the team").
2.  **Define the Scenario**: logical flow to simulate (e.g., "Adding a new feature").
3.  **Mandate Evidence Logging**: Explicitly instruct the AI to write down _what_ it checked in the final report (e.g., "Checked file X, found Y") rather than just "Checked: OK".
4.  **Step-by-Step Verification**: Ask the AI to list the steps and for each, check Input, Process, and Output.

## Example Template

```markdown
## Simulation: New Feature Implementation

Perform a "Mental Walkthrough" acting as a **New Developer**.
For each step, you MUST log your findings in the report as **Evidence**:

1.  **Requirement Definition**

    - **Simulation**: I am looking for the requirement template.
    - **Check**: Is the output template and save path defined?
    - **Evidence**:
      - Found template in `requirements.prompt.md` at line 15. (✅ PASS)
      - Save path is defined as `docs/specs/`. (✅ PASS)

2.  **Architectural Design**
    - **Simulation**: I am trying to run the design skill using the requirement doc.
    - **Check**: Does the skill explicitly reference the Requirement Document as input?
    - **Evidence**:
      - `design.prompt.md` references `{{requirements_files}}` variable. Linkage is valid. (✅ PASS)

**Report**: Check that each output template and directory is defined. Log specific evidence for every check.
```

## Benefits

- **High Recall**: Finds logic holes that static analysis misses.
- **User Empathy**: Identifies "friction" or frustration points in the process.
- **Auditability**: The user can verify the AI's work by reading the evidence log, building trust without high cognitive load.
