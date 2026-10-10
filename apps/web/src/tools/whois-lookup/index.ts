import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.whoisLookup.name', path: '/whois-lookup',
  description: 'tools.whoisLookup.description', category: 'network-test',
  tags: ["browser","network"], keywords: ["whois","domain","registration","lookup"],
  component: () => import('./WhoisLookup.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
