import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageSplit.name', path: '/image-split',
  description: 'tools.imageSplit.description', category: 'image',
  tags: ['media', 'file-upload'], keywords: ['image', 'split', 'grid', 'crop', 'tile'],
  component: () => import('./ImageSplit.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
