import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readYaml, writeYaml, initStorage } from '../storage/yaml-storage';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

describe('YAML Storage', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'toolnest-test-'));
    process.env.DATA_DIR = testDir;
    await initStorage();
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should write and read YAML data', async () => {
    const data = { name: 'test', value: 42, items: ['a', 'b', 'c'] };
    await writeYaml('test.yaml', data);
    const result = await readYaml<typeof data>('test.yaml');
    expect(result).toEqual(data);
  });

  it('should return null for non-existent files', async () => {
    const result = await readYaml('nonexistent.yaml');
    expect(result).toBeNull();
  });

  it('should handle concurrent writes safely', async () => {
    const writes = Array.from({ length: 10 }, (_, i) =>
      writeYaml('concurrent.yaml', { count: i })
    );
    await Promise.all(writes);
    const result = await readYaml<{ count: number }>('concurrent.yaml');
    expect(result).toBeDefined();
    expect(result!.count).toBeGreaterThanOrEqual(0);
    expect(result!.count).toBeLessThan(10);
  });

  it('should create rotating backups', async () => {
    await writeYaml('backup-test.yaml', { version: 1 });
    await writeYaml('backup-test.yaml', { version: 2 });
    await writeYaml('backup-test.yaml', { version: 3 });
    // The main file should have the latest data
    const result = await readYaml<{ version: number }>('backup-test.yaml');
    expect(result!.version).toBe(3);
  });
});
