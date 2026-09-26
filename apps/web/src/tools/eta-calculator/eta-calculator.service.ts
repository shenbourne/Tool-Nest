import { i18n } from '@/i18n';
// ETA Calculator - business logic

export interface EtaInput {
  totalTasks: number;
  completedTasks: number;
  startTime: number; // epoch ms
}

export interface EtaResult {
  progressPercent: number;
  rate: number; // tasks per ms
  remainingTasks: number;
  remainingMs: number;
  estimatedEndTime: Date;
  elapsedMs: number;
}

export function calculateEta(input: EtaInput): EtaResult | null {
  const { totalTasks, completedTasks, startTime } = input;

  if (totalTasks <= 0 || completedTasks < 0 || completedTasks > totalTasks) {
    return null;
  }

  const now = Date.now();
  const elapsedMs = now - startTime;

  if (elapsedMs <= 0 || completedTasks === 0) {
    return {
      progressPercent: 0,
      rate: 0,
      remainingTasks: totalTasks,
      remainingMs: Infinity,
      estimatedEndTime: new Date(0),
      elapsedMs,
    };
  }

  const rate = completedTasks / elapsedMs; // tasks per ms
  const remainingTasks = totalTasks - completedTasks;
  const remainingMs = remainingTasks / rate;
  const progressPercent = (completedTasks / totalTasks) * 100;
  const estimatedEndTime = new Date(now + remainingMs);

  return {
    progressPercent,
    rate,
    remainingTasks,
    remainingMs,
    estimatedEndTime,
    elapsedMs,
  };
}

export function formatDuration(ms: number): string {
  if (!isFinite(ms) || ms < 0) return i18n.global.t('common.notAvailable');
  if (ms < 1000) return `${Math.round(ms)} ms`;

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(i18n.global.t('tools.etaCalculator.durationDays', { n: days }));
  if (hours > 0) parts.push(i18n.global.t('tools.etaCalculator.durationHours', { n: hours }));
  if (minutes > 0) parts.push(i18n.global.t('tools.etaCalculator.durationMinutes', { n: minutes }));
  if (seconds > 0 || parts.length === 0) parts.push(i18n.global.t('tools.etaCalculator.durationSeconds', { n: seconds }));

  return parts.join(' ');
}

export function formatEndTime(date: Date): string {
  if (date.getTime() === 0) return i18n.global.t('common.notAvailable');
  return date.toLocaleString(i18n.global.locale.value === 'zh' ? 'zh-CN' : 'en-US');
}
