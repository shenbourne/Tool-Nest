import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.videoTrim.name',
  path: '/video-trim',
  description: 'tools.videoTrim.description',
  category: 'video',
  tags: ['media', 'file-upload', 'lazy-load'],
  keywords: ['video', 'trim', 'cut', 'clip'],
  component: () => import('./VideoTrim.vue'),
  createdAt: '2026-09-18',
});
