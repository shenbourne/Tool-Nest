import { describe, expect, it } from 'vitest';
import { runBenchmark, type BenchmarkSuite } from './benchmark-builder.service';

function suite(id: string, name: string, code: string): BenchmarkSuite {
  return { id, name, code };
}

describe('runBenchmark', () => {
  it('benchmarks a valid suite', () => {
    const { results, failures } = runBenchmark([suite('1', 'fast', '1 + 1;')], 5);
    expect(failures).toEqual([]);
    expect(results).toHaveLength(1);
    expect(results[0].suiteName).toBe('fast');
    expect(results[0].iterations).toBe(5);
  });

  it('reports a throwing suite as a failure instead of skipping it', () => {
    const { results, failures } = runBenchmark(
      [suite('1', 'broken', 'throw new Error("boom")'), suite('2', 'fine', '2 + 2;')],
      3,
    );
    expect(results.map(r => r.suiteName)).toEqual(['fine']);
    expect(failures).toEqual([{ suiteName: 'broken', message: 'boom' }]);
  });

  it('skips suites with empty code without failing', () => {
    const { results, failures } = runBenchmark([suite('1', 'empty', '   ')], 3);
    expect(results).toEqual([]);
    expect(failures).toEqual([]);
  });
});
