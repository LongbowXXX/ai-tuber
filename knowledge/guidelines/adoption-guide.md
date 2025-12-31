# Ideal Adoption Guide: Maximizing Terraformer

This guide outlines the recommended workflow for introducing Terraformer to your project. By following these steps, you build a high-context environment where AI agents can collaborate effectively from Day 1.

## Phase 0: Preparation (Before Terraforming)

AI agents rely on **Explicit Context**. The more information you provide _before_ they arrive, the smarter they will be.

1.  **Gather Existing Knowledge**

    - Find existing design documents, API specifications, database schemas, and external documentation URLs.
    - **Action**: Commit these files to your repository (e.g., in a `docs/` or `references/` folder).

2.  **Create an Index (The "Crawlable" Root)**
    - AI agents typically start scanning from the project root.
    - **Action**: Update your root `README.md` to include links to the documents gathered in step 1.
    - _Why?_ If it's not linked from the root (or standard locations), the agents might miss it.

## Phase 1: Terraforming (Installation)

Follow the standard installation instructions in the [README](../../README.md).

1.  **Install**: Copy the `.github` and `knowledge` directories.
2.  **Initialize Context**: Run `/terraform-context` to generate the initial `AGENTS.md`.
3.  **Summon Agents**: Run `/terraformer` to generate project-specific agent personas and skills.

### Anatomy of a Terraformed Project

After installation, your project structure will look like this:

```
my-project/
├── .github/
│   ├── agents/          # (Generated) Active agents for this project (e.g., architect.agent.md)
│   ├── prompts/         # (Generated) Skills and SOPs (e.g., plan.prompt.md)
│   └── ...              # Templates used by the meta-engine
├── knowledge/           # (Static) Universal knowledge from Terraformer
│   ├── guidelines/      # AI Literacy, Review Guidelines, etc.
│   └── ...
├── docs/                # (Dynamic) Project-specific documentation (Context Map)
│   ├── rules/           # Project rules (naming conventions, local workflows)
│   ├── specs/           # Feature specifications
│   └── ...
└── AGENTS.md            # (Dynamic) The Constitution & Context Map
```

## Phase 2: Refinement (Post-Terraforming)

Now that the "AI Team" is installed, use them to improve the project's "AI-Readiness".

### 1. Excavate Implicit Specifications

Legacy code often contains business rules that are not documented.

- **Action**: Ask `@BusinessAnalyst` to reverse-engineer specifications from key files.
  - _Prompt_: "Analyze `src/core/pricing.ts` and document the pricing logic as a User Story in `docs/specs/pricing.md`."

### 2. Update & Detail Documentation

Auto-generated docs are a starting point. Make them richer.

- **Action**: Ask `@Architect` to generate diagrams.
  - _Prompt_: "Create a Mermaid sequence diagram showing the authentication flow based on the current code."

### 3. Define Project Rules

Every project has unique conventions (naming, testing, directory structure).

- **Action**: Document these in `docs/rules/` or add them to `AGENTS.md` (Constitution).
- _Tip_: If an agent makes a mistake, don't just correct the code—**correct the prompt (instruction)**. Add a rule so it doesn't happen again.

### 4. Establish Collaborative Workflows

Shift from "Command & Control" to "collaboration".

- Regularly update `AGENTS.md` as the project evolves.

> **Goal**: The ultimate goal is to have a repository where **Documentation is the Source Code**. Any developer (human or AI) should be able to read the docs and understand exactly how the system works without guessing.

## Appendix: Knowledge vs. Docs

To prevent confusion, we separate "Universal Principles" from "Project Reality".

| Directory        | Type                    | Description                                                                                                                                                                                                                        |
| :--------------- | :---------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`knowledge/`** | **Immutable** (Mostly)  | Contains the "Textbook" of the ANTP method. These files (like _AI Literacy_ or _Review Guidelines_) are generic and apply to _any_ project. You typically **do not** edit these unless you are customizing the methodology itself. |
| **`docs/`**      | **Mutable**             | Contains the "State" of _your_ project. This is where you write specs, architecture diagrams, and project-specific rules (`docs/rules/`). **This is where the Agents work.**                                                       |
