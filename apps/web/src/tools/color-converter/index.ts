import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.colorConverter.name', path: '/color-converter',
  description: 'tools.colorConverter.description', category: 'converter',
  tags: ['converter'], keywords: ['color', 'hex', 'rgb', 'hsl', 'convert', 'css'],
  component: () => import('./ColorConverter.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
