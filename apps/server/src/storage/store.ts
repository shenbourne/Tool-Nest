import { randomBytes } from 'node:crypto';
import { readYaml, writeYaml } from './yaml-storage.js';
import { config } from '../config.js';
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

// --- User Preferences ---

export async function getUserPreferences(): Promise<UserPreferences> {
  const data = await readYaml<Record<string, unknown>>(USER_PREFS_FILE);
  if (!data) {
    return { ...DEFAULT_USER_PREFS };
  }
  return migrateUserPreferences(data as Record<string, unknown>);
}

export async function saveUserPreferences(
  prefs: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const current = await getUserPreferences();

  const merged: UserPreferences = {
    version: prefs.version ?? current.version,
    language: prefs.language ?? current.language,
    theme: prefs.theme ?? current.theme,
    favorites: (prefs.favorites ?? current.favorites).slice(0, MAX_FAVORITES),
    recentTools: (prefs.recentTools ?? current.recentTools).slice(0, MAX_RECENT_TOOLS),
    settings: { ...current.settings, ...(prefs.settings ?? {}) },
  };

  await writeYaml(USER_PREFS_FILE, merged as unknown as Record<string, unknown>);
  return merged;
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
            typeof r === 'object' && r !== null && typeof (r as any).path === 'string' && typeof (r as any).timestamp === 'number'
          )
          .slice(0, MAX_RECENT_TOOLS)
      : [],
    settings: typeof data.settings === 'object' && data.settings !== null ? (data.settings as Record<string, unknown>) : {},
  };
}

// --- Reports ---

interface ReportsStore {
  version: number;
  reports: ShareReport[];
}

async function readReportsStore(): Promise<ReportsStore> {
  const data = await readYaml<Record<string, unknown>>(REPORTS_FILE);
  if (!data) {
    return { version: 1, reports: [] };
  }
  const reports = Array.isArray(data.reports)
    ? data.reports
        .filter((r): r is ShareReport =>
          typeof r === 'object' && r !== null && typeof (r as any).id === 'string'
        )
    : [];
  return {
    version: typeof data.version === 'number' ? data.version : 1,
    reports,
  };
}

async function writeReportsStore(store: ReportsStore): Promise<void> {
  await writeYaml(REPORTS_FILE, store as unknown as Record<string, unknown>);
}

export async function createReport(
  content: string,
  title?: string,
): Promise<ShareReport> {
  if (content.length > MAX_REPORT_CONTENT_SIZE) {
    throw new Error(`Report content exceeds maximum size of ${MAX_REPORT_CONTENT_SIZE} characters`);
  }

  const store = await readReportsStore();

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
  await writeReportsStore(store);
  return report;
}

export async function getReport(id: string): Promise<ShareReport | null> {
  const store = await readReportsStore();
  const report = store.reports.find((r) => r.id === id);
  if (!report) return null;
  if (report.expiresAt < Date.now()) return null; // expired
  return report;
}

export async function cleanupExpiredReports(): Promise<number> {
  const store = await readReportsStore();
  const now = Date.now();
  const before = store.reports.length;
  store.reports = store.reports.filter((r) => r.expiresAt >= now);
  const removed = before - store.reports.length;
  if (removed > 0) {
    await writeReportsStore(store);
  }
  return removed;
}
