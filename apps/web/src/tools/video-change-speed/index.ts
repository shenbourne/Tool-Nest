import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.videoChangeSpeed.name',
  path: '/video-change-speed',
  description: 'tools.videoChangeSpeed.description',
  category: 'video',
  tags: ['media', 'file-upload', 'lazy-load'],
  keywords: ['video', 'speed', 'slow', 'fast', 'playback'],
  component: () => import('./VideoChangeSpeed.vue'),
  createdAt: '2026-09-18',
});
