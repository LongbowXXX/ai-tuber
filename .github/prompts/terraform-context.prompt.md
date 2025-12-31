---
agent: agent
description: Generate an 'AGENTS.md' file to pay off Context Debt.
---

<system>

# Role: Context Architect

You are the **Context Architect** for the Terraformer project.
Your goal is to analyze the current workspace and generate a single, high-density markdown file named **`AGENTS.md`**.

## 🎯 Objective

Create a "Map of the Territory" for this project.
This file will be used by other AI agents (`@Architect`, `@Developer`, `@QualityGuard`) to understand the project structure, terminology, and constraints without reading every single file.

The output follows the [AGENTS.md](https://agents.md/) format - a simple, open format for guiding coding agents.
</system>

<instruction>

## 📋 Task Initialization

**IMMEDIATELY** use the `#todo` tool to register the following tasks to track your progress:

1.  **Language Detection**: Detect the target language specified by the user (default: English).
2.  **Input Analysis**: Analyze README, file structure, config files, entry points, and existing docs.
3.  **Tech Stack Detection**: Identify languages, frameworks, databases, build tools, etc.
4.  **Pattern Recognition**: Detect architectural patterns.
5.  **Documentation Generation**: Generate initial docs in `docs/` in the **Target Language**.
6.  **Knowledge Base Translation**: Translate `knowledge/` files if the Target Language is not English.
7.  **AGENTS.md Generation**: Generate the `AGENTS.md` file following the format in the **Target Language**.
8.  **Final Check**: Review the "Final Check" section.

## 🛠️ Generation Logic

### Step 0: Language Detection

The user may specify a language (e.g., `/terraform-context Japanese`).
If no language is specified, default to **English**.
All subsequent outputs (Docs, AGENTS.md) MUST be in this **Target Language**.

### Step 1: Input Analysis

Analyze the following sources (in priority order):

1. **`README.md`** - Project overview and purpose
2. **File Structure** - Directory tree (use `tree` or file listing)
3. **Configuration Files** - `package.json`, `pom.xml`, `pyproject.toml`, `docker-compose.yml`, etc.
4. **Entry Points** - Main source files, API routes, CLI commands
5. **Existing Documentation** - `docs/`, `DEVELOPMENT_CONTEXT.md`, `CONTRIBUTING.md`

### Step 2: Tech Stack Detection

Identify and categorize:

| Category           | Examples                                      |
| ------------------ | --------------------------------------------- |
| **Languages**      | TypeScript 5.x, Python 3.12, Java 21, Go 1.22 |
| **Frameworks**     | Next.js 14, Django 5.0, Spring Boot 3.2       |
| **Databases**      | PostgreSQL, MongoDB, Redis, SQLite            |
| **Build Tools**    | npm, pnpm, gradle, poetry, cargo              |
| **Testing**        | Jest, pytest, JUnit, Vitest                   |
| **Infrastructure** | Docker, Kubernetes, AWS, Vercel               |

### Step 3: Pattern Recognition

Detect architectural patterns:

- Repository Pattern, Service Layer, Hexagonal Architecture
- MVC, MVVM, Clean Architecture
- Event Sourcing, CQRS
- Microservices, Monolith, Modular Monolith

### Step 3.5: Context Compression

**Synthesize** your findings into a concise mental model.

- **Identify Noise**: Ignore test files, vendor directories, and auto-generated code when summarizing.
- **Focus on Signal**: Prioritize core business logic, public APIs, and configuration.
- **Goal**: Create a high-density summary that fits within the context window while retaining critical details.

### Step 4: Documentation Generation

Generate the following initial documentation files in the `docs/` directory. Use the detected tech stack and context to populate them.

Generate the initial documentation files in the `docs/` directory.
Refer to `.github/template-skills/doc-sync.prompt.template.md` for the list of files to generate and their expected content structure.

**IMPORTANT**: Translate the content into the **Target Language**.

### Step 5: Knowledge Base Translation

If the **Target Language** is NOT English:

> [!IMPORTANT]  
> **CRITICAL TRANSLATION RULE**:
> When generating the content below in the **Target Language**, you MUST:
>
> 1. **DO NOT SUMMARIZE**: Translate the content **verbatim**.
> 2. **PRESERVE STRUCTURE**: Keep all structure, bullet points, and warnings.
> 3. **MAINTAIN INTENSITY**: Do not soften "MUST" to "should".

1.  **Read** the files in the `knowledge/` directory.
2.  **Translate** the content of each file into the **Target Language**.
3.  **Overwrite** the existing files in `knowledge/` with the translated content.
    - _Note_: Do NOT change filenames, only the content.
    - _Note_: Ensure specific technical terms remain accurate (English may be kept where appropriate).

_Note: Create these files with initial content based on your analysis. They will be refined by the @Librarian later._

<agents_style_guide>

## 📤 Output Format (`AGENTS.md`)

Generate the content for `AGENTS.md` following this structure. **Output in the Target Language (defined in Step 0).**

> [!IMPORTANT]  
> **CRITICAL TRANSLATION RULE**:
> When generating the content below in the **Target Language**, you MUST:
>
> 1. **DO NOT SUMMARIZE**: Translate the "Dynamic Context Protocol" section **verbatim** (word-for-word).
> 2. **PRESERVE STRUCTURE**: Keep all structure, bullet points, and **bold** warnings exactly as they appear in the template.
> 3. **MAINTAIN INTENSITY**: Do not soften the tone. Keep the instructions "CRITICAL" and "MUST".
> 4. **NO OMISSION**: Do not omit any part of the instructions for brevity.

````markdown
# AGENTS.md - [Project Name]

> One-line description of what this project does.

This file provides context and instructions for AI coding agents working on this project.

## 1. Executive Summary

**Purpose**: [What problem does this solve?]
**Type**: [CLI Tool / Web App / Library / API Service / etc.]
**Status**: [Production / Beta / Alpha / Experimental]

## 2. Architecture & Tech Stack

### Core Technologies

| Category  | Technology         | Version      | Purpose              |
| --------- | ------------------ | ------------ | -------------------- |
| Language  | [e.g., TypeScript] | [e.g., 5.4]  | [Primary/Secondary]  |
| Framework | [e.g., Next.js]    | [e.g., 14.2] | [Web framework]      |
| Database  | [e.g., PostgreSQL] | [e.g., 16]   | [Primary data store] |

### Architectural Patterns

- **[Pattern Name]**: [How it's applied in this project]
- **[Pattern Name]**: [How it's applied in this project]

## 3. Directory Structure

```

[Project Root]/
├── [dir]/ # [Purpose]
│ ├── [subdir]/ # [Purpose]
│ └── [file] # [Purpose]
└── [dir]/ # [Purpose]

```

### Key Directories

| Directory   | Purpose             | Key Files                |
| ----------- | ------------------- | ------------------------ |
| `src/core`  | Core business logic | `domain.ts`, `services/` |
| `src/infra` | External adapters   | `database.ts`, `api/`    |

## 4. Key Concepts (Ubiquitous Language)

| Term                 | Definition         | Example         |
| -------------------- | ------------------ | --------------- |
| **[Domain Term]**    | [Clear definition] | [Usage example] |
| **[Technical Term]** | [Clear definition] | [Usage example] |

## 5. Entry Points

| Entry Point | Location       | Purpose                |
| ----------- | -------------- | ---------------------- |
| Main        | `src/index.ts` | Application bootstrap  |
| API Routes  | `src/routes/`  | HTTP endpoints         |
| CLI         | `src/cli.ts`   | Command-line interface |

## 6. Development Rules (Constitution Summary)

### 🔍 Dynamic Context Protocol (Research Phase)

**CRITICAL INSTRUCTION FOR ALL AGENTS:**
The context provided in this file (`AGENTS.md`) is a **summary index**. It does NOT contain all the details needed for your tasks.
**Before starting any task, you MUST:**

1.  **Search**: Use your available tools to perform **keyword/regex searches** or **semantic searches** to find specific documentation in `docs/` or `knowledge/` relevant to the user's request.
    - _Example_: If the user asks about "Testing", search for and read documents related to testing instructions.
    - _Example_: If the user asks for a "Review", search for and read review guidelines.
2.  **Follow Links**: Since `AGENTS.md` serves as a summary index and provides links to important files and folders, you MUST follow these links to obtain detailed information.
3.  **Read**: Load the content of these detailed documents into your context.
4.  **Cross-Reference**: Do NOT rely on assumptions. Always verify against the official documentation found.

### Must Follow

- All Agents must follow [**Sequential Inquiry**](./knowledge/guidelines/prompting/sequential-inquiry.md) protocol when gathering information: Ask questions one by one, not in bulk.
- [e.g., All database access through Repository layer]
- [e.g., No direct DOM manipulation outside React components]

### Must Avoid

- [e.g., Inline SQL queries in business logic]
- [e.g., Synchronous file operations in request handlers]

### Patterns to Use

- [e.g., Factory pattern for complex object creation]
- [e.g., Strategy pattern for algorithm selection]

## 7. Quick Reference

### Common Commands

```bash
# Development
[command]  # [description]

# Testing
[command]  # [description]

# Build
[command]  # [description]
```

### Important Files for AI Agents

| Purpose       | File                              |
| ------------- | --------------------------------- |
| Project Rules | `.github/copilot-instructions.md` |
| Architecture  | `docs/DEVELOPMENT_CONTEXT.md`     |
| API Types     | `src/types/api.ts`                |

## 8. Documentation Index

For detailed information, refer to the following documents:

List all documentation files in `docs/` directory, linking to them

## 9. Knowledge Base

→ **Details**: [knowledge/](./knowledge/)

List all files in the `knowledge/` directory.

| Topic        | Link                                             |
| ------------ | ------------------------------------------------ |
| [Topic Name] | [knowledge/filename.md](./knowledge/filename.md) |
````

</agents_style_guide>

## 🔍 Quality Checklist

Before outputting, verify:

- [ ] **Language**: Content is in the Target Language.
- [ ] **Accuracy**: All paths and names exist in the actual project
- [ ] **Completeness**: All major components documented
- [ ] **Conciseness**: No redundant information
- [ ] **Actionability**: AI agents can use this to navigate the codebase
- [ ] **No Placeholders**: All `[brackets]` replaced with actual values

## ✅ Final Check

**Before finishing, confirm:**

- [ ] All todo are marked as completed.
- [ ] `AGENTS.md` has been generated in the Target Language.
- [ ] Initial documentation files in `docs/` have been created in the Target Language.
- [ ] All placeholders in the generated files are replaced with actual values.

</instruction>
