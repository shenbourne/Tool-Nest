# Agent Development Protocol

This file is the entry point for coding agents working in this repository. Follow the user's current instructions over repository guidance. Apply the lightest workflow that still records scope and evidence; when a required step does not apply, record why.

## Agent skills

### Issue tracker

Issues and specs are stored as local Markdown under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default canonical triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

Use the single-context domain documentation layout. See `docs/agents/domain.md`.

## Responsibilities

- Project layer (`.workflow/`): project objectives, requirements, roadmap, phase acceptance, and resumable state.
- Engineering layer (`.agent-workflows/`): focused procedures for planning, implementation, debugging, review, and verification.
- Domain layer (`CONTEXT.md` and `docs/adr/`): project vocabulary and architectural decisions. This remains the single source of truth for ADRs.
- Harness layer (`.harness/`): evidence-backed proposals for improving the agent workflow. Run it after repeated failures, not for every task.

## Session start

Read `.workflow/STATE.md`, the project and requirements summaries, and the active phase's `CONTEXT.md` and `ACCEPTANCE.md` when a phase is active. Then inspect the Git branch, status, and recent commits, preserving unrelated edits. Load `.agent-workflows/session-start.md` and only the other workflow modules relevant to the task.

## Routing

- New project direction or changed scope: update `.workflow/PROJECT.md`, `REQUIREMENTS.md`, and `ROADMAP.md` as needed.
- Ambiguous behavior or acceptance: `.agent-workflows/clarify.md`.
- Consequential technical decision: `.agent-workflows/architecture.md` and a numbered ADR under `docs/adr/`.
- Non-trivial implementation: `.agent-workflows/planning.md`, then `.agent-workflows/tdd.md` where practical.
- Bug diagnosis or repair: `.agent-workflows/debugging.md`.
- Cross-module changes, shared abstractions, dependency-direction changes, or recurring structural problems: `.agent-workflows/codebase-health.md` after the ordinary review. Record the trigger; it is not a gate for every task.
- Completion: `.agent-workflows/review.md`, `.agent-workflows/verification.md`, and `.agent-workflows/session-end.md`.

## Completion gate

Keep the active phase plan current. Review the diff against its scope, run applicable checks through `scripts/verify` or equivalent commands, record actual results in `VERIFICATION.md`, and verify each acceptance criterion with observable evidence in `ACCEPTANCE.md`. Update `.workflow/STATE.md` so another agent can resume without chat history. A phase is complete only after engineering and acceptance checks pass.

## AI Git 工作流规范

基本原则：
- 每次开发工作都应当使用 Git 管理项目。
- 不要提交密钥、密码、环境变量等敏感信息；未经允许不要 push、强制推送、删除分支或改写 Git 历史。
- 所有开发工作必须在独立的功能分中支完成；每次原子任务完成且测试通过后提交一次。
- 整体目标完成后，在确保功能正常且所有改动已提交后，将完成情况完整呈现给用户，并将功能分支合并回主分支。

提交格式：
- 整体格式：约定式提交（Conventional Commits）格式`type(scope): description`
- type：改动类型
  - `feat`（新功能）
  - `fix`（Bug 修复）
  - `refactor`（重构）
  - `test`（添加或修改测试）
  - `docs`（文档更改）
  - `chore`（构建工具、依赖等）
- Scope：功能模块名（可选），如 `users`、`billing`、`notifications`
- description：改动描述，使用动词原型（add, fix, update），不加句号
- 不要使用 WIP、temp、fix stuff 等模糊描述

示例：
- `feat(billing): add proration calculation for plan changes`
- `fix(auth): handle expired JWT tokens gracefully`
- `test(notifications): add unit tests for DigestService`

