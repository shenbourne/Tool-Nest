import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.videoResize.name',
  path: '/video-resize',
  description: 'tools.videoResize.description',
  category: 'video',
  tags: ['media', 'file-upload', 'lazy-load'],
  keywords: ['video', 'resize', 'scale', 'dimension'],
  component: () => import('./VideoResize.vue'),
  createdAt: '2026-09-18',
});
