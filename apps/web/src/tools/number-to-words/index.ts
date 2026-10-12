import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.numberToWords.name', path: '/number-to-words',
  description: 'tools.numberToWords.description', category: 'math',
  tags: ['converter', 'number'], keywords: ["number","words","convert","english"],
  component: () => import('./NumberToWords.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
