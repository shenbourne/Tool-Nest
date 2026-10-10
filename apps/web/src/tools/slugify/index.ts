import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.slugify.name', path: '/slugify',
  description: 'tools.slugify.description', category: 'web',
  tags: ['converter'], keywords: ['slug', 'url', 'seo', 'sanitize', 'string'],
  component: () => import('./Slugify.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
