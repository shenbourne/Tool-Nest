import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ToolDefinition, ToolCategory } from '@toolnest/shared';
import { usePreferencesStore } from './preferences.store';
import { allTools } from '@/tools/registry';
import { canonicalToolPath, normalizeToolPreferences } from '@/utils/tool-paths';

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

  const normalizedPreferences = computed(() => normalizeToolPreferences(preferencesStore.prefs, tools.value));
  const favoritePaths = computed(() => normalizedPreferences.value.favorites);

  const favoriteTools = computed(() =>
    tools.value.filter(t => favoritePaths.value.includes(t.path))
  );

  const recentToolsList = computed(() =>
    normalizedPreferences.value.recentTools
      .filter(r => tools.value.some(t => t.path === r.path))
      .slice(0, 10)
      .map(r => tools.value.find(t => t.path === r.path))
      .filter(Boolean) as ToolDefinition[]
  );

  function toggleFavorite(path: string) {
    const canonical = canonicalToolPath(path, tools.value);
    const normalized = normalizedPreferences.value;
    const favorites = normalized.favorites.includes(canonical)
      ? normalized.favorites.filter(favorite => favorite !== canonical)
      : [...normalized.favorites.slice(-49), canonical];
    return preferencesStore.save({ ...normalized, favorites });
  }

  function addRecentTool(path: string) {
    const canonical = canonicalToolPath(path, tools.value);
    const normalized = normalizedPreferences.value;
    const recentTools = [{ path: canonical, timestamp: Date.now() }, ...normalized.recentTools.filter(r => r.path !== canonical)].slice(0, 30);
    return preferencesStore.save({ ...normalized, recentTools });
  }

  function getToolByPath(path: string): ToolDefinition | undefined {
    return tools.value.find(t => t.path === canonicalToolPath(path, tools.value));
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
      t.keywords.some(k => k.toLowerCase().includes(q))
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
