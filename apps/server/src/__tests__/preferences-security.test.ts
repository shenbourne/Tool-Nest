import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stringify } from 'yaml';
let directory: string;
let repo: import('../storage/repositories').YamlUserPrefsRepository;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'preferences-budget-'));
  vi.resetModules(); vi.stubEnv('DATA_DIR', directory);
  const { YamlUserPrefsRepository } = await import('../storage/repositories');
  repo = new YamlUserPrefsRepository();
});
afterEach(async () => { vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true }); });
describe('merged preferences budget', () => {
  it('rejects cumulative growth without changing the saved file', async () => {
    await repo.save({ settings: { first: 'x'.repeat(35000) } });
    const before = await readFile(join(directory, 'user-preferences.yaml'), 'utf8');
    await expect(repo.save({ settings: { second: 'x'.repeat(35000) } })).rejects.toThrow();
    expect(await readFile(join(directory, 'user-preferences.yaml'), 'utf8')).toBe(before);
    expect((await repo.get()).settings).toEqual({ first: 'x'.repeat(35000) });
  });
  it('measures UTF-8 bytes and preserves normal partial merges', async () => {
    await repo.save({ settings: { sidebarMode: 'navigate' }, language: 'en' });
    await expect(repo.save({ settings: { large: '中'.repeat(23000) } })).rejects.toThrow();
    const prefs = await repo.save({ settings: { compactMode: true }, theme: 'dark' });
    expect(prefs.settings).toEqual({ sidebarMode: 'navigate', compactMode: true });
    expect(prefs.language).toBe('en'); expect(prefs.theme).toBe('dark');
  });
  it.each([{ settings: [] }, { settings: 'x' }, { recentTools: [null] }, { language: [] }, { favorites: [42] }])('rejects malformed %j at the repository boundary', async value => {
    await expect(repo.save(value as never)).rejects.toThrow();
  });
  it('reports legacy oversized state explicitly without truncating it', async () => {
    await writeFile(join(directory, 'user-preferences.yaml'), stringify({ version: 1, settings: { old: 'x'.repeat(70000) } }));
    const before = await readFile(join(directory, 'user-preferences.yaml'), 'utf8');
    await expect(repo.save({ theme: 'dark' })).rejects.toThrow();
    expect(await readFile(join(directory, 'user-preferences.yaml'), 'utf8')).toBe(before);
  });
});
