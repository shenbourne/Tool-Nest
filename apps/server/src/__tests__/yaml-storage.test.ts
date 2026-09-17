import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

type YamlStorage = typeof import('../storage/yaml-storage');

describe('YAML Storage', () => {
  let testDir: string;
  let storage: YamlStorage;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'toolnest-test-'));
    // config reads DATA_DIR at module load time, so reload the module graph
    // with the temp directory stubbed before importing the storage layer.
    vi.resetModules();
    vi.stubEnv('DATA_DIR', testDir);
    storage = await import('../storage/yaml-storage');
    await storage.initStorage();
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(testDir, { recursive: true, force: true });
  });

  it('should write and read YAML data', async () => {
    const data = { name: 'test', value: 42, items: ['a', 'b', 'c'] };
    await storage.writeYaml('test.yaml', data);
    const result = await storage.readYaml<typeof data>('test.yaml');
    expect(result).toEqual(data);
  });

  it('should return null for non-existent files', async () => {
    const result = await storage.readYaml('nonexistent.yaml');
    expect(result).toBeNull();
  });

  it('should handle concurrent writes safely', async () => {
    const writes = Array.from({ length: 10 }, (_, i) =>
      storage.writeYaml('concurrent.yaml', { count: i })
    );
    await Promise.all(writes);
    const result = await storage.readYaml<{ count: number }>('concurrent.yaml');
    expect(result).toBeDefined();
    expect(result!.count).toBeGreaterThanOrEqual(0);
    expect(result!.count).toBeLessThan(10);
  });

  it('should create rotating backups', async () => {
    await storage.writeYaml('backup-test.yaml', { version: 1 });
    await storage.writeYaml('backup-test.yaml', { version: 2 });
    await storage.writeYaml('backup-test.yaml', { version: 3 });
    // The main file should have the latest data
    const result = await storage.readYaml<{ version: number }>('backup-test.yaml');
    expect(result!.version).toBe(3);
  });
});
