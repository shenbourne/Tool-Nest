import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.videoMerge.name',
  path: '/video-merge',
  description: 'tools.videoMerge.description',
  category: 'video',
  tags: ['media', 'file-upload', 'lazy-load'],
  keywords: ['video', 'merge', 'concat', 'join', 'combine'],
  component: () => import('./VideoMerge.vue'),
  createdAt: '2026-09-18',
});
