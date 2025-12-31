# PR Creation Guidelines

This document strictly defines the structure and content requirements for Pull Requests (PRs) in this project.
Strict adherence to these guidelines ensures efficient reviews and maintains a high-quality codebase.

## 1. Title Format

There are no strict naming conventions for PR titles in this project.
Please ensure the title is **Clear and Concise** so that the purpose of the PR can be understood at a glance.

## 2. Description Requirements

The PR description serves as the persistent record of context. It MUST answer **"Why"** and **"What"** clearly.

### General Principles

- **30-Second Rule:** Reviewers should be able to grasp the "Why" and "What" within **30 seconds**.
- **Organized & Concise:** Use bullet points. Avoid long paragraphs.
- **DRY (Don't Repeat Yourself):** Avoid excessive explanation.
- **Self-Evident Changes:** If the code diff makes the change obvious (e.g., renaming, simple logic fix), do not explain it in prose.
- **No Redundancy:** Do not repeat details already present in the linked issue.

### Structure

#### 1. Context (The "Why")

- **Link to Issue:** Must link to the related Jira/GitHub issue (e.g., `Fixes #123`).
- **Motivation/Background:**
  - **DRY Principle:** If details are in the linked issue, **OMIT** them here.
  - Do not duplicate information. Excessive detail increases reviewer load.
  - Only highlight what is specific to this implementation or differs from the ticket.

#### 2. Changes (The "What")

- **Summary:** A bulleted list of specific changes. **Keep it high-level.** Do not narrate the diff line-by-line.
- **Impact Scope:** Explicitly list the functional and technical areas affected by this change.
- **For Bug Fixes:** (See [Debugging Guidelines](debugging.md))
  - **Root Cause:** Explain the causal mechanism of the bug (Why did it happen?).
  - **Countermeasure:** Explain how the fix addresses the root cause.
  - **Horizontal Expansion (Yokoten):** Confirm if similar patterns were checked/fixed elsewhere in the codebase.
- **Technical Decisions:** Explain _why_ a specific approach was chosen if alternatives existed.
- **Migration/Breaking Changes:** Explicitly state if this requires database migrations, config updates, or breaks existing APIs.

#### 3. Verification (The "Proof")

- **Coverage:** Verification steps MUST cover the full scope defined in **Impact Scope** and **Root Cause**.
- **Manual Tests:** Focus on **WHAT** was verified, not the detailed steps.
  - _Bad:_ "1. Click button A. 2. Wait 5s. 3. Check logs..."
  - _Good:_ "Verified that clicking button A triggers the correct API call and updates the UI state."
  - **Complex Procedures:** If the test procedure is complex, document it in the **Ticket/Issue** and just reference it here.
- **Automated Tests:** Confirm which tests were run and if new tests were added.
- **Screenshots/Media:** **MANDATORY** for any UI or visual changes. Include "Before" and "After" comparisons if applicable.

#### 4. Risks

- Highlight any potential risks, side effects, or areas that need extra careful review.

## 3. Self-Check before Requesting Review

- [ ] Title is clear and concise.
- [ ] Description is complete and follows the structure above.
- [ ] Code has been linted and formatted.
- [ ] Tests pass locally.
- [ ] No extraneous files (debug logs, temp files) are included.
