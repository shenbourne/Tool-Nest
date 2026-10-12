import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.connectivityCheck.name', path: '/connectivity-check',
  description: 'tools.connectivityCheck.description', category: 'network',
  tags: ["browser"], keywords: ["connectivity","internet","online","check","network"],
  component: () => import('./ConnectivityCheck.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
