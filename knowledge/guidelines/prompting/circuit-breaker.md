# Stop and Ask (Circuit Breaker)

## Problem

Agents can sometimes get stuck in a loop of trying seeing errors, trying a guess fix, seeing errors again, and repeating. Or they may proceed with a fix based on a weak assumption that turns out to be wrong, wasting time and potentially damaging code.

## Solution

Explicitly instruct the agent to **STOP** and **ASK** the user if it cannot verify the root cause or if it has failed multiple times.

## Implementation Steps

1.  **Define Stop Conditions**:
    Decide on a reasonable number of attempts (e.g., 3 tries) or specific uncertainty triggers (e.g., "cannot reproduce").

2.  **Add "Constraints" or "Stop Condition" Section**:
    In the prompt or agent template, add a clear rule that overrides the "fix it" mandate.

## Example Template

```markdown
## ⛔ Stop Condition

If you cannot identify the root cause after **3 attempts** or if the fix requires making unverified assumptions:

1.  **STOP** execution.
2.  **Report** your findings and what you have tried so far.
3.  **Ask** the user for further guidance or more information.
```

## Benefits

- **Efficiency**: Prevents "flailing" where the agent burns tokens and time on bad paths.
- **Safety**: Reduces the chance of hallucinated "fixes" breaking things further.
- **Collaboration**: Brings the human back in the loop exactly when needed.
