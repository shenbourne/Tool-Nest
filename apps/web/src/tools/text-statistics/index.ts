import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.textStats.name', path: '/text-statistics',
  description: 'tools.textStats.description', category: 'text',
  tags: ['validator'], keywords: ['text', 'word', 'character', 'count', 'line', 'sentence', 'statistics'],
  component: () => import('./TextStatistics.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
