import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.videoLoop.name',
  path: '/video-loop',
  description: 'tools.videoLoop.description',
  category: 'video',
  tags: ['media', 'file-upload', 'lazy-load'],
  keywords: ['video', 'loop', 'repeat', 'cycle'],
  component: () => import('./VideoLoop.vue'),
  createdAt: '2026-09-18',
});
