---
name: prompt-analysis
description: "Analyze AI prompting patterns and acceptance rates"
argument-hint: "[question about prompts]"
allowed-tools: ["Bash(git-ai:*)", "Read", "Glob", "Grep", "Task"]
---

# Prompt Analysis Skill

Analyze AI prompting patterns using the local `prompts.db` SQLite database.

## What is Git AI?

Git AI is a tool that tracks AI-generated code and prompts in git. It stores:
- Every AI conversation (prompts and responses)
- Which lines of code came from AI vs human edits
- Acceptance rates (how much AI code was kept vs modified)
- Associated commits and authors

This skill queries that data to help users understand their AI coding patterns.

## Initialization

First, determine scope from the user's question:

| User mentions | Flags to use |
|---------------|--------------|
| "my prompts" or nothing specified | (default - current user, current repo) |
| "team", "everyone", "all authors" | `--all-authors` |
| "all projects", "all repos" | `--all-repositories` |
| specific person's name | `--author "<name>"` |
| specific time range | `--since <days>` (default: 30) |

Run initialization:
```bash
git-ai prompts [flags]
```

This creates/updates `prompts.db` in the current directory.

## Choose an Analysis Approach

**Aggregate questions** (metrics, comparisons) use direct SQL:
```bash
git-ai prompts exec "SELECT model, AVG(accepted_rate), COUNT(*) FROM prompts GROUP BY model"
```

**Per-prompt questions** (categorization, content analysis) require reading each prompt's `messages` JSON - use the subagent iteration pattern below.

## Subagent Iteration Pattern

1. **Add analysis columns** to the schema:
```bash
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN work_type TEXT"
git-ai prompts exec "ALTER TABLE prompts ADD COLUMN analysis_notes TEXT"
```

2. **Reset the iteration pointer** (or reposition `current_seq_id` in the `pointers` table to filter a subset):
```bash
git-ai prompts reset
```

3. **Iterate with subagents** - launch parallel subagents using the Task tool with `subagent_type: "general-purpose"`. Spawn 3-5 at a time, check results, then spawn more. Each subagent runs `git-ai prompts next` to get one prompt as JSON, analyzes the `messages` content, and writes the result back:
```bash
git-ai prompts exec "UPDATE prompts SET work_type='...' WHERE id='...'"
```

4. **Synthesize** the enriched data:
```bash
git-ai prompts exec "SELECT work_type, COUNT(*), AVG(accepted_rate) FROM prompts GROUP BY work_type"
```

### Subagent prompt template

```
Run `git-ai prompts next` to get the next prompt as JSON.

IMPORTANT: All data you need is in this JSON output. Do NOT run git commands.
Analyze the `messages` field directly.

Analyze the messages JSON to determine: [specific analysis task and allowed values]

Then update the database:
git-ai prompts exec "UPDATE prompts SET [column]='[value]' WHERE id='[prompt_id]'"

Return: prompt id, the assigned value, and a short reason or evidence.
```

The JSON from `git-ai prompts next` already includes the full `messages` array and metadata (`model`, `tool`, `accepted_rate`, `accepted_lines`, ...), so subagents must not run `git show` or `git log`. Keep spawning batches until `git-ai prompts next` returns "No more prompts."

## Important Notes

- The `messages` column contains JSON - parse it to read conversation content
- Use subagents for any analysis requiring reading message content
- SQLite is a scratchpad - add columns freely for analysis
- Default scope is conservative (current user, current repo, 30 days)
- Expand scope only when user explicitly mentions team/all repos

## Reference Index

Load only the reference that fits the current question:

- [Schema and query cookbook](references/schema-and-queries.md) - `prompts` table fields and aggregate SQL patterns (acceptance by model, productive prompts, time of day).
- [Examples: prompt quality and patterns](references/examples-prompt-quality.md) - work-type categorization, reusable-pattern detection, clarity scoring, and best-practice grading.
- [Examples: acceptance outcomes](references/examples-acceptance-outcomes.md) - low-acceptance reasons, prompting techniques vs acceptance, qualitative analysis of failed prompts.
- [Caveats, cleanup, and setup](references/caveats-and-setup.md) - NULL/stat footguns, "failed prompts" definition, troubleshooting, `prompts.db` cleanup, and permission setup.
