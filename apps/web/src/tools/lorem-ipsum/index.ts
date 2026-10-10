import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.loremIpsum.name', path: '/lorem-ipsum-generator',
  description: 'tools.loremIpsum.description', category: 'text',
  tags: ['generator'], keywords: ['lorem', 'ipsum', 'placeholder', 'text', 'dummy'],
  component: () => import('./LoremIpsum.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
