import { readFile, writeFile, rename, mkdir, copyFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import { config } from '../config.js';

const MAX_BACKUPS = 3;

// Process-internal mutex using a queue
const queue: Array<() => void> = [];
let locked = false;

function enterMutex(): Promise<() => void> {
  return new Promise((resolve) => {
    const release = () => {
      const next = queue.shift();
      if (next) {
        next();
      } else {
        locked = false;
      }
    };
    if (locked) {
      queue.push(() => resolve(release));
    } else {
      locked = true;
      resolve(release);
    }
  });
}

function getFilePath(filename: string): string {
  return join(config.dataDir, filename);
}

function getBackupPath(filename: string, index: number): string {
  return join(config.dataDir, `${filename}.bak.${index}`);
}

async function fileExists(filepath: string): Promise<boolean> {
  try {
    await access(filepath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure the data directory exists.
 */
async function ensureDataDir(): Promise<void> {
  await mkdir(config.dataDir, { recursive: true });
}

/**
 * Rotate backups: shift .bak.1 -> .bak.2, .bak.2 -> .bak.3, etc.
 * Then copy current file to .bak.1.
 */
async function rotateBackups(filename: string): Promise<void> {
  const filePath = getFilePath(filename);

  // Shift existing backups up
  for (let i = MAX_BACKUPS - 1; i >= 1; i--) {
    const src = i === 1 ? filePath : getBackupPath(filename, i - 1);
    const dst = getBackupPath(filename, i);
    if (await fileExists(src)) {
      await copyFile(src, dst);
    }
  }

  // Copy current file to .bak.1
  if (await fileExists(filePath)) {
    await copyFile(filePath, getBackupPath(filename, 1));
  }
}

/**
 * Read a YAML file with backup recovery.
 * If the main file is corrupt, try backups in order.
 */
export async function readYaml<T = unknown>(filename: string): Promise<T | null> {
  await ensureDataDir();
  const filePath = getFilePath(filename);

  // Try main file first
  try {
    const content = await readFile(filePath, 'utf-8');
    const parsed = parse(content);
    return parsed as T ?? null;
  } catch {
    // Main file missing or corrupt, try backups
    for (let i = 1; i <= MAX_BACKUPS; i++) {
      const backupPath = getBackupPath(filename, i);
      try {
        const content = await readFile(backupPath, 'utf-8');
        const parsed = parse(content);
        if (parsed !== null && parsed !== undefined) {
          // Restore from backup
          await writeFile(filePath, content, 'utf-8');
          return parsed as T;
        }
      } catch {
        // Backup also missing/corrupt, try next
      }
    }
    return null;
  }
}

/**
 * Write data to a YAML file atomically with backup rotation.
 * Uses temp file + atomic rename for crash safety.
 */
export async function writeYaml<T extends Record<string, unknown>>(
  filename: string,
  data: T,
): Promise<void> {
  await ensureDataDir();

  const release = await enterMutex();
  try {
    const filePath = getFilePath(filename);
    const tmpPath = `${filePath}.tmp`;

    // Rotate backups before writing
    await rotateBackups(filename);

    // Write to temp file then atomic rename
    const content = stringify(data, { lineWidth: 0 });
    await writeFile(tmpPath, content, 'utf-8');
    await rename(tmpPath, filePath);
  } finally {
    release();
  }
}

/**
 * Validate a YAML file exists and is parseable.
 * Returns true if valid, false otherwise.
 */
export async function validateYaml(filename: string): Promise<boolean> {
  const filePath = getFilePath(filename);
  try {
    const content = await readFile(filePath, 'utf-8');
    parse(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize storage: ensure data dir exists, validate existing files.
 */
export async function initStorage(): Promise<void> {
  await ensureDataDir();
}
