import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.csvToYaml.name', path: '/csv-to-yaml',
  description: 'tools.csvToYaml.description', category: 'data',
  tags: ["csv","yaml","converter"], keywords: ["csv","yaml","convert"],
  component: () => import('./CsvToYaml.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
