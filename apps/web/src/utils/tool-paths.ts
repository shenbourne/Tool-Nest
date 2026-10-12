import type { ToolDefinition, UserPreferences } from '@toolnest/shared';

type ToolPaths = Pick<ToolDefinition, 'path' | 'redirectFrom'>;

export function canonicalToolPath(path: string, tools: readonly ToolPaths[]): string {
  return tools.find(tool => tool.path === path || tool.redirectFrom?.includes(path))?.path ?? path;
}

export function normalizeToolPreferences(
  preferences: Pick<UserPreferences, 'favorites' | 'recentTools'>,
  tools: readonly ToolPaths[],
): Pick<UserPreferences, 'favorites' | 'recentTools'> {
  const favorites = [...new Set(preferences.favorites.map(path => canonicalToolPath(path, tools)))];
  const latest = new Map<string, number>();
  for (const recent of preferences.recentTools) {
    const path = canonicalToolPath(recent.path, tools);
    latest.set(path, Math.max(latest.get(path) ?? -Infinity, recent.timestamp));
  }
  const recentTools = [...latest].map(([path, timestamp]) => ({ path, timestamp }))
    .sort((a, b) => b.timestamp - a.timestamp);
  return { favorites, recentTools };
}
