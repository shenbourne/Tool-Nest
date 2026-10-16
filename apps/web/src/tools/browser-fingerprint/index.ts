import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.browserFingerprint.name', path: '/browser-fingerprint',
  description: 'tools.browserFingerprint.description', category: 'web',
  tags: ["browser"], keywords: ["browser","fingerprint","device","info","privacy"],
  component: () => import('./BrowserFingerprint.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
