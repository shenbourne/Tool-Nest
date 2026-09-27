// Benchmark Builder - business logic

import { i18n } from '@/i18n';

export interface BenchmarkSuite {
  id: string;
  name: string;
  code: string;
}

export interface BenchmarkResult {
  suiteName: string;
  iterations: number;
  totalTimeMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  opsPerSec: number;
}

export interface BenchmarkFailure {
  suiteName: string;
  message: string;
}

export function summarizeSuite(suiteName: string, times: number[], iterations: number): BenchmarkResult {
  const totalTime = times.reduce((a, b) => a + b, 0);
  const avg = totalTime / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const opsPerSec = avg > 0 ? 1000 / avg : 0;
  return { suiteName, iterations, totalTimeMs: totalTime, avgMs: avg, minMs: min, maxMs: max, opsPerSec };
}

// User code runs in a Web Worker so an infinite loop freezes the worker (which
// a timeout then terminates) instead of the whole page. Each suite reports
// incrementally so results before a hanging suite are preserved.
const WORKER_SOURCE = `
self.onmessage = (e) => {
  const { suites, iterations } = e.data;
  for (const suite of suites) {
    if (!suite.code || !suite.code.trim()) continue;
    self.postMessage({ type: 'start', suiteName: suite.name });
    try {
      const fn = new Function(suite.code);
      fn();
      const times = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fn();
        times.push(performance.now() - start);
      }
      self.postMessage({ type: 'result', suiteName: suite.name, times });
    } catch (err) {
      self.postMessage({ type: 'failure', suiteName: suite.name, message: String((err && err.message) || err) });
    }
  }
  self.postMessage({ type: 'done' });
};
`;

const SUITE_TIMEOUT_MS = 10_000;

export function runBenchmark(
  suites: BenchmarkSuite[],
  iterations: number,
): Promise<{ results: BenchmarkResult[]; failures: BenchmarkFailure[] }> {
  return new Promise((resolve) => {
    const results: BenchmarkResult[] = [];
    const failures: BenchmarkFailure[] = [];
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'application/javascript' }));
    const worker = new Worker(url);
    let currentSuite: string | null = null;
    let finished = false;
    let suiteTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(suiteTimer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ results: results.sort((a, b) => a.avgMs - b.avgMs), failures });
    };

    const armSuiteTimer = () => {
      clearTimeout(suiteTimer);
      suiteTimer = setTimeout(() => {
        if (currentSuite) {
          failures.push({ suiteName: currentSuite, message: i18n.global.t('tools.benchmarkBuilder.suiteTimedOut') });
        }
        finish();
      }, SUITE_TIMEOUT_MS);
    };

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === 'start') {
        currentSuite = msg.suiteName;
        armSuiteTimer();
      } else if (msg.type === 'result') {
        results.push(summarizeSuite(msg.suiteName, msg.times, iterations));
      } else if (msg.type === 'failure') {
        failures.push({ suiteName: msg.suiteName, message: msg.message });
      } else if (msg.type === 'done') {
        finish();
      }
    };
    worker.onerror = () => finish();

    armSuiteTimer();
    worker.postMessage({ suites, iterations });
  });
}
