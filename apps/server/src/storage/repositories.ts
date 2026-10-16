import { AppError } from '../middleware/error-handler.js';
import { randomBytes } from 'node:crypto';
import { readYaml, writeYaml } from './yaml-storage.js';
import type { UserPreferences, ShareReport } from '@toolnest/shared';

const USER_PREFS_FILE = 'user-preferences.yaml';
const REPORTS_FILE = 'reports.yaml';

const DEFAULT_USER_PREFS: UserPreferences = {
  version: 1,
  language: 'zh',
  theme: 'system',
  favorites: [],
  recentTools: [],
  settings: {},
};

const MAX_FAVORITES = 50;
const MAX_RECENT_TOOLS = 30;
const MAX_REPORTS = 100;
const MAX_REPORT_CONTENT_SIZE = 500_000; // chars
const REPORT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
let updateQueue = Promise.resolve();

function serializeUpdate<T>(operation: () => Promise<T>): Promise<T> {
  const result = updateQueue.then(operation, operation);
  updateQueue = result.then(() => undefined, () => undefined);
  return result;
}

// --- Repository Interfaces ---

export interface UserPrefsRepository {
  get(): Promise<UserPreferences>;
  save(prefs: Partial<UserPreferences>): Promise<UserPreferences>;
}

export interface ReportRepository {
  create(content: string, title?: string): Promise<ShareReport>;
  get(id: string): Promise<ShareReport | null>;
  cleanupExpired(): Promise<number>;
}

// --- User Preferences Repository (YAML-backed) ---

export class YamlUserPrefsRepository implements UserPrefsRepository {
  async get(): Promise<UserPreferences> {
    const data = await readYaml<Record<string, unknown>>(USER_PREFS_FILE);
    if (!data) {
      return { ...DEFAULT_USER_PREFS };
    }
    return migrateUserPreferences(data);
  }

  async save(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    validatePreferencesInput(prefs);
    return serializeUpdate(async () => {
      const current = await this.get();

    const merged: UserPreferences = {
      version: prefs.version ?? current.version,
      language: prefs.language ?? current.language,
      theme: prefs.theme ?? current.theme,
      favorites: (prefs.favorites ?? current.favorites).slice(0, MAX_FAVORITES),
      recentTools: (prefs.recentTools ?? current.recentTools).slice(0, MAX_RECENT_TOOLS),
      settings: { ...current.settings, ...(prefs.settings ?? {}) },
    };

      let bytes: number;
      try { bytes = Buffer.byteLength(JSON.stringify(merged), 'utf8'); }
      catch { throw new AppError(400, 'VALIDATION_ERROR', 'Preferences must contain JSON values'); }
      if (bytes > 64 * 1024) throw new AppError(413, 'PREFERENCES_TOO_LARGE', 'Merged preferences exceed 64 KiB; reduce settings or restore a smaller preferences file');
      await writeYaml(USER_PREFS_FILE, toRecord(merged));
      return merged;
    });
  }
}

function validatePreferencesInput(prefs: Partial<UserPreferences>): void {
  const fail = () => { throw new AppError(400, 'VALIDATION_ERROR', 'Invalid preferences field'); };
  const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
  if (!record(prefs)) fail();
  if (prefs.version !== undefined && (!Number.isSafeInteger(prefs.version) || prefs.version < 1)) fail();
  if (prefs.language !== undefined && (typeof prefs.language !== 'string' || prefs.language.length > 32)) fail();
  if (prefs.theme !== undefined && !['light', 'dark', 'system'].includes(prefs.theme)) fail();
  if (prefs.settings !== undefined && !record(prefs.settings)) fail();
  if (prefs.favorites !== undefined && (!Array.isArray(prefs.favorites) || !prefs.favorites.every(path => typeof path === 'string' && path.length <= 2048))) fail();
  if (prefs.recentTools !== undefined && (!Array.isArray(prefs.recentTools) || !prefs.recentTools.every(item => record(item) && typeof item.path === 'string' && item.path.length <= 2048 && typeof item.timestamp === 'number' && Number.isFinite(item.timestamp)))) fail();
}

function migrateUserPreferences(data: Record<string, unknown>): UserPreferences {
  const version = typeof data.version === 'number' ? data.version : 1;

  // Version 1: current schema
  return {
    version,
    language: typeof data.language === 'string' ? data.language : 'zh',
    theme: (['light', 'dark', 'system'].includes(data.theme as string)
      ? data.theme
      : 'system') as 'light' | 'dark' | 'system',
    favorites: Array.isArray(data.favorites) ? data.favorites.filter((f): f is string => typeof f === 'string') : [],
    recentTools: Array.isArray(data.recentTools)
      ? data.recentTools
          .filter((r): r is { path: string; timestamp: number } =>
            typeof r === 'object' && r !== null && typeof (r as Record<string, unknown>).path === 'string' && typeof (r as Record<string, unknown>).timestamp === 'number'
          )
          .slice(0, MAX_RECENT_TOOLS)
      : [],
    settings: typeof data.settings === 'object' && data.settings !== null ? (data.settings as Record<string, unknown>) : {},
  };
}

// --- Reports Repository (YAML-backed) ---

interface ReportsStore {
  version: number;
  reports: ShareReport[];
}

export class YamlReportRepository implements ReportRepository {
  async create(content: string, title?: string): Promise<ShareReport> {
    if (content.length > MAX_REPORT_CONTENT_SIZE) {
      throw new Error(`Report content exceeds maximum size of ${MAX_REPORT_CONTENT_SIZE} characters`);
    }

    return serializeUpdate(async () => {
    const store = await this.readStore();

    if (store.reports.length >= MAX_REPORTS) {
      throw new Error(`Maximum number of reports (${MAX_REPORTS}) reached`);
    }

    const now = Date.now();
    const report: ShareReport = {
      id: randomBytes(16).toString('hex'),
      content,
      createdAt: now,
      expiresAt: now + REPORT_EXPIRY_MS,
      title,
    };

    store.reports.push(report);
    await this.writeStore(store);
    return report;
    });
  }

  async get(id: string): Promise<ShareReport | null> {
    const store = await this.readStore();
    const report = store.reports.find((r) => r.id === id);
    if (!report) return null;
    if (report.expiresAt < Date.now()) return null; // expired
    return report;
  }

  async cleanupExpired(): Promise<number> {
    return serializeUpdate(async () => {
    const store = await this.readStore();
    const now = Date.now();
    const before = store.reports.length;
    store.reports = store.reports.filter((r) => r.expiresAt >= now);
    const removed = before - store.reports.length;
    if (removed > 0) {
      await this.writeStore(store);
    }
    return removed;
    });
  }

  private async readStore(): Promise<ReportsStore> {
    const data = await readYaml<Record<string, unknown>>(REPORTS_FILE);
    if (!data) {
      return { version: 1, reports: [] };
    }
    const reports = Array.isArray(data.reports)
      ? data.reports
          .filter((r): r is ShareReport =>
            typeof r === 'object' && r !== null && typeof (r as Record<string, unknown>).id === 'string'
          )
      : [];
    return {
      version: typeof data.version === 'number' ? data.version : 1,
      reports,
    };
  }

  private async writeStore(store: ReportsStore): Promise<void> {
    await writeYaml(REPORTS_FILE, toRecord(store));
  }
}

// --- Helpers ---

/**
 * Convert a typed object to a plain Record for YAML serialization
 * without requiring `as unknown as Record` at every call site.
 */
function toRecord<T extends object>(value: T): Record<string, unknown> {
  return { ...value } as Record<string, unknown>;
}
