# Pull Request Template

## 1. Context (The "Why")

- **Link to Issue:** Fixes #{Issue Number}
- **Motivation/Background:**
  - {Briefly explain the motivation. OMIT if details are already in the linked issue.}
  - {Highlight what is specific to this implementation or differs from the ticket.}

## 2. Changes (The "What")

- **Summary:**

  - {High-level bullet points of specific changes}
  - {Do not narrate the diff line-by-line}

- **Impact Scope:**
  - {Explicitly list the functional and technical areas affected}

<!-- SECTION: FOR BUG FIXES (Delete if not applicable) -->
<!-- See: knowledge/guidelines/debugging.md -->

- **Root Cause:** {Why did it happen?}
- **Countermeasure:** {How the fix addresses the root cause}
- **Horizontal Expansion (Yokoten):** {Confirm if similar patterns were checked/fixed elsewhere}
<!-- END SECTION -->

- **Technical Decisions:**

  - {Explain why a specific approach was chosen if alternatives existed}

- **Migration/Breaking Changes:**
  - {Database migrations, config updates, API breaks? or "None"}

## 3. Verification (The "Proof")

- **Coverage:** {Verification steps covering Impact Scope and Root Cause}

### Manual Tests

- {Focus on WHAT was verified, not detailed steps}
- [ ] {Example: Verified that clicking button A triggers the correct API call and updates the UI state}

### Automated Tests

- [ ] {Which tests were run?}
- [ ] {Were new tests added?}

### Screenshots/Media

<!-- MANDATORY for UI/Visual changes -->

- {Include "Before" and "After" comparisons if applicable}

## 4. Risks

- {Potential risks, side effects, or areas that need extra careful review}

## 5. Self-Check

- [ ] Title is clear and concise.
- [ ] Description is complete and follows the structure above.
- [ ] Code has been linted and formatted.
- [ ] Tests pass locally.
- [ ] No extraneous files (debug logs, temp files) are included.
