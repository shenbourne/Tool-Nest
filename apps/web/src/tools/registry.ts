import type { ToolDefinition } from '@toolnest/shared';

// Single source of truth for tool module scanning
const toolModules = import.meta.glob('@/tools/*/index.ts', { eager: true });

type ToolModule = { tool: ToolDefinition };
export const allTools: ToolDefinition[] = Object.values(toolModules)
  .map((mod) => (mod as ToolModule).tool)
  .filter(Boolean);
