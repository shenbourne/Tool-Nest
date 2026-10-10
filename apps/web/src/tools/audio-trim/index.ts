import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.audioTrim.name',
  path: '/audio-trim',
  description: 'tools.audioTrim.description',
  category: 'audio',
  tags: ['media', 'converter', 'file-upload', 'lazy-load'],
  keywords: ['audio', 'trim', 'cut', 'clip', 'slice'],
  component: () => import('./AudioTrim.vue'),
  createdAt: '2026-09-18',
});
