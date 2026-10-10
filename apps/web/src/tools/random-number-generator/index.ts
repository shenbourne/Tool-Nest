import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.randomNumberGenerator.name', path: '/random-number-generator',
  description: 'tools.randomNumberGenerator.description', category: 'generator',
  tags: ["generator","number"], keywords: ["random","number","generator","dice"],
  component: () => import('./RandomNumberGenerator.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
