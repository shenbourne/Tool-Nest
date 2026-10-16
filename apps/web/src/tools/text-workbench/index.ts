import { defineTool } from '@toolnest/shared';
import { legacyTextTabs } from './text-operations';
export const tool = defineTool({
  name: 'tools.textWorkbench.name', path: '/text-tools', description: 'tools.textWorkbench.description', category: 'text',
  redirectFrom: Object.keys(legacyTextTabs),
  tags: ['text', 'statistics'], keywords: ['text', 'replace', 'regex', 'reverse', 'rotate', 'truncate', 'diff', 'statistics', 'deduplicate', 'unique'],
  component: () => import('./TextWorkbench.vue'), createdAt: '2026-10-13', runtimeLocation: 'browser',
});
