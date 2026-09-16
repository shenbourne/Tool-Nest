import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ToolDefinition, ToolCategory } from '@toolnest/shared';

// Tool registry - will be populated as tools are migrated
const toolModules = import.meta.glob('@/tools/*/index.ts', { eager: true });

const allTools = Object.values(toolModules)
  .map((mod: any) => mod.tool as ToolDefinition)
  .filter(Boolean);

export const useToolStore = defineStore('tools', () => {
  const tools = ref<ToolDefinition[]>(allTools);
  const favoritePaths = ref<string[]>(JSON.parse(localStorage.getItem('toolnest-favorites') || '[]'));
  const recentTools = ref<{ path: string; timestamp: number }[]>(
    JSON.parse(localStorage.getItem('toolnest-recent') || '[]')
  );

  const toolsByCategory = computed(() => {
    const grouped = new Map<ToolCategory, ToolDefinition[]>();
    for (const tool of tools.value) {
      const list = grouped.get(tool.category) || [];
      list.push(tool);
      grouped.set(tool.category, list);
    }
    return grouped;
  });

  const favoriteTools = computed(() =>
    tools.value.filter(t => favoritePaths.value.includes(t.path))
  );

  const recentToolsList = computed(() =>
    recentTools.value
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(r => tools.value.find(t => t.path === r.path))
      .filter(Boolean) as ToolDefinition[]
  );

  function toggleFavorite(path: string) {
    const idx = favoritePaths.value.indexOf(path);
    if (idx >= 0) {
      favoritePaths.value.splice(idx, 1);
    } else {
      favoritePaths.value.push(path);
    }
    localStorage.setItem('toolnest-favorites', JSON.stringify(favoritePaths.value));
  }

  function addRecentTool(path: string) {
    recentTools.value = recentTools.value.filter(r => r.path !== path);
    recentTools.value.unshift({ path, timestamp: Date.now() });
    recentTools.value = recentTools.value.slice(0, 50);
    localStorage.setItem('toolnest-recent', JSON.stringify(recentTools.value));
  }

  function getToolByPath(path: string): ToolDefinition | undefined {
    return tools.value.find(t => t.path === path);
  }

  function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
    return tools.value.filter(t => t.category === category);
  }

  function searchTools(query: string): ToolDefinition[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tools.value.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.path.toLowerCase().includes(q) ||
      t.keywords.some(k => k.toLowerCase().includes(q)) ||
      (t.aliases ?? []).some(a => a.toLowerCase().includes(q))
    );
  }

  return {
    tools,
    toolsByCategory,
    favoritePaths,
    favoriteTools,
    recentTools,
    recentToolsList,
    toggleFavorite,
    addRecentTool,
    getToolByPath,
    getToolsByCategory,
    searchTools,
  };
});
