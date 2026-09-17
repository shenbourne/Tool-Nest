# Iterator Examples: Prompt Quality and Patterns

Loaded on demand from `SKILL.md`. Worked end-to-end examples for per-prompt subagent iteration that assesses the human's prompts: categorization, reusable patterns, clarity scoring, and best-practice grading. Each example shows Setup → Subagent prompt → Synthesis.

## Example 1: Categorize prompts by work type

**User asks:** "Categorize my prompts by work type (bug fix, feature, refactor, docs)"

**Setup:**
```bash
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN work_type TEXT"
git-ai prompts reset
```

**Subagent prompt:**
```
Run `git-ai prompts next` to get the next prompt as JSON.

IMPORTANT: All data you need is in this JSON output. Do NOT run git commands.
Analyze the `messages` field directly.

Read the messages JSON and categorize this prompt into ONE of:
- "bug_fix" - fixing broken behavior, errors, or regressions
- "feature" - adding new functionality
- "refactor" - restructuring code without changing behavior
- "docs" - documentation, comments, READMEs
- "test" - adding or modifying tests
- "config" - configuration, build, CI/CD changes
- "other" - doesn't fit above categories

Update the database:
git-ai prompts exec "UPDATE prompts SET work_type='<category>' WHERE id='<prompt_id>'"

Return: the prompt id, your categorization, and a one-sentence reason.
```

**Synthesis query:**
```sql
SELECT work_type, COUNT(*) as count,
       ROUND(AVG(accepted_rate), 3) as avg_acceptance,
       SUM(accepted_lines) as total_lines
FROM prompts
WHERE work_type IS NOT NULL
GROUP BY work_type
ORDER BY count DESC
```

## Example 3: Identify prompts that could be turned into reusable patterns

**User asks:** "Which of my prompts solved problems I might face again?"

**Setup:**
```bash
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN reusable_pattern TEXT"
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN pattern_description TEXT"
git-ai prompts reset
```

**Subagent prompt:**
```
Run `git-ai prompts next` to get the next prompt as JSON.

IMPORTANT: All data you need is in this JSON output. Do NOT run git commands.
Analyze the `messages` field directly.

Analyze whether this prompt represents a reusable pattern worth saving:
- Look for: common coding tasks, useful abstractions, clever solutions
- Skip: one-off fixes, highly context-specific changes, trivial edits

If reusable, set reusable_pattern to a short name (e.g., "api_error_handling", "form_validation", "test_mocking")
and pattern_description to a one-sentence description of what it does.

If not reusable, set both to NULL.

git-ai prompts exec "UPDATE prompts SET reusable_pattern='<name>', pattern_description='<desc>' WHERE id='<prompt_id>'"

Return: prompt id and whether you marked it as reusable (with the pattern name if yes).
```

## Example 4: Score prompt quality/clarity

**User asks:** "How clear are my prompts? Which ones could I have written better?"

**Setup:**
```bash
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN clarity_score INTEGER"
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN clarity_feedback TEXT"
git-ai prompts reset
```

**Subagent prompt:**
```
Run `git-ai prompts next` to get the next prompt as JSON.

IMPORTANT: All data you need is in this JSON output. Do NOT run git commands.
Analyze the `messages` field directly.

Score the HUMAN's prompt clarity from 1-5:
5 = Crystal clear: specific goal, context provided, constraints stated
4 = Good: clear intent, minor ambiguities
3 = Adequate: understandable but missing helpful context
2 = Vague: required AI to make significant assumptions
1 = Unclear: AI had to guess what was wanted

Also provide brief feedback on how the prompt could be improved.

git-ai prompts exec "UPDATE prompts SET clarity_score=<1-5>, clarity_feedback='<feedback>' WHERE id='<prompt_id>'"

Return: prompt id, score, and your feedback.
```

**Synthesis query:**
```sql
SELECT clarity_score, COUNT(*) as count,
       ROUND(AVG(accepted_rate), 3) as avg_acceptance
FROM prompts
WHERE clarity_score IS NOT NULL
GROUP BY clarity_score
ORDER BY clarity_score DESC
```

## Example 7: Grade prompts according to best practices

**User asks:** "Grade my prompts according to best practices"

**Setup:**
```bash
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN grade TEXT"
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN grade_breakdown TEXT"
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN grade_feedback TEXT"
git-ai prompts reset
```

**Subagent prompt:**
```
Run `git-ai prompts next` to get the next prompt as JSON.

IMPORTANT: All data you need is in this JSON output. Do NOT run git commands.
Analyze the `messages` field directly.

Grade the HUMAN's prompt against these best practices for AI-assisted coding:

**Grading Criteria (each worth 0-2 points):**

1. **Specificity (0-2)**: Does the prompt clearly state what needs to be done?
   - 0: Vague or ambiguous ("fix this", "make it better")
   - 1: General direction but missing details ("add validation")
   - 2: Specific outcome described ("add email validation that checks format and shows inline error")

2. **Context (0-2)**: Does the prompt provide necessary background?
   - 0: No context, assumes AI knows everything
   - 1: Some context but missing key details
   - 2: Relevant files, constraints, or project patterns mentioned

3. **Scope (0-2)**: Is the request appropriately sized?
   - 0: Too broad ("rewrite the app") or impossibly vague
   - 1: Large but manageable, could be broken down
   - 2: Focused, single-responsibility task

4. **Constraints (0-2)**: Are requirements and boundaries specified?
   - 0: No constraints given when they'd be helpful
   - 1: Some constraints but missing important ones
   - 2: Clear about what to do AND what not to do

5. **Testability (0-2)**: Can success be verified?
   - 0: No way to know if the result is correct
   - 1: Implicit success criteria
   - 2: Explicit expected behavior or acceptance criteria

**Calculate total (0-10) and assign grade:**
- A (9-10): Excellent prompt, follows best practices
- B (7-8): Good prompt, minor improvements possible
- C (5-6): Adequate prompt, notable gaps
- D (3-4): Poor prompt, significant issues
- F (0-2): Ineffective prompt, needs major revision

Store breakdown as JSON: {"specificity": X, "context": X, "scope": X, "constraints": X, "testability": X}

git-ai prompts exec "UPDATE prompts SET grade='<A-F>', grade_breakdown='<json>', grade_feedback='<specific feedback>' WHERE id='<prompt_id>'"

Return: prompt id, grade, total score, and one key improvement suggestion.
```

**Synthesis query:**
```sql
SELECT grade,
       COUNT(*) as count,
       ROUND(AVG(accepted_rate), 3) as avg_acceptance,
       SUM(accepted_lines) as total_lines_accepted
FROM prompts
WHERE grade IS NOT NULL AND accepted_rate IS NOT NULL
GROUP BY grade
ORDER BY grade
```

**Correlation analysis:**
```sql
-- See if grade correlates with acceptance rate
SELECT
    grade,
    ROUND(AVG(accepted_rate), 3) as avg_acceptance,
    COUNT(*) as n
FROM prompts
WHERE grade IS NOT NULL AND accepted_rate IS NOT NULL
GROUP BY grade
ORDER BY
    CASE grade
        WHEN 'A' THEN 1
        WHEN 'B' THEN 2
        WHEN 'C' THEN 3
        WHEN 'D' THEN 4
        WHEN 'F' THEN 5
    END
```
