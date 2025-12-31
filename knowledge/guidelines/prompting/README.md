# Copilot Custom Prompting Techniques

This directory contains effective techniques for creating custom prompts for GitHub Copilot in VS Code.

## Reliability & Execution

- [Input Over Structure (3S + S.S.G.)](../ai-literacy/advanced-strategies.md): Prioritize raw context over summarized explanations to avoid hallucinations.
- [Task Management with #todo](task-management.md): Enforce structured execution and prevent missed steps.
- [Stop and Ask (Circuit Breaker)](circuit-breaker.md): Prevent infinite loops or bad assumption chains.
- [Sequential Inquiry](sequential-inquiry.md): Reduce cognitive load by asking questions one by one.

## Context & Environment

- [Knowledge Retrieval](knowledge-retrieval.md): Fetch latest specs to avoid training data cutoff limits.
- [Dynamic Context Protocol](dynamic-context.md): Research-first approach to gather deep context.
- [Environment-Agnostic Tools](environment-agnostic.md): Support user-defined tools without hardcoding.

## Quality & Safety

- [Transparency & Hallucinations](transparency.md): Tag AI-generated content and manage expectations.
- [Multilingual Guardrails](multilingual-guardrails.md): Prevent translation from altering critical instructions.
- [Simulation-Based Verification](simulation-verification.md): Force perspective-taking to catch logic gaps.

## Efficiency & Reasoning

- [Few-Shot Chain of Thought](few-shot-cot.md): Improve reasoning quality with concrete thinking examples.
- [Explicit Parallelism](explicit-parallelism.md): Speed up execution by running independent tools in parallel.
- [Iterative Changes](iterative-changes.md): Propose config changes one by one to avoid overwhelm.

## Structure & Syntax

- [XML + Markdown Structured Prompting](xml-structured-prompting.md): Combine XML tags and Markdown for machine-parseable and human-readable prompts.
