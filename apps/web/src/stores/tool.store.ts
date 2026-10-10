import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ToolDefinition, ToolCategory } from '@toolnest/shared';
import { usePreferencesStore } from './preferences.store';
import { allTools } from '@/tools/registry';

export const useToolStore = defineStore('tools', () => {
  const tools = ref<ToolDefinition[]>(allTools);
  const preferencesStore = usePreferencesStore();

  const toolsByCategory = computed(() => {
    const grouped = new Map<ToolCategory, ToolDefinition[]>();
    for (const tool of tools.value) {
      const list = grouped.get(tool.category) || [];
      list.push(tool);
      grouped.set(tool.category, list);
    }
    return grouped;
  });

  const favoritePaths = computed(() => preferencesStore.prefs.favorites);

  const favoriteTools = computed(() =>
    tools.value.filter(t => preferencesStore.prefs.favorites.includes(t.path))
  );

  const recentToolsList = computed(() =>
    preferencesStore.prefs.recentTools
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(r => tools.value.find(t => t.path === r.path))
      .filter(Boolean) as ToolDefinition[]
  );

  function toggleFavorite(path: string) {
    preferencesStore.toggleFavorite(path);
  }

  function addRecentTool(path: string) {
    preferencesStore.recordToolUsage(path);
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
    recentToolsList,
    toggleFavorite,
    addRecentTool,
    getToolByPath,
    getToolsByCategory,
    searchTools,
  };
});
