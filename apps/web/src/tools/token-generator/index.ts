import { defineTool } from '@toolnest/shared';

function shuffleString(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export function createToken({
  withUppercase = true,
  withLowercase = true,
  withNumbers = true,
  withSymbols = false,
  length = 64,
  alphabet,
}: {
  withUppercase?: boolean;
  withLowercase?: boolean;
  withNumbers?: boolean;
  withSymbols?: boolean;
  length?: number;
  alphabet?: string;
}): string {
  const allAlphabet = alphabet ?? [
    withUppercase ? 'ABCDEFGHIJKLMOPQRSTUVWXYZ' : '',
    withLowercase ? 'abcdefghijklmopqrstuvwxyz' : '',
    withNumbers ? '0123456789' : '',
    withSymbols ? '.,;:!?./-"\'#{([-|\\@)]=}*+' : '',
  ].join('');

  if (!allAlphabet) return '';
  return shuffleString(allAlphabet.repeat(length)).substring(0, length);
}

export const tool = defineTool({
  name: 'tools.tokenGenerator.name',
  path: '/token-generator',
  description: 'tools.tokenGenerator.description',
  category: 'crypto',
  tags: ['generator', 'security'],
  keywords: ['token', 'random', 'string', 'password', 'alphanumeric', 'symbols'],
  component: () => import('./TokenGenerator.vue'),
  createdAt: '2026-09-17',
  runtimeLocation: 'browser',
});
