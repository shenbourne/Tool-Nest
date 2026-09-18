import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.videoCrop.name',
  path: '/video-crop',
  description: 'tools.videoCrop.description',
  category: 'video',
  tags: ['media', 'file-upload', 'lazy-load'],
  keywords: ['video', 'crop', 'trim', 'frame'],
  component: () => import('./VideoCrop.vue'),
  createdAt: '2026-09-18',
});
