import { describe, expect, it } from 'vitest';
import { jsonToYaml } from './json-to-yaml.service';

describe('jsonToYaml', () => {
  it('returns quietly for empty input', () => {
    expect(jsonToYaml('')).toEqual({ result: '', error: null });
    expect(jsonToYaml('   ')).toEqual({ result: '', error: null });
  });

  it('converts valid JSON', () => {
    const { result, error } = jsonToYaml('{"a":1}');
    expect(error).toBeNull();
    expect(result).toContain('a: 1');
  });

  it('reports invalid JSON', () => {
    expect(jsonToYaml('{oops').error).not.toBeNull();
  });
});
