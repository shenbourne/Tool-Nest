import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { allTools } from '@/tools/registry';
import type { ToolDefinition } from '@toolnest/shared';

/**
 * Resolves the current tool definition from the active route.
 * Uses route.meta.toolPath to look up from the tool registry.
 * Eliminates the need for each tool component to hardcode its path.
 */
export function useCurrentTool() {
  const route = useRoute();

  const tool = computed<ToolDefinition | undefined>(() => {
    const toolPath = route.meta.toolPath as string | undefined;
    if (!toolPath) return undefined;
    return allTools.find(t => t.path === toolPath);
  });

  return tool;
}
