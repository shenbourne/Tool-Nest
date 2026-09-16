import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.tsvToJson.name', path: '/tsv-to-json',
  description: 'tools.tsvToJson.description', category: 'data',
  tags: ["tsv","json","converter"], keywords: ["tsv","json","tab","convert"],
  component: () => import('./TsvToJson.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
