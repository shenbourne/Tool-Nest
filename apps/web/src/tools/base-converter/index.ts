import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.baseConverter.name', path: '/base-converter',
  description: 'tools.baseConverter.description', category: 'converter',
  tags: ['converter'], keywords: ['base', 'binary', 'hex', 'octal', 'decimal', 'convert'],
  component: () => import('./BaseConverter.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
