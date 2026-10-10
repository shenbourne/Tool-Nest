import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.numeronymGenerator.name',
  path: '/numeronym-generator',
  description: 'tools.numeronymGenerator.description',
  category: 'text',
  tags: ['text', 'generator'],
  keywords: ['numeronym', 'abbreviation', 'i18n', 'a11y', 'n7m'],
  component: () => import('./NumeronymGenerator.vue'),
  createdAt: '2026-09-18',
});
