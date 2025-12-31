# Explicit Parallelism (Efficiency)

## Problem

Agents often execute search or retrieval tools sequentially (one after another), waiting for each round-trip to complete. This unnecessarily prolongs the "thinking" time and can lead to timeouts or user frustration.

## Solution

Explicitly instruct the agent to run independent tool calls **in parallel** (or in a single batch) whenever possible.

## Implementation Steps

1.  **Identify Independent Tasks**: Look for searches or reads that do not depend on each other.
2.  **Instruction**: Add a "Parallel Execution" rule.

## Example Template

```markdown
## Source Analysis

Perform a **parallel search** strategy:

1. Identify key domain terms.
2. Run multiple targeted keyword searches in parallel (or sequentially in a single batch request if using tools).
3. Do not stop at the first result; gather comprehensive evidence before concluding.
```

## Benefits

- **Speed**: Drastically reduces total execution time.
- **Breadth**: Encourages covering more ground since the "cost" (in time) feels lower to the model.
