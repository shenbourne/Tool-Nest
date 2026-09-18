import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.textToBinary.name',
  path: '/text-to-binary',
  description: 'tools.textToBinary.description',
  category: 'converter',
  tags: ['converter', 'text'],
  keywords: ['text', 'binary', 'ASCII', 'convert'],
  component: () => import('./TextToBinary.vue'),
  createdAt: '2026-09-18',
});
