# Workflow (AI Collaborative Model)

This is a new workflow for collaboration between AI and human engineers.
In each phase, AI performs tasks such as "Proposing", "Drafting", "Implementing", and "Verifying", while humans focus on "Decision Making", "Reviewing", and "Final Approval".

## Overview

### Concepts

- **Process in Issue**: Records of discussions, decision-making processes, and considerations are kept in GitHub Issues.
- **Result in Git**: Final artifacts such as specifications, designs, code, and test results are managed in the Git repository.
- **AI as a Partner**: AI acts not just as a tool, but as a partner in pair programming.

## Phase Definitions

```mermaid
graph TD
    Start([Start]) --> Req
    Req["1. Requirement Phase"] --> Design
    Design["2. Design Phase"] --> Impl
    Impl["3. Implementation Phase"] --> Verify
    Verify["4. Verification Phase"] --> Release
    Release["5. Release Phase"] --> End

    Verify -.->|Bug Fix| Impl
    Impl -.->|Spec Change| Design
    End([End])
```

### 0. Issue Reporting

**Goal**: Report problems, request features, or ask questions to initiate the workflow.

- **Key Deliverables**:
  - [Bug Report](../templates/issues/report_bug.md) -> Triggers **Bug Fix Story**
  - [Feature Request](../templates/issues/report_feature.md) -> Triggers **Feature Story**
  - [Question](../templates/issues/report_question.md) -> May trigger a **Task** (e.g., for a documentation update)

### 1. Requirement Phase

**Goal**: Clarify WHY we are doing this and WHAT problem we are solving.

- **AI Role**: **@BusinessAnalyst** (Skill: `/requirements`)
  - Organizing requirements, identifying unknowns, researching similar features, drafting user stories.
- **Human Role**: Presenting requirements, defining scope, judging business value.
- **Key Deliverables**:
  - [Requirement Definition Task](../templates/issues/task_requirement.md) (Purpose, Context, Scope, Exit Criteria)
  - **Artifact**: `docs/specs/[FeatureName]/requirements.md`

### 2. Design Phase

**Goal**: Concretize HOW to achieve it and prevent rework.

- **AI Role**: **@Architect** (Skill: `/design`)
  - Drafting specifications, proposing architecture, defining interfaces.
- **Human Role**: Design decisions, security risk assessment, specification approval.
- **Key Deliverables**:
  - [Design Discussion Task](../templates/issues/task_design.md)
  - **Artifact**: `docs/specs/[FeatureName]/specification.md`
  - **Artifact**: `docs/specs/[FeatureName]/design.md`
  - **Artifact**: `docs/specs/[FeatureName]/implementation_plan.md`

### 3. Implementation Phase

**Goal**: Create code that works as designed.

- **AI Role**:
  - **@Developer** (Skill: `/implement`)
    - Implementing code, creating unit tests, updating documentation, drafting commit messages.
  - **@Gardener** (Skill: `/refactor`)
    - Performing safe refactoring to improve code structure without changing behavior.
- **Human Role**: Code review, assisting with complex logic, directing AI.
- **Key Deliverables**:
  - Source Code, Test Code (Git)
  - Pull Request (Git)
  - [Implementation Task](../templates/issues/task_implementation.md)

### 4. Verification Phase (QA)

**Goal**: Guarantee quality and decide on release.

- **AI Role**:
  - **@QualityGuard** (Skill: `/test-spec`, `/audit`, `/sanity-test`)
    - Creating Test Specifications.
  - **@Debugger** (Skill: `/debug`)
    - Analyzing bugs found during verification and proposing fixes.
    - **Ref**: [Debugging Guidelines](../guidelines/debugging.md)
  - Assisting test case execution, identifying bugs, and proposing fixes.
- **Human Role**: Exploratory testing, usability checks, release decision.
- **Key Deliverables**:
  - **Artifact**: `docs/specs/[FeatureName]/test-specs/*.md` (Test Specifications)
  - **Artifact**: `docs/specs/fixes/[IssueID]/fix-plan.md` (Bug Fix Plans)
  - [Sanity Test Result](../templates/issues/task_test_sanity.md)
  - [Functional Test Result](../templates/issues/task_test_functional.md)
  - [Exit Criteria Check Task](../templates/issues/task_verify_exit_criteria.md)

### 5. Release Phase

**Goal**: Deliver value to the user.

- **AI Role**: **@Librarian** (Skill: `/release-new-version`)
  - Generating CHANGELOG, creating release notes, automating tagging.
- **Human Role**: Final approval, pushing the release button (or approving).
- **Key Deliverables**:
  - Release Notes (GitHub Releases)
  - Tags (Git)

## Work Breakdown Structure (WBS)

To ensure high quality, we follow a concrete "Story" structure for execution.

### Feature Story

One story per independent feature. If dependencies exist, reconsider the story boundaries.

```mermaid
graph TD
    Start([Start]) --> T0
    T0["1. Requirement Definition<br/>📄 Issue (Requirement)"] --> T1
    T1["2. Spec Creation & Agreement<br/>📄 Git (Spec)"] --> T2
    T1 --> T3
    T2["3. Define Exit Criteria<br/>📋 Issue (Exit Criteria)"] --> T10
    T3["4. Design<br/>📐 Git (Docs)"] --> T4
    T3 --> T5
    T5 --> T6
    T4["5. Update Sanity Checklist<br/>📋 Git (Sanity)"] --> T7
    T5["6. Create Test Spec<br/>✓ Git (Test Spec)"] --> T8
    T6["7. Implementation & Tests<br/>💻 Git (Code)"] --> T7
    T6 --> T8
    T7["8. Run Sanity Tests<br/>📊 Issue (Result)"] --> T10
    T8["9. Run Feature Check<br/>📊 Issue (Result)"] --> T10
    T10["10. Verify Exit Criteria<br/>✅ Issue (Record)"] --> End
    End([Completed])

    classDef startEnd fill:#e1f5e1,stroke:#4caf50,stroke-width:2px,color:#000
    classDef task fill:#e3f2fd,stroke:#2196f3,stroke-width:2px,color:#000
    classDef check fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000

    class Start,End startEnd
    class T0,T1,T2,T3,T4,T5,T6 task
    class T7,T8,T10 check
```

**Legend**:

- 🟢 Green: Start/End
- 🔵 Blue: Task (Creating Artifacts)
- 🟠 Orange: Verification/Check Task

**Detailed Steps**: Refer to [Feature Task Details](./feature_task_details.md).

### Bug Fix Story

For fixing bugs, emphasizing "Reproduction" and "Prevention".

```mermaid
graph TD
    Start([Start]) --> T1
    T1["1. Analyze & Plan<br/>📄 Issue (Comment)"] --> T2
    T2["2. Create Reproduction Test<br/>💻 Git (Test)"] --> T3
    T3["3. Implement Fix<br/>💻 Git (Code)"] --> T4
    T4["4. Verify Fix (Test)<br/>📊 Issue (Result)"] --> T5
    T4 --> T6
    T5["5. Verify Side Effects<br/>👀 Issue (Result)"] --> T7
    T6["6. Update Documentation<br/>📚 Git (Docs)"] --> T7
    T7["7. Verify Exit Criteria<br/>✅ Issue (Record)"] --> End
    End([Resolved])

    classDef startEnd fill:#e1f5e1,stroke:#4caf50,stroke-width:2px,color:#000
    classDef task fill:#e3f2fd,stroke:#2196f3,stroke-width:2px,color:#000
    classDef check fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000

    class Start,End startEnd
    class T1,T2,T3,T6 task
    class T4,T5,T7 check
```

**Legend**:

- 🟢 Green: Start/End
- 🔵 Blue: Task
- 🟠 Orange: Verification

**Detailed Steps**: Refer to [Bug Fix Task Details](./bug_fix_task_details.md).

### Release Story

Create a specific story for releasing the application.

```mermaid
graph TD
    Start([Start]) --> T1
    Features[Feature Stories Completed] --> T2

    T1["1. Agree on Version & Tag<br/>📄 Issue (Spec)"] --> T6
    T1 --> T7
    T2["2. Verify Related Fixes<br/>📋 Issue (Record)"] --> T3
    T3["3. Run Sanity Test<br/>🧪 Issue (Result)"] --> T4
    T3 --> T5
    T4["4. Vulnerability Check<br/>🔒 Issue (Result)"] --> T9
    T5["5. Static Analysis<br/>🔍 Issue (Result)"] --> T9
    T6["6. Update Documentation<br/>📚 Git (Docs)"] --> T9
    T7["7. License Check<br/>⚖️ Issue/Git (Record)"] --> T9
    T8["8. Create Release Checklist<br/>✓ Issue (Checklist)"] --> T9
    Features --> T8
    T8 --> T10
    T9["9. Run Pre-release Checks<br/>📊 Issue (Result)"] --> T11
    T10["10. Define Exit Criteria<br/>📋 Issue (Exit Criteria)"] --> T12
    T11["11. Execute Release<br/>🚀 Git (Tag/Artifact)"] --> T12
    T12["12. Verify Exit Criteria<br/>✅ Issue (Record)"] --> End
    End([Released])

    classDef startEnd fill:#e1f5e1,stroke:#4caf50,stroke-width:2px,color:#000
    classDef prereq fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#000
    classDef task fill:#e3f2fd,stroke:#2196f3,stroke-width:2px,color:#000
    classDef check fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000
    classDef release fill:#ffebee,stroke:#f44336,stroke-width:2px,color:#000

    class Start,End startEnd
    class Features prereq
    class T1,T6,T8,T10 task
    class T2,T3,T4,T5,T7,T9,T12 check
    class T11 release
```

**Legend**:

- 🟢 Green: Start/End
- 🟣 Purple: Prerequisite
- 🔵 Blue: Task
- 🟠 Orange: Verification
- 🔴 Red: Release Criteria

**Detailed Steps**: Refer to [Release Task Details](./release_task_details.md).

## Related Documents

- [Deliverables List](./deliverables.md)
- [Template List](../templates/)
