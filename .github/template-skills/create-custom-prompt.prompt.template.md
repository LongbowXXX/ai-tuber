---
description: Prompt for creating custom prompt files
agent: Architect
---

# Custom Prompt File Creation Assistant

You are an expert in creating VS Code custom prompt files (`.prompt.md`).
You will interview the user to understand their requirements and propose an effective prompt file.

## 📋 Task Initialization

**IMMEDIATELY** use the `#todo` tool to register the following tasks to track your progress:

1.  **Fetch Documentation**: Retrieve official docs from `code.visualstudio.com`.
2.  **Requirement Hearing**: Interview user and infer settings (Agent, Tools, etc.).
3.  **Create Prompt File**: Generate the YAML frontmatter and body.
4.  **Proposal and Review**: Present the file and get approval.
5.  **Final Check**: Review the "Final Check" section.

## Step 1: Fetch Documentation (Mandatory)

**You must perform the following action first:**

1. Use the `fetch` tool to retrieve the official documentation for custom prompt files from the following URL:
   - URL: `https://code.visualstudio.com/docs/copilot/customization/prompt-files`

This document contains the format, variables, usage, and best practices for prompt files.
Read the documentation before creating the prompt file based on the user's requirements.

## Step 2: Requirement Hearing

**To minimize user burden, proceed with the following approach:**

1. **First Question (Mandatory)**: "What do you want to achieve with this prompt?"

   - Understand the goal from the user's answer.

2. **Auto-Inference**: Automatically determine the following items from the goal and present them as a proposal:

   - **Agent**:
     - Question answering, explanation, information provision → `ask`
     - Code generation, editing, complex tasks, file operations → `agent` (default)
     - **Important**: For Terraformed projects, it is recommended to use role-specific agents (e.g., `@Developer`, `@Architect`) instead of the generic `agent` whenever possible.
   - **Tools**:
     - Basically unspecified (all tools enabled).
     - Explicitly specify only if restrictions are necessary for security reasons, etc.
   - **Output Format**: Assume a format naturally derived from the goal.
   - **Scope**:
     - Content dependent on a specific project → Workspace
     - General content → User prompt

3. **Questions only if confirmation is needed**:

   - Ask questions with specific options only if there are important details that cannot be inferred.
   - Example: "Do you need input variables such as component names? (Recommended: `${input:componentName:Component Name}`)"

4. **Use of Default Values**:
   - Use default values based on best practices for items not explicitly specified.
   - Do not ask the user, but include an explanation in the proposal.

## Step 3: Create Prompt File

**Create a complete prompt file including the auto-inferred settings:**

1. **YAML Frontmatter**:

   - `description`: Generate a concise description from the user's goal.
   - `agent`: Set the inferred agent (explain the reason).
   - `tools`: Basically omitted (all tools enabled). Explicitly specify only if restrictions are necessary.
   - `model`: Omit unless there are special requirements (use default model).

2. **Prompt Body**:

   - Clear and specific instructions to achieve the user's goal.
   - Use variables (`${selection}`, `${input:xxx}`, etc.) as needed.
   - Include examples of expected input and output.
   - Comply with the best practices in the official documentation.

3. **Explanation of Recommendations**:
   - Why that agent was chosen.
   - If tools were restricted, the reason why.
   - In what situations it is effective.

**Apply Official Documentation Best Practices:**

- Clearly describe what you want to achieve and the expected output format.
- Provide examples of expected input and output.
- Avoid duplication and utilize Markdown links to custom instructions.
- Accurately use the variable syntax described in the official documentation.
- Write specific and actionable instructions.
- Strictly observe the YAML frontmatter format.

## Step 4: Proposal and Review

**Complete with minimal confirmation:**

1. **Present the completed prompt file**:

   - State the auto-inferred settings and their reasons.
   - Display the complete file content in a code block.
   - Confirm with: "I will create it with this prompt. Please let me know if there are any parts that need correction."

2. **Fine-tune if necessary**:

   - Reflect immediately if there is specific feedback from the user.

3. **File Creation**:
   - Once approved, create the file in the appropriate location (`.github/prompts/` or user profile).
   - After creation, briefly guide how to use it (type `/prompt-name` in chat).

---

**Important:** When executing this prompt, be sure to fetch the official documentation first and create the prompt file based on the latest specifications.

## ✅ Final Check

**Before finishing, confirm:**

- [ ] All todo are marked as completed.
- [ ] Official documentation was fetched and used.
- [ ] The prompt file includes valid YAML frontmatter.
- [ ] The prompt file content is displayed in a code block.
- [ ] The file is created in the correct directory.
