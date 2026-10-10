import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.videoCompress.name',
  path: '/video-compress',
  description: 'tools.videoCompress.description',
  category: 'video',
  tags: ['media', 'file-upload', 'lazy-load'],
  keywords: ['video', 'compress', 'reduce', 'size'],
  component: () => import('./VideoCompress.vue'),
  createdAt: '2026-09-18',
});
