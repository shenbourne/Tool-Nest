import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.audioLoop.name',
  path: '/audio-loop',
  description: 'tools.audioLoop.description',
  category: 'audio',
  tags: ['media', 'converter', 'file-upload', 'lazy-load'],
  keywords: ['audio', 'loop', 'repeat', 'cycle'],
  component: () => import('./AudioLoop.vue'),
  createdAt: '2026-09-18',
});
