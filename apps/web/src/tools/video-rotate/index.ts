import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.videoRotate.name',
  path: '/video-rotate',
  description: 'tools.videoRotate.description',
  category: 'video',
  tags: ['media', 'file-upload', 'lazy-load'],
  keywords: ['video', 'rotate', 'flip', 'orientation'],
  component: () => import('./VideoRotate.vue'),
  createdAt: '2026-09-18',
});
