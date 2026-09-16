import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.webrtcDetection.name', path: '/webrtc-detection',
  description: 'tools.webrtcDetection.description', category: 'network-test',
  tags: ["browser"], keywords: ["webrtc","ip","leak","detection","privacy"],
  component: () => import('./WebrtcDetection.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
