import type { ToolDefinition } from '@toolnest/shared';

// Single source of truth for tool module scanning
const toolModules = import.meta.glob('@/tools/*/index.ts', { eager: true });

type ToolModule = { tool: ToolDefinition };
const registeredTools: ToolDefinition[] = Object.values(toolModules)
  .map((mod) => (mod as ToolModule).tool)
  .filter(Boolean);

// Consolidated tools own the previous URLs; omit the old cards and routes.
const mergedPaths = new Set(registeredTools.flatMap(tool => tool.redirectFrom ?? []));
export const allTools = registeredTools.filter(tool => !mergedPaths.has(tool.path));
