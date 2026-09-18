import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.videoFlip.name',
  path: '/video-flip',
  description: 'tools.videoFlip.description',
  category: 'video',
  tags: ['media', 'file-upload', 'lazy-load'],
  keywords: ['video', 'flip', 'mirror', 'horizontal', 'vertical'],
  component: () => import('./VideoFlip.vue'),
  createdAt: '2026-09-18',
});
