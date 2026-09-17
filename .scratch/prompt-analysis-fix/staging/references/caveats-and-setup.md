# Caveats, Cleanup, and Setup

Loaded on demand from `SKILL.md` when data looks incomplete, queries return nothing, or the user needs permission or cleanup guidance.

## Cleanup

The `prompts.db` file is ephemeral. Delete it anytime to start fresh:
```bash
rm prompts.db
```

## Troubleshooting

**If there are 0 prompts in the database:**
Git AI may not be set up correctly in this repository. Direct the user to:
- Check https://usegitai.com/docs/cli for setup instructions
- Verify `git-ai` is installed and configured
- Ensure they have made commits with AI assistance after setup

**Important: Git AI only tracks data going forward.**
Git AI cannot retroactively categorize or track prompts from before it was installed. Only commits made after Git AI setup will have prompt data. If the user recently installed Git AI, they may have limited data until they accumulate more AI-assisted commits.

## Footguns and Data Caveats

**Not all prompts have stats or commits:**
- `commit_sha` is NULL when the prompt conversation happened but no code was ever committed
- `accepted_lines`, `overridden_lines`, `accepted_rate` may be NULL or 0 for uncommitted work
- `total_additions`, `total_deletions` may be NULL for the same reason

**Why this happens:**
- User had a conversation but didn't accept the code
- User accepted code but never committed it
- User is still working (code not yet committed)

**Definition of "failed prompts":**
When analyzing failed or unsuccessful prompts, use this definition:
- `accepted_lines IS NULL` - conversation happened but no code was committed
- `accepted_lines = 0` - code was generated but human rejected/rewrote all of it

Query: `WHERE accepted_lines IS NULL OR accepted_lines = 0`

**Handle in queries:**
```sql
-- Exclude uncommitted prompts from acceptance rate analysis
SELECT model, AVG(accepted_rate)
FROM prompts
WHERE commit_sha IS NOT NULL AND accepted_rate IS NOT NULL
GROUP BY model

-- Find prompts with conversation but no committed code
SELECT id, tool, start_time
FROM prompts
WHERE commit_sha IS NULL
```

## Permissions Setup

To avoid being prompted for every `git-ai` command, add to project or user settings:

**Project:** `.claude/settings.json`
**User:** `~/.claude/settings.json`

```json
{
  "permissions": {
    "allow": [
      "Bash(git-ai:*)"
    ]
  }
}
```

This is especially important for subagent iteration, as subagents don't inherit skill-level permissions.
