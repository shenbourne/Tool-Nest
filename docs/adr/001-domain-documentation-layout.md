# ADR-001: 采用单上下文领域文档布局

## 状态

已接受（2026-09-24）

## 背景

项目需要一个统一的领域术语和架构决策记录体系，供 AI Agent 和开发者共同消费。

## 决策

采用单上下文布局：

- 根目录 `CONTEXT.md` 作为唯一领域术语源
- `docs/adr/` 存放架构决策记录
- `agents.md` 引用 `docs/agents/domain.md` 描述该布局

## 后果

- 术语以 `CONTEXT.md` 为准，新提案须显式声明与现有 ADR 的冲突
- Agent 可通过 `agents.md` → `docs/agents/domain.md` → `CONTEXT.md` / `docs/adr/` 链路发现领域知识
- 文件不存在时静默跳过，不阻断 Agent 工作流
