import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.metaTagGenerator.name',
  path: '/meta-tag-generator',
  description: 'tools.metaTagGenerator.description',
  category: 'web',
  tags: ['generator', 'developer'],
  keywords: ['meta', 'tag', 'seo', 'open', 'graph', 'og', 'twitter', 'card', 'social', 'share'],
  component: () => import('./MetaTagGenerator.vue'),
  createdAt: '2026-09-18',
});
