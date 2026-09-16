import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.jsonPrettify.name',
  path: '/json-prettify',
  description: 'tools.jsonPrettify.description',
  category: 'converter',
  tags: ['converter', 'parser'],
  keywords: ['json', 'format', 'prettify', 'beautify', 'validate'],
  component: () => import('./JsonPrettify.vue'),
  createdAt: '2026-09-17',
});
