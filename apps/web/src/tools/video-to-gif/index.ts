import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.videoToGif.name',
  path: '/video-to-gif',
  description: 'tools.videoToGif.description',
  category: 'video',
  tags: ['media', 'converter', 'file-upload', 'lazy-load'],
  keywords: ['video', 'gif', 'convert', 'animation'],
  component: () => import('./VideoToGif.vue'),
  createdAt: '2026-09-18',
});
