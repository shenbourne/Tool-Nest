import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.yamlViewer.name',
  path: '/yaml-viewer',
  description: 'tools.yamlViewer.description',
  category: 'data',
  tags: ['yaml', 'developer'],
  keywords: ['yaml', 'prettify', 'format', 'viewer', 'validate'],
  component: () => import('./YamlViewer.vue'),
  createdAt: '2026-09-18',
});
