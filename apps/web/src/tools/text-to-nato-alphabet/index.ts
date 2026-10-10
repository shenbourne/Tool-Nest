import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.textToNatoAlphabet.name',
  path: '/text-to-nato-alphabet',
  description: 'tools.textToNatoAlphabet.description',
  category: 'converter',
  tags: ['converter', 'text'],
  keywords: ['NATO', 'phonetic', 'alphabet', 'alpha', 'bravo'],
  component: () => import('./TextToNatoAlphabet.vue'),
  createdAt: '2026-09-18',
});
