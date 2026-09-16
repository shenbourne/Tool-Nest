import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Fuse from 'fuse.js';
import { useToolStore } from './tool.store';
import type { ToolDefinition, ToolCategory } from '@toolnest/shared';

export const useSearchStore = defineStore('search', () => {
  const query = ref('');
  const selectedTags = ref<string[]>([]);
  const selectedCategory = ref<string | null>(null);

  const toolStore = useToolStore();

  const fuse = computed(() => {
    return new Fuse(toolStore.tools, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.2 },
        { name: 'keywords', weight: 0.25 },
        { name: 'tags', weight: 0.1 },
        { name: 'category', weight: 0.05 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
  });

  const results = computed<ToolDefinition[]>(() => {
    let filtered = toolStore.tools;

    if (selectedCategory.value) {
      filtered = filtered.filter(t => t.category === selectedCategory.value);
    }

    if (selectedTags.value.length > 0) {
      filtered = filtered.filter(t =>
        selectedTags.value.every(tag => t.tags.includes(tag as any))
      );
    }

    if (query.value.trim()) {
      const fuseResults = fuse.value.search(query.value);
      const matchedPaths = new Set(fuseResults.map(r => r.item.path));
      filtered = filtered.filter(t => matchedPaths.has(t.path));
    }

    return filtered;
  });

  const allTags = computed(() => {
    const tagSet = new Set<string>();
    toolStore.tools.forEach(t => t.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  });

  function setQuery(q: string) { query.value = q; }
  function toggleTag(tag: string) {
    const idx = selectedTags.value.indexOf(tag);
    if (idx >= 0) selectedTags.value.splice(idx, 1);
    else selectedTags.value.push(tag);
  }
  function setCategory(cat: string | null) { selectedCategory.value = cat; }
  function clearFilters() {
    query.value = '';
    selectedTags.value = [];
    selectedCategory.value = null;
  }

  return {
    query, selectedTags, selectedCategory, results, allTags,
    setQuery, toggleTag, setCategory, clearFilters,
  };
});
