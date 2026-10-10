/**
 * Clipboard file collection and accept matching for the shared file-import
 * control.
 *
 * A pasted file has to be judged by the same `accept` rules naive-ui applies to
 * a dropped one, or dropping and pasting the same file could disagree. That
 * filter (`matchType` in `naive-ui/es/upload/src/utils.mjs`) is not part of
 * naive-ui's public API, so its semantics are mirrored here — and covered by
 * tests — instead of deep-importing the internal module.
 *
 * Kept free of DOM access so the rules stay unit-testable in a node environment.
 */

export interface ClipboardFileLike {
  name: string;
  type: string;
}

export interface ClipboardItemLike {
  kind: string;
  type: string;
  getAsFile(): File | null;
}

/** Structural subset of `DataTransfer`, so tests need no real clipboard. */
export interface ClipboardDataLike {
  files?: ArrayLike<File> | null;
  items?: ArrayLike<ClipboardItemLike> | null;
}

export function matchesAccept(file: ClipboardFileLike, accept: string): boolean {
  if (!accept.trim()) return true;

  const name = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  return accept
    .toLowerCase()
    .split(',')
    .map((atom) => atom.trim())
    .filter(Boolean)
    .some((atom) => {
      if (atom.startsWith('.')) return name.endsWith(atom);
      if (atom.includes('/')) {
        const [type, subtype] = mimeType.split('/');
        const [acceptType, acceptSubtype] = atom.split('/');
        if (acceptType !== '*' && acceptType !== type) return false;
        return acceptSubtype === '*' || acceptSubtype === subtype;
      }
      return true;
    });
}

/**
 * Both channels are read because browsers differ: copying a file in the OS file
 * manager fills `files`, while a pasted screenshot can arrive only as a file
 * item. A file reachable through both is reported once.
 */
export function collectClipboardFiles(data: ClipboardDataLike | null | undefined): File[] {
  if (!data) return [];

  const files: File[] = [];
  const push = (candidate: File | null | undefined) => {
    if (candidate && !files.includes(candidate)) files.push(candidate);
  };

  for (const file of Array.from(data.files ?? [])) push(file);
  for (const entry of Array.from(data.items ?? [])) {
    if (entry.kind !== 'file') continue;
    push(entry.getAsFile());
  }

  return files;
}

export function splitByAccept(
  files: File[],
  accept: string,
): { accepted: File[]; rejected: File[] } {
  const accepted: File[] = [];
  const rejected: File[] = [];

  for (const file of files) {
    if (matchesAccept(file, accept)) accepted.push(file);
    else rejected.push(file);
  }

  return { accepted, rejected };
}
