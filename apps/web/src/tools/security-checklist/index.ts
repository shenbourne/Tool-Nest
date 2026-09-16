import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.securityChecklist.name', path: '/security-checklist',
  description: 'tools.securityChecklist.description', category: 'network-test',
  tags: ["browser","security"], keywords: ["security","checklist","headers","privacy","browser"],
  component: () => import('./SecurityChecklist.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
