import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.textDiff.name', path: '/text-diff',
  description: 'tools.textDiff.description', category: 'text',
  tags: ['validator'], keywords: ['diff', 'compare', 'text', 'difference', 'change'],
  component: () => import('./TextDiff.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
