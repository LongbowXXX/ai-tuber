# AI Literacy: Advanced Strategies & Security Protocols

> **"From Writer of Code to Architect of Intent."**

In `README.md`, you learned the basic posture of treating AI as a partner. This document defines the **Terraformer Standard Prompting Strategy (SSG)** to maximize AI capabilities and the **Defensive Protocols** to manage risk.

---

## 🧠 1. Input Over Structure (The SSG Framework)

Modern AI models (Gemini 3 Pro, GPT-5.2, etc.) can process vast amounts of context. Discard the old wisdom of "summarizing info for brevity." Shift to a style of **"providing raw primary sources sufficiently."**

### The 3S Principle (Terraformer Standard)

Three principles for context provision:

1.  **Specific**:
    - Do not say "it's weird"; say "it returns error code 500".
2.  **Sufficient**:
    - **Important**: Do not fear long texts. Rather than editing information down, paste entire logs or codes.
    - For AI, "insufficient information" is far more harmful than "too much information (noise)".
3.  **Source-based**:
    - Do not explain in your own words; present "primary sources (Source)" like error logs, actual code, and specs as they are.

### The S.S.G. Framework

The prompt structure recommended by Terraformer. If "Situation" and "Source" are sufficient, the "Goal" needs only be one line.

1.  **Situation**
    - Primary information on "what is happening."
    - Paste error logs, console outputs, etc., without summarizing.
2.  **Source**
    - Use `#file` or `@workspace` to attach relevant files, config files, and specifications.
    - If in doubt, provide more rather than less.
3.  **Goal**
    - A concise declaration of "what you want to do."
    - Ex: "Fix this error." / "Write a test case for this logic."

---

## 🛡️ 2. Defensive AI Programming (Risk Management)

AI is a machine that probabilistically tells "plausible lies." Understand the following risks and practice defensive development.

### 🚫 Prohibit "Vibe Coding"

**Vibe Coding** is the act of adopting AI-generated code just because it "seems to work (Good Vibes)" without understanding the logic.

- **Rule**: You must not commit a single line of code that you cannot explain yourself.

### ☠️ Slopsquatting (Package Hallucination)

AI may propose non-existent package names as "hallucinations" (e.g., `fast-json-secure`). Attackers anticipate these "names AI tends to suggest," register them on npm or PyPI, and plant malware (**Slopsquatting**).

- **🚨 CRITICAL RULE**: When AI suggests an `npm install` or `import`, **you must search the package in a browser to confirm it is official and truly exists.** Installing unverified packages leads directly to supply chain attacks.

### 🛡️ Security Checklist

- **SQL Injection**: Are you concatenating raw SQL strings? (Force usage of placeholders/ORM)
- **Secrets**: Are API keys hardcoded?
- **Data Leak**: Are you entering PII (Personally Identifiable Information) into prompts?

---

## 📝 3. Spec-Driven Development (SDD)

The best way to prevent "Vibe Coding" is to write **Specs** before letting it write code.

### Workflow

1.  **Write Spec**: Write the requirements of the feature you want to implement in a Markdown file (e.g., `specs/login.md`). Including Mermaid diagrams is even more effective.
2.  **Feed Context**: Load the spec into Copilot (`#file`).
3.  **Generate**: Instruct it to "Implement specifically according to `#login.md`."

By doing this, the AI generates code based on "Clear Truth (Ground Truth)" rather than "Probabilistic Guesswork," drastically reducing logical breakdowns.

---

## 🏗️ 4. Context Engineering (Using the Brain)

Terraformer has already "engineered" the project's memory. Your job is to **leverage** it.

### `AGENTS.md` (The Central Brain)

This project is equipped with an `AGENTS.md` file that acts as the source of truth for AI context.

- **Role**: It defines the project's architecture, tech stack, and coding standards.
- **Action**: **Read it.** You don't need to memorize it, but you must know what rules the AI is trying to follow. If the AI makes a mistake, check if `AGENTS.md` is outdated.

---

**"Trust, but Verify."**
You are required to act as an "Orchestrator" who provides sufficient information (Source) to the AI and strictly verifies its output (Code).

---

## 🤝 5. AI Collaborative Workflow

To maximize the potential of these strategies, we follow a structured collaboration process.

### **Terraformer Standard Workflow**

We have defined a standard workflow that clarifies the division of roles between AI and Humans in each phase (Requirement, Design, Implementation, Verification, Release).

- **Rule**: Always follow the [AI Collaborative Model](../../workflows/workflow.md) when proceeding with tasks.
- **Key Concept**:
  - **Process in Issue**: Discussions and decisions are recorded in GitHub Issues.
  - **Result in Git**: Final artifacts (code, specs) are managed in Git.
