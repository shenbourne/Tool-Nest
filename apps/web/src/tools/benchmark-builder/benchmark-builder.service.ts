// Benchmark Builder - business logic

export interface BenchmarkSuite {
  id: string;
  name: string;
  code: string;
}

export interface BenchmarkFailure {
  suiteName: string;
  message: string;
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

export function runBenchmark(
  suites: BenchmarkSuite[],
  iterations: number,
): { results: BenchmarkResult[]; failures: BenchmarkFailure[] } {
  const results: BenchmarkResult[] = [];
  const failures: BenchmarkFailure[] = [];

  for (const suite of suites) {
    if (!suite.code.trim()) continue;

    const times: number[] = [];

    try {
      // Warmup run
      const fn = new Function(suite.code);
      fn();

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fn();
        const end = performance.now();
        times.push(end - start);
      }
    } catch (e) {
      // Surface the failing suite instead of silently dropping it, so users
      // can tell a code bug apart from a genuinely slow benchmark.
      failures.push({ suiteName: suite.name, message: e instanceof Error ? e.message : String(e) });
      continue;
    }

    const totalTime = times.reduce((a, b) => a + b, 0);
    const avg = totalTime / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const opsPerSec = avg > 0 ? 1000 / avg : 0;

    results.push({
      suiteName: suite.name,
      iterations,
      totalTimeMs: totalTime,
      avgMs: avg,
      minMs: min,
      maxMs: max,
      opsPerSec,
    });
  }

  return { results: results.sort((a, b) => a.avgMs - b.avgMs), failures };
}
