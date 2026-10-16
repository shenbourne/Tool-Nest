import type { ToolDefinition } from '@toolnest/shared';
import { TOOL_TAB_NAVIGATION } from './tool-tab-navigation';

export function isLargeHomeTool(tool: ToolDefinition): boolean {
  return Object.hasOwn(TOOL_TAB_NAVIGATION, tool.path);
}

export function largeHomeToolsFirst(tools: ToolDefinition[]): ToolDefinition[] {
  return [...tools.filter(isLargeHomeTool), ...tools.filter(tool => !isLargeHomeTool(tool))];
}
