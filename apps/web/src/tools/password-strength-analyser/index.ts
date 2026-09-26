import { defineTool } from '@toolnest/shared';
import { i18n } from '@/i18n';

export interface StrengthResult {
  score: number;       // 0-4
  label: string;
  color: string;
  crackTime: string;
  suggestions: string[];
}

export function analyzePassword(password: string): StrengthResult {
  if (!password) return { score: 0, label: i18n.global.t('tools.passwordStrength.labelNone'), color: 'var(--color-text-3)', crackTime: i18n.global.t('tools.passwordStrength.crackInstant'), suggestions: [] };

  let score = 0;
  const suggestions: string[] = [];

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (password.length < 8) suggestions.push(i18n.global.t('tools.passwordStrength.suggestLength'));

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const variety = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (variety >= 3) score++;
  if (variety < 3) suggestions.push(i18n.global.t('tools.passwordStrength.suggestVariety'));

  // Penalties
  if (/^[a-zA-Z]+$/.test(password)) suggestions.push(i18n.global.t('tools.passwordStrength.suggestAddNumbersSymbols'));
  if (/^[0-9]+$/.test(password)) { score = Math.max(0, score - 2); suggestions.push(i18n.global.t('tools.passwordStrength.suggestAvoidOnlyNumbers')); }
  if (/(.)\1{2,}/.test(password)) suggestions.push(i18n.global.t('tools.passwordStrength.suggestAvoidRepeats'));
  if (/^(1234|password|qwerty|abc)/i.test(password)) { score = Math.max(0, score - 2); suggestions.push(i18n.global.t('tools.passwordStrength.suggestAvoidCommon')); }

  // Estimate crack time (simplified)
  const poolSize = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasNumber ? 10 : 0) + (hasSpecial ? 33 : 0);
  const entropy = password.length * Math.log2(poolSize || 1);
  const guessesPerSecond = 1e10; // 10 billion guesses/sec
  const seconds = Math.pow(2, entropy) / guessesPerSecond;

  let crackTime: string;
  if (seconds < 1) crackTime = i18n.global.t('tools.passwordStrength.crackInstant');
  else if (seconds < 60) crackTime = i18n.global.t('tools.passwordStrength.crackSeconds', { n: Math.round(seconds) });
  else if (seconds < 3600) crackTime = i18n.global.t('tools.passwordStrength.crackMinutes', { n: Math.round(seconds / 60) });
  else if (seconds < 86400) crackTime = i18n.global.t('tools.passwordStrength.crackHours', { n: Math.round(seconds / 3600) });
  else if (seconds < 31536000) crackTime = i18n.global.t('tools.passwordStrength.crackDays', { n: Math.round(seconds / 86400) });
  else if (seconds < 31536000 * 1000) crackTime = i18n.global.t('tools.passwordStrength.crackYears', { n: Math.round(seconds / 31536000) });
  else crackTime = i18n.global.t('tools.passwordStrength.crackCenturies');

  score = Math.max(0, Math.min(4, score));

  const labels = [
    i18n.global.t('tools.passwordStrength.labelVeryWeak'),
    i18n.global.t('tools.passwordStrength.labelWeak'),
    i18n.global.t('tools.passwordStrength.labelFair'),
    i18n.global.t('tools.passwordStrength.labelStrong'),
    i18n.global.t('tools.passwordStrength.labelVeryStrong'),
  ];
  const colors = ['var(--color-error)', 'var(--color-error)', 'var(--color-warning)', 'var(--color-success)', 'var(--color-success)'];

  return { score, label: labels[score], color: colors[score], crackTime, suggestions };
}

export const tool = defineTool({
  name: 'tools.passwordStrength.name',
  path: '/password-strength-analyser',
  description: 'tools.passwordStrength.description',
  category: 'crypto',
  tags: ['security', 'validator'],
  keywords: ['password', 'strength', 'security', 'crack', 'entropy'],
  component: () => import('./PasswordStrength.vue'),
  createdAt: '2026-09-17',
  runtimeLocation: 'browser',
});
