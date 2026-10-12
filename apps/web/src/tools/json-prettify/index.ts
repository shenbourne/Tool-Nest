import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.jsonPrettify.name',
  path: '/json-prettify',
  description: 'tools.jsonPrettify.description',
  category: 'data',
  redirectFrom: ['/json-stringify', '/json-viewer'],
  aliases: ['JSON 序列化', 'JSON 查看器', 'JSON Stringify', 'JSON Viewer'],
  tags: ['converter', 'parser', 'json'],
  keywords: ['json', 'format', 'prettify', 'beautify', 'validate'],
  component: () => import('./JsonPrettify.vue'),
  createdAt: '2026-09-17',
});
