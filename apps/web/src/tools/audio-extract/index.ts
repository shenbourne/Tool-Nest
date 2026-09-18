import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.audioExtract.name',
  path: '/audio-extract',
  description: 'tools.audioExtract.description',
  category: 'audio',
  tags: ['media', 'converter', 'file-upload', 'lazy-load'],
  keywords: ['audio', 'extract', 'video', 'separate', 'audio track'],
  component: () => import('./AudioExtract.vue'),
  createdAt: '2026-09-18',
});
