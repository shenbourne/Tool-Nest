import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.htmlEntities.name', path: '/html-entities',
  description: 'tools.htmlEntities.description', category: 'web',
  tags: ['encoder', 'converter'], keywords: ['html', 'entities', 'escape', 'unescape', 'encode'],
  component: () => import('./HtmlEntities.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
