// Benchmark Builder - business logic

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

export function runBenchmark(suites: BenchmarkSuite[], iterations: number): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

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
      // Skip failed benchmarks
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

  return results.sort((a, b) => a.avgMs - b.avgMs);
}
