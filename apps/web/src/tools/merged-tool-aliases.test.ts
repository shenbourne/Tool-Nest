import { describe, expect, it } from 'vitest';
import { allTools } from './registry';

describe('merged tool registry', () => {
  it('does not expose merge-generated search aliases', () => {
    expect(allTools).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ aliases: expect.anything() }),
    ]));
  });
});
