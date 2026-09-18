import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.censorshipCheck.name',
  path: '/censorship-check',
  description: 'tools.censorshipCheck.description',
  category: 'network-test',
  tags: ['network', 'security', 'check'],
  keywords: ['censorship', 'ooni', 'check', 'blocked', 'freedom'],
  component: () => import('./CensorshipCheck.vue'),
  createdAt: '2026-09-18',
  runtimeLocation: 'browser',
});
