# Specification Guidelines: XML + Gherkin + Mermaid

This document explains the philosophy and usage of the structured specification format used in `specification.template.md`.

## 1. Philosophy: Why this combination now?

Traditionally, Gherkin was treated merely as an "intermediate language for automated tests". However, in the era of AI coding, its value has changed dramatically.

### The "Ultimate Prompt" for AI

LLMs (Large Language Models) prefer structured text. Compared to ambiguous natural language specifications, Gherkin (segmented by Given/When/Then) allows the AI to accurately understand context and generate high-precision code. The process of writing Gherkin itself functions as **Chain-of-Thought** prompting, enhancing the AI's reasoning accuracy.

### Understanding "Diagrams" as Code

Explaining complex flows or state transitions with text alone is difficult. By using **Mermaid** notation, diagrams can be written as "text (code)". GitHub Copilot understands Mermaid syntax, enabling it to read visualized logic (branching and state transitions) and reflect it in implementation code and test cases.

### Preventing Divergence (Living Documentation)

By co-locating Diagrams (Mermaid) and Behavior (Gherkin) within the specification (Feature file), the document is version-controlled alongside the code, preventing it from becoming stale.

## 2. Component Guide

### XML Containers

Use these tags to wrap content sections. This helps the AI parser locate specific information types.

- `<requirements>`: Business rules and user needs.
- `<technical_design>`: Engineering specifications.
- `<gherkin>`: Specific block for BDD scenarios.
- `<mermaid_diagram>`: Specific block for visual diagrams.

### Gherkin (Behavioral Specs)

Used for Acceptance Criteria.

- **Feature**: High-level functionality.
- **Scenario**: Concrete examples of behavior.
- **Given/When/Then**: Preconditions, Actions, Outcomes.

### Mermaid (Visual Specs)

Used for Architecture and Logic Flow.

- **Flowchart**: Decision trees, process flows.
- **Sequence Diagram**: Async processes, API interactions.
- **State Diagram**: Lifecycle management (e.g., Order statuses).

## 3. Guide for Handling Complexity

When specifications become complex (many branches, deep logic), simple Gherkin lists become unreadable. Use these three patterns to manage complexity.

### Pattern A: Structure with `Rule` (Gherkin 6.0)

For complex business logic with many variations, do not list Scenarios flatly. Use the `Rule` keyword to group them.

**Bad (Flat List):**

```gherkin
Scenario: User under 20 cannot buy
Scenario: User over 20 can buy
Scenario: Member gets discount
Scenario: Non-member pays full price
```

**Good (Structured with Rule):**

```gherkin
Feature: Product Purchase

Rule: Age Restriction
  Scenario: User under 20 cannot buy
    ...
  Scenario: User over 20 can buy
    ...

Rule: Pricing
  Scenario: Member gets discount
    ...
```

_Benefit: AI understands the logical grouping, reducing conditional logic errors._

### Pattern B: Visual BDD (Mermaid)

For cyclic flows, complex asynchronous processes, or state machines, text is insufficient.

- **Strategy**: Use Gherkin only for the "Happy Path" and "Representative Errors".
- **Full Logic**: Delegate the strict exhaustive logic to a Mermaid diagram.
- **Instruction to AI**: "Implement edge cases based on the Mermaid diagram."

### Pattern C: Declarative Steps (Screenplay Pattern)

Avoid imperative, low-level UI details in specifications. Focus on User Intent (**What**), not Implementation Details (**How**).

**Bad (Imperative):**

```gherkin
When I click the ID field
And I type "user"
And I click the password field
And I type "pass"
And I click the Login button
```

**Good (Declarative - Screenplay Style):**

```gherkin
When I login as a standard user
```

_Benefit: Decouples specification from UI implementation. Agents like `@Developer` are excellent at translating high-level intents ("login") into specific code (Playwright/Puppeteer actions)._
