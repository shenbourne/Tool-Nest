import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.gifChangeSpeed.name',
  path: '/gif-change-speed',
  description: 'tools.gifChangeSpeed.description',
  category: 'video',
  tags: ['media', 'converter', 'file-upload', 'lazy-load'],
  keywords: ['gif', 'speed', 'slow', 'fast', 'animation'],
  component: () => import('./GifChangeSpeed.vue'),
  createdAt: '2026-09-18',
});
