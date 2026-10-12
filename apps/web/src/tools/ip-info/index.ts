import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.ipInfo.name', path: '/ip-info',
  description: 'tools.ipInfo.description', category: 'network',
  tags: ["browser","network"], keywords: ["ip","info","geolocation","location","address"],
  component: () => import('./IpInfo.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
