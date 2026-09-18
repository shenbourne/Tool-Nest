import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.yamlToToml.name',
  path: '/yaml-to-toml',
  description: 'tools.yamlToToml.description',
  category: 'converter',
  tags: ['converter', 'yaml'],
  keywords: ['yaml', 'toml', 'convert'],
  component: () => import('./YamlToToml.vue'),
  createdAt: '2026-09-18',
});
