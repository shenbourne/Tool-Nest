import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.createPalindrome.name', path: '/create-palindrome',
  description: 'tools.createPalindrome.description', category: 'text',
  tags: ["text"], keywords: ["palindrome","mirror","reverse"],
  component: () => import('./CreatePalindrome.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
