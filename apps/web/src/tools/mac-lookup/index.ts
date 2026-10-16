import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.macLookup.name', path: '/mac-lookup',
  description: 'tools.macLookup.description', category: 'network',
  tags: ["browser","network"], keywords: ["mac","address","vendor","oui","lookup"],
  component: () => import('./MacLookup.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
