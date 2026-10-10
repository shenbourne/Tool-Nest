import { reportRepo } from './store.js';

let timerHandle: ReturnType<typeof setInterval> | null = null;

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export function startCleanupTimer(): void {
  if (timerHandle) return;

  // Run once on startup
  reportRepo.cleanupExpired()
    .then((count) => {
      if (count > 0) console.log(`Cleaned up ${count} expired reports on startup`);
    })
    .catch((err) => {
      console.error('Failed to cleanup expired reports on startup:', err);
    });

  timerHandle = setInterval(() => {
    reportRepo.cleanupExpired()
      .then((count) => {
        if (count > 0) console.log(`Cleaned up ${count} expired reports`);
      })
      .catch((err) => {
        console.error('Failed to cleanup expired reports:', err);
      });
  }, CLEANUP_INTERVAL_MS);
}

export function stopCleanupTimer(): void {
  if (timerHandle) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}
