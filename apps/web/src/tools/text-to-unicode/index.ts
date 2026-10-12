import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.textToUnicode.name',
  path: '/text-to-unicode',
  description: 'tools.textToUnicode.description',
  category: 'encoding',
  tags: ['converter', 'text', 'encoder'],
  keywords: ['text', 'unicode', 'convert', 'encode', 'decode'],
  component: () => import('./TextToUnicode.vue'),
  createdAt: '2026-09-18',
});
