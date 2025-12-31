# AI Literacy: Human AI-Readiness

## 🛑 Why this matters?

> **"A codebase can only be as 'AI-Ready' as the humans who work on it."**

The Terraformer project transforms your legacy codebase into an **AI-Ready** environment. However, providing AI with the perfect context (`AGENTS.md`) and tools is only half the battle. If the humans collaborating with the AI don't know how to interact with it effectively, the potential is lost.

This document is designed to **upgrade human skills**. Its purpose is to make **YOU** "AI-Ready" — enabling you to lead, direct, and collaborate with your new AI agents efficiently.

---

## 🧠 Level 0: The Mindset (Continuous Evolution)

> **"Be the Chef, not just a Cook."**

In the age of AI, "coding" (writing syntax) is becoming a commodity—like chopping onions. To survive as a professional engineer, you must evolve from a "Cook" (who follows recipes) to a "Chef" (who designs menus and creates value).

- **The Cook**: Follows instructions, writes code as specified. **Replaceable by AI**.
- **The Chef**: Designs intent, orchestrates AI, and verifies quality. **Irreplaceable**.

### The Survival Strategy

Technology skills have a half-life of **< 2.5 years**. If you only learn during business hours (performance time), you will become obsolete. You must invest in "practice time" (self-study) outside of work to maintain your market value.

👉 **Required Reading**: [The Survival Strategy: Chef vs Cook](./self-study.md)

---

## 🎯 Level 1: Paradigm Shift (Beginner)

Stop treating AI as a "search engine" or a "chatbot." Treat it as a **junior teammate** who has read every line of code but lacks "common sense" or "business context."

### Recommended Actions

1.  **Don't Search, Ask**: Instead of Googling specific syntax, ask the AI to write it for your specific context.
2.  **Delegation Logic**: Instead of "writing code," shift to "reviewing code."
    - _Old Way_: Write the boilerplate, then fill in logic.
    - _New Way_: "Generate the boilerplate for a user service in clean architecture," then refine the logic.
3.  **Explain the "Why" (Intent)**: Just as you clarify "Why" and "What" rather than just "How" when gathering business requirements, you must provide this context to the AI (the implementer). If the AI doesn't understand the goal, it can't choose the best implementation. _(Don't become the "incompetent client" for your AI! 😜)_

---

## 🚀 Level 2: Mastery of Command (Intermediate)

Once you are comfortable, you must learn to **direct** the AI with precision. This is where "Prompt Engineering" (Inter-species Communication) comes in.

> **💡 Pro Tip**: For advanced prompting strategies including the **SSG Framework (Situation, Source, Goal)**, see [Advanced Strategies](./advanced-strategies.md).

### 1. The Art of Direction (Prompting)

Your results are directly proportional to the clarity of your instructions.

- **Be Specific**: "Make it fast" -> "Optimize for O(n) complexity."
- **Provide Persona**: "Act as a Software Architect" yields very different results than "Act as a Developer." (The former focuses on design patterns and trade-offs, while the latter focuses on implementation details.)
- **Chain of Thought**: Ask the AI to "think step-by-step" to reduce errors in complex tasks.

👉 **Deep Dive**: Refer to [Prompting Techniques](../prompting/README.md) for advanced strategies.

### 2. Context Engineering (Giving AI the "Map")

AI is like a super-skilled new hire who joined the team **today**. They know how to write code perfectly, but they know **nothing** about _this_ project.

- **Why it matters**: Without context, AI guesses. It might suggest a library you aren't using, violate architecture rules, or reinvent the wheel.
- **Context is King**: The quality of the output is 100% dependent on the quality of context you provide.
- **How to provide context**:
  - **Reference Files**: Don't just ask "fix this." Open the relevant files so the AI can "see" them (or tag them like `#Main.ts`).
  - **Background Info**: Explain _why_ you are doing this task. "To improve performance" vs "To fix a crash" leads to different code.
  - **Project Knowledge**: This project uses `AGENTS.md` and `docs/` to automate some context, but your specific task context must come from **YOU**.
  - **Mechanics**: Learn how to use [Neighboring Tabs & @workspace vs #file](./context-management.md) to control what the AI sees.

### 3. Understanding Your Teammate (LLM Characteristics)

To lead effectively, you must know your team's strengths and weaknesses.

- **Context Window**: It doesn't remember _everything_ forever. Remind it of critical rules if the conversation gets long.
- **Hallucinations**: It is a creative engine, not a database. It can invent plausible-looking libraries. **Always Verify.**
- **Bias**: It mimics the patterns it was trained on. If you write messy code, it will suggest messy code.

---

## 🛡️ Level 3: Defensive AI Programming (Security & Safety)

As your trust in AI grows, so does the risk. You must learn to treat AI generated code with the same suspicion as code found on a random forum.

> **🛡️ Full Protocol**: For detailed security checklists, "Vibe Coding" prevention, and anti-slopsquatting rules, read [Advanced Strategies & Security Protocols](./advanced-strategies.md).

### Core Principle: Zero Trust

Treat all AI output as **"Untrusted External Input"**.

- Code generated by AI is NOT secure by default.
- It may contain vulnerabilities, bugs, or subtle logical errors.
- **Rule**: Never commit code you haven't read, understood, and verified.

---

## 🛠 Project Recommended Tools

To effectively work in an AI-Ready environment, we recommend:

- **GitHub Copilot**: Your pair programmer.

### Learning Resources (Level Up)

- [Microsoft Learn: Copilot Training](https://learn.microsoft.com/en-us/training/browse/?products=ms-copilot)
  - Official training modules for Microsoft Copilot products.
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
  - Official documentation containing features, guides, and best practices.
- [VS Code Copilot Overview](https://code.visualstudio.com/docs/copilot/overview)
  - Comprehensive guide for using Copilot within VS Code.
- [Awesome Copilot](https://github.com/github/awesome-copilot)
  - A curated list of useful resources, demos, and tools for GitHub Copilot.
- [AGENTS.md Specification](https://github.com/openai/agents.md)
  - The open standard format for defining AI agent context used in this project.
- [VS Code Repository](https://github.com/microsoft/vscode)
  - VS Code is developed using VS Code and Copilot. A great reference for settings and Copilot prompts.
- [VS Code GitHub Copilot Extension](https://github.com/microsoft/vscode-copilot-chat)
  - The official GitHub Copilot Chat extension for VS Code. Source code and implementation details.
