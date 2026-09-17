import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stringify } from 'yaml';

type Repositories = typeof import('../storage/repositories');

let testDir: string;
let repo: Repositories;

async function writeRawYaml(filename: string, data: unknown): Promise<void> {
  await writeFile(join(testDir, filename), stringify(data), 'utf-8');
}

describe('YamlUserPrefsRepository', () => {
  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'toolnest-repos-'));
    vi.resetModules();
    vi.stubEnv('DATA_DIR', testDir);
    repo = await import('../storage/repositories');
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(testDir, { recursive: true, force: true });
  });

  it('returns defaults when no preferences file exists', async () => {
    const prefs = new repo.YamlUserPrefsRepository();
    const result = await prefs.get();
    expect(result.version).toBe(1);
    expect(result.language).toBe('zh');
    expect(result.theme).toBe('system');
    expect(result.favorites).toEqual([]);
  });

  it('merges partial updates and persists them across instances', async () => {
    const prefs = new repo.YamlUserPrefsRepository();
    await prefs.save({ language: 'en' });
    const result = await prefs.save({ theme: 'dark' });
    expect(result.language).toBe('en');
    expect(result.theme).toBe('dark');

    const reloaded = new repo.YamlUserPrefsRepository();
    const fromDisk = await reloaded.get();
    expect(fromDisk.language).toBe('en');
    expect(fromDisk.theme).toBe('dark');
  });

  it('merges settings objects instead of replacing them', async () => {
    const prefs = new repo.YamlUserPrefsRepository();
    await prefs.save({ settings: { compactMode: true } });
    const result = await prefs.save({ settings: { localeVariant: 'simplified' } });
    expect(result.settings).toEqual({ compactMode: true, localeVariant: 'simplified' });
  });

  it('sanitizes malformed stored data during migration', async () => {
    await writeRawYaml('user-preferences.yaml', {
      version: 1,
      language: 'en',
      theme: 'neon',
      favorites: ['hash-text', 42],
      recentTools: [{ path: '/x', timestamp: 'bad' }, { path: '/y', timestamp: 1 }],
      settings: 'nope',
    });

    const prefs = new repo.YamlUserPrefsRepository();
    const result = await prefs.get();
    expect(result.theme).toBe('system');
    expect(result.favorites).toEqual(['hash-text']);
    expect(result.recentTools).toEqual([{ path: '/y', timestamp: 1 }]);
    expect(result.settings).toEqual({});
  });

  it('caps the favorites list at 50 entries', async () => {
    const prefs = new repo.YamlUserPrefsRepository();
    const many = Array.from({ length: 60 }, (_, i) => `tool-${i}`);
    const result = await prefs.save({ favorites: many });
    expect(result.favorites).toHaveLength(50);
    expect(result.favorites[0]).toBe('tool-0');
  });
});

describe('YamlReportRepository', () => {
  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'toolnest-repos-'));
    vi.resetModules();
    vi.stubEnv('DATA_DIR', testDir);
    repo = await import('../storage/repositories');
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(testDir, { recursive: true, force: true });
  });

  it('creates a report and reads it back', async () => {
    const reports = new repo.YamlReportRepository();
    const created = await reports.create('hello world', 'Greeting');
    expect(created.id).toMatch(/^[a-f0-9]{32}$/);
    expect(created.expiresAt).toBeGreaterThan(Date.now());

    const fetched = await reports.get(created.id);
    expect(fetched?.content).toBe('hello world');
    expect(fetched?.title).toBe('Greeting');
  });

  it('returns null for missing and expired reports', async () => {
    const now = Date.now();
    await writeRawYaml('reports.yaml', {
      version: 1,
      reports: [
        { id: 'f'.repeat(32), content: 'expired', createdAt: now - 2000, expiresAt: now - 1 },
      ],
    });

    const reports = new repo.YamlReportRepository();
    expect(await reports.get('f'.repeat(32))).toBeNull();
    expect(await reports.get('0'.repeat(32))).toBeNull();
  });

  it('removes only expired reports during cleanup', async () => {
    const now = Date.now();
    await writeRawYaml('reports.yaml', {
      version: 1,
      reports: [
        { id: 'a'.repeat(32), content: 'old', createdAt: now - 2000, expiresAt: now - 1000 },
        { id: 'b'.repeat(32), content: 'fresh', createdAt: now, expiresAt: now + 60_000 },
      ],
    });

    const reports = new repo.YamlReportRepository();
    const removed = await reports.cleanupExpired();
    expect(removed).toBe(1);
    expect(await reports.get('a'.repeat(32))).toBeNull();
    expect(await reports.get('b'.repeat(32))).not.toBeNull();
  });

  it('rejects oversized content before touching storage', async () => {
    const reports = new repo.YamlReportRepository();
    await expect(reports.create('x'.repeat(500_001))).rejects.toThrow(/exceeds maximum/);
  });
});
