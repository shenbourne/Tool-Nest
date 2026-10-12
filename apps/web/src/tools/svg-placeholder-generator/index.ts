import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.svgPlaceholderGenerator.name',
  path: '/svg-placeholder-generator',
  description: 'tools.svgPlaceholderGenerator.description',
  category: 'image',
  tags: ['generator', 'media'],
  keywords: ['svg', 'placeholder', 'image', 'generator', 'dummy'],
  component: () => import('./SvgPlaceholderGenerator.vue'),
  createdAt: '2026-09-18',
});
