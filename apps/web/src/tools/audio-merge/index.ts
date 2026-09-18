import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.audioMerge.name',
  path: '/audio-merge',
  description: 'tools.audioMerge.description',
  category: 'audio',
  tags: ['media', 'converter', 'file-upload', 'lazy-load'],
  keywords: ['audio', 'merge', 'concat', 'join', 'combine'],
  component: () => import('./AudioMerge.vue'),
  createdAt: '2026-09-18',
});
