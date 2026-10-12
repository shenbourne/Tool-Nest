import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.jsonDiff.name', path: '/json-diff',
  description: 'tools.jsonDiff.description', category: 'data',
  tags: ['developer', 'json', 'text', 'check'], keywords: ['json', 'diff', 'compare', 'difference', 'merge'],
  component: () => import('./JsonDiff.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
