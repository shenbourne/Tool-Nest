import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imagesToGif.name',
  path: '/images-to-gif',
  description: 'tools.imagesToGif.description',
  category: 'video',
  tags: ['media', 'converter', 'file-upload', 'lazy-load'],
  keywords: ['images', 'gif', 'animation', 'slideshow', 'frames'],
  component: () => import('./ImagesToGif.vue'),
  createdAt: '2026-09-18',
});
