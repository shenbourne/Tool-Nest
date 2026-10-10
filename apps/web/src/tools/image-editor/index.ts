import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageEditor.name', path: '/image-editor',
  description: 'tools.imageEditor.description', category: 'image',
  tags: ['media', 'file-upload', 'lazy-load'], keywords: ['image', 'editor', 'draw', 'annotate', 'text'],
  component: () => import('./ImageEditor.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
