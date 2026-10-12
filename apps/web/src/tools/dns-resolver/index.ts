import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.dnsResolver.name', path: '/dns-resolver',
  description: 'tools.dnsResolver.description', category: 'network',
  tags: ["browser","network"], keywords: ["dns","resolve","lookup","domain","record"],
  component: () => import('./DnsResolver.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
