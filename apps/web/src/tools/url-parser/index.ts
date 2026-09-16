import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.urlParser.name', path: '/url-parser',
  description: 'tools.urlParser.description', category: 'web',
  tags: ['parser'], keywords: ['url', 'parse', 'protocol', 'host', 'pathname', 'query'],
  component: () => import('./UrlParser.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
