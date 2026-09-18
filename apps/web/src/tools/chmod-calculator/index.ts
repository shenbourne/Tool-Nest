import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.chmodCalculator.name',
  path: '/chmod-calculator',
  description: 'tools.chmodCalculator.description',
  category: 'developer',
  tags: ['calculator', 'developer'],
  keywords: ['chmod', 'permissions', 'file', 'unix', 'linux', 'octal', 'rwx'],
  component: () => import('./ChmodCalculator.vue'),
  createdAt: '2026-09-18',
});
