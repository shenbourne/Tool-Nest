import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.jsonToYaml.name',
  path: '/json-to-yaml',
  description: 'tools.jsonToYaml.description',
  category: 'converter',
  tags: ['converter', 'yaml'],
  keywords: ['json', 'yaml', 'convert', 'parse'],
  component: () => import('./JsonToYaml.vue'),
  createdAt: '2026-09-18',
});
