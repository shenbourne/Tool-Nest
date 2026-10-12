import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.dnsLeakTest.name',
  path: '/dns-leak-test',
  description: 'tools.dnsLeakTest.description',
  category: 'network',
  tags: ['network', 'security', 'check'],
  keywords: ['dns', 'leak', 'privacy', 'test', 'check'],
  component: () => import('./DnsLeakTest.vue'),
  createdAt: '2026-09-18',
  runtimeLocation: 'browser',
});
