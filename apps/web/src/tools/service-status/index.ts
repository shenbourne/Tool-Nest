import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.serviceStatus.name', path: '/service-status',
  description: 'tools.serviceStatus.description', category: 'network',
  tags: ["browser","network"], keywords: ["service","status","uptime","check","ping"],
  component: () => import('./ServiceStatus.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
