import { describe, expect, it } from 'vitest';
import { parseDockerRun } from './docker-run-to-compose.service';

describe('parseDockerRun', () => {
  it('keeps the image when a boolean flag precedes it', () => {
    const result = parseDockerRun('docker run --rm nginx');
    expect(result.error).toBeNull();
    expect(result.yaml).toContain('nginx');
  });

  it('handles combined interactive/tty flags before the image', () => {
    const result = parseDockerRun('docker run -it --name app nginx');
    expect(result.error).toBeNull();
    expect(result.yaml).toContain('nginx');
    expect(result.yaml).toContain('app');
  });

  it('still consumes values for flags that take them', () => {
    const result = parseDockerRun('docker run -p 8080:80 -e KEY=value --name web nginx');
    expect(result.error).toBeNull();
    expect(result.yaml).toContain('8080:80');
    expect(result.yaml).toContain('KEY');
    expect(result.yaml).toContain('nginx');
  });

  it('reports a missing image', () => {
    const result = parseDockerRun('docker run --rm');
    expect(result.error).not.toBeNull();
  });

  it('returns empty output for empty input', () => {
    expect(parseDockerRun('   ')).toEqual({ yaml: '', error: null, warnings: [] });
  });
});
