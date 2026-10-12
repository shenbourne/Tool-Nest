import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.tomlToYaml.name',
  path: '/toml-to-yaml',
  description: 'tools.tomlToYaml.description',
  category: 'data',
  tags: ['converter', 'toml'],
  keywords: ['toml', 'yaml', 'convert'],
  component: () => import('./TomlToYaml.vue'),
  createdAt: '2026-09-18',
});
