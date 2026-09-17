# Schema and Query Cookbook

Loaded on demand from `SKILL.md` for aggregate, metrics, and comparison questions.

## `prompts` Table Schema

The `prompts` table contains:
- `seq_id` - Auto-increment ID for iteration
- `id` - Unique prompt identifier
- `tool` - Tool used (e.g., "claude-code", "cursor")
- `model` - Model name (e.g., "claude-sonnet-4-20250514")
- `human_author` - Git user who created the prompt
- `commit_sha` - Associated commit (if any)
- `total_additions`, `total_deletions` - Lines of code changed
- `accepted_lines`, `overridden_lines` - Lines kept vs modified by human
- `accepted_rate` - Ratio: accepted / (accepted + overridden)
- `messages` - JSON array of the conversation
- `start_time`, `last_time` - Unix timestamps

## Example Queries

**Acceptance rate by model:**
```sql
SELECT model,
       ROUND(AVG(accepted_rate), 3) as avg_rate,
       SUM(accepted_lines) as total_accepted,
       COUNT(*) as prompt_count
FROM prompts
GROUP BY model
ORDER BY avg_rate DESC
```

**Most productive prompts (high acceptance + high LoC):**
```sql
SELECT id, tool, model, accepted_lines, accepted_rate,
       (last_time - start_time) as duration_secs
FROM prompts
WHERE accepted_rate > 0.8 AND accepted_lines > 50
ORDER BY accepted_lines DESC
LIMIT 10
```

**Prompts by time of day:**
```sql
SELECT
  CASE
    WHEN (start_time % 86400) / 3600 < 12 THEN 'morning'
    WHEN (start_time % 86400) / 3600 < 17 THEN 'afternoon'
    ELSE 'evening'
  END as time_of_day,
  COUNT(*) as count,
  AVG(accepted_rate) as avg_rate
FROM prompts
GROUP BY time_of_day
```
