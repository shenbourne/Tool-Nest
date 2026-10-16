import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.jsonTools.name',
  path: '/json-prettify',
  description: 'tools.jsonTools.description',
  category: 'data',
  redirectFrom: ['/json-stringify', '/json-viewer','/json-escape','/json-minify','/json-sort','/json-validate'],
  tags: ['converter', 'parser', 'json'],
  keywords: ['json', 'format', 'prettify', 'beautify', 'validate','escape','unescape','minify','sort'],
  component: () => import('./JsonPrettify.vue'),
  createdAt: '2026-09-17',
});
