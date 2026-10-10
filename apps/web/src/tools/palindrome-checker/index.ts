import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.palindromeChecker.name', path: '/palindrome-checker',
  description: 'tools.palindromeChecker.description', category: 'text',
  tags: ["text","check"], keywords: ["palindrome","check","verify"],
  component: () => import('./PalindromeChecker.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
