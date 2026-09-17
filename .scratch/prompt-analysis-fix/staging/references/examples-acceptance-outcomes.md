# Iterator Examples: Acceptance Outcomes

Loaded on demand from `SKILL.md`. Worked end-to-end examples for per-prompt subagent iteration that explains outcomes: low acceptance, technique correlation, and qualitative failure analysis. Each example shows Setup → Subagent prompt → Synthesis.

## Example 2: Analyze why prompts had low acceptance

**User asks:** "Why do some of my prompts have low acceptance rates?"

**Setup:**
```bash
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN low_acceptance_reason TEXT"
git-ai prompts exec "UPDATE pointers SET current_seq_id = (SELECT MIN(seq_id) - 1 FROM prompts WHERE accepted_rate < 0.5 AND accepted_rate IS NOT NULL)"
```

**Subagent prompt:**
```
Run `git-ai prompts next` to get the next prompt as JSON.

IMPORTANT: All data you need is in this JSON output. Do NOT run git commands.
Analyze the `messages` field directly.

This prompt had a low acceptance rate (human modified most of the AI's code).
Analyze the messages JSON and identify the likely reason:
- "vague_request" - the prompt was unclear or underspecified
- "wrong_approach" - AI took a fundamentally wrong approach
- "style_mismatch" - code worked but didn't match project conventions
- "partial_solution" - AI only solved part of the problem
- "overengineered" - AI added unnecessary complexity
- "context_missing" - AI lacked necessary context about the codebase
- "other" - explain briefly

Update the database:
git-ai prompts exec "UPDATE prompts SET low_acceptance_reason='<reason>' WHERE id='<prompt_id>'"

Return: prompt id, the reason, and specific evidence from the conversation.
```

## Example 5: Correlate prompting techniques with acceptance rate

**User asks:** "Correlate my prompting techniques with acceptance rate"

**Setup:**
```bash
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN technique TEXT"
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN technique_notes TEXT"
git-ai prompts reset
```

**Subagent prompt:**
```
Run `git-ai prompts next` to get the next prompt as JSON.

IMPORTANT: All data you need is in this JSON output. Do NOT run git commands.
Analyze the `messages` field directly.

Analyze the HUMAN's prompting technique in the messages. Identify which techniques were used:
- "example_driven" - provided examples of desired output or behavior
- "step_by_step" - broke down the request into steps or phases
- "context_heavy" - provided extensive background/context about the codebase
- "minimal" - terse, brief request with little context
- "iterative" - built up solution through back-and-forth refinement
- "constraint_focused" - emphasized what NOT to do or specific requirements
- "reference_based" - pointed to existing code/files to follow as patterns
- "multiple" - combined several techniques (list them in notes)

Also note any specific effective or ineffective patterns in technique_notes.

git-ai prompts exec "UPDATE prompts SET technique='<technique>', technique_notes='<notes>' WHERE id='<prompt_id>'"

Return: prompt id, technique identified, the acceptance_rate, and your observations.
```

**Synthesis query:**
```sql
SELECT technique,
       COUNT(*) as count,
       ROUND(AVG(accepted_rate), 3) as avg_acceptance,
       ROUND(MIN(accepted_rate), 3) as min_acceptance,
       ROUND(MAX(accepted_rate), 3) as max_acceptance
FROM prompts
WHERE technique IS NOT NULL AND accepted_rate IS NOT NULL
GROUP BY technique
ORDER BY avg_acceptance DESC
```

## Example 6: Qualitative analysis of failed prompts

**User asks:** "Do a qualitative analysis of failed prompts (0 accepted)"

**Definition of "failed prompts":**
- `accepted_lines IS NULL` - conversation happened but no code was committed
- `accepted_lines = 0` - code was generated but human rejected/rewrote all of it

**Setup:**
```bash
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN failure_analysis TEXT"
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN failure_category TEXT"
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN improvement_suggestion TEXT"
-- Set pointer to iterate only over failed prompts
git-ai prompts exec "DELETE FROM pointers WHERE name='default'"
git-ai prompts exec "INSERT INTO pointers (name, current_seq_id) VALUES ('default', (SELECT MIN(seq_id) - 1 FROM prompts WHERE accepted_lines IS NULL OR accepted_lines = 0))"
```

**Subagent prompt:**
```
Run `git-ai prompts next` to get the next prompt as JSON.

IMPORTANT: All data you need is in this JSON output. Do NOT run git commands.
Analyze the `messages` field directly.

This prompt resulted in 0% acceptance - the human rejected or completely rewrote all AI-generated code.

Perform a qualitative analysis by reading the full conversation in messages JSON:

1. **What was requested?** Summarize the human's goal.
2. **What did the AI produce?** Summarize what code/solution was generated.
3. **Why did it fail?** Categorize into:
   - "misunderstood_intent" - AI solved the wrong problem
   - "poor_code_quality" - bugs, errors, or broken code
   - "wrong_technology" - used wrong framework/library/approach
   - "incomplete" - only partially addressed the request
   - "style_violation" - worked but violated project conventions
   - "overcomplicated" - solution far more complex than needed
   - "security_issue" - introduced vulnerabilities
   - "abandoned" - user changed direction mid-conversation

4. **How could the prompt be improved?** Specific, actionable suggestion.

git-ai prompts exec "UPDATE prompts SET failure_category='<category>', failure_analysis='<analysis>', improvement_suggestion='<suggestion>' WHERE id='<prompt_id>'"

Return a detailed analysis including: prompt id, what was requested, what went wrong, and how to prompt better next time.
```

**Synthesis:**
```sql
SELECT failure_category,
       COUNT(*) as count,
       GROUP_CONCAT(id, ', ') as prompt_ids
FROM prompts
WHERE failure_category IS NOT NULL
GROUP BY failure_category
ORDER BY count DESC
```

Then review individual `failure_analysis` and `improvement_suggestion` values to compile lessons learned.
