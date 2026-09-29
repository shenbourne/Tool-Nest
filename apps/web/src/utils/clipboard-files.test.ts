import { describe, expect, it } from 'vitest';
import { collectClipboardFiles, matchesAccept, splitByAccept } from './clipboard-files';

function file(name: string, type = ''): File {
  return new File(['x'], name, { type });
}

function item(kind: string, type: string, value: File | null) {
  return { kind, type, getAsFile: () => value };
}

describe('matchesAccept', () => {
  // Mirrors naive-ui's drag-and-drop filter (`matchType` in
  // naive-ui/es/upload/src/utils.mjs) so a pasted file and a dropped file can
  // never be judged differently.
  it('accepts everything when the control declares no accept', () => {
    expect(matchesAccept(file('anything.bin'), '')).toBe(true);
    expect(matchesAccept(file('anything.bin'), '   ')).toBe(true);
  });

  it('matches an extension atom, case-insensitively', () => {
    expect(matchesAccept(file('report.pdf'), '.pdf')).toBe(true);
    expect(matchesAccept(file('REPORT.PDF'), '.pdf')).toBe(true);
  });

  it('rejects a file whose extension does not match', () => {
    expect(matchesAccept(file('photo.png', 'image/png'), '.pdf')).toBe(false);
  });

  it('matches a wildcard mime atom against the file type', () => {
    expect(matchesAccept(file('screenshot.png', 'image/png'), 'image/*')).toBe(true);
    expect(matchesAccept(file('photo.jpeg', 'image/jpeg'), 'image/*')).toBe(true);
  });

  it('rejects a mime atom of a different top-level type', () => {
    expect(matchesAccept(file('report.pdf', 'application/pdf'), 'image/*')).toBe(false);
  });

  it('matches an exact mime atom', () => {
    expect(matchesAccept(file('report.pdf', 'application/pdf'), 'application/pdf')).toBe(true);
  });

  it('matches any atom of a comma-separated list', () => {
    expect(matchesAccept(file('report.pdf', 'application/pdf'), '.pdf, image/*')).toBe(true);
    expect(matchesAccept(file('photo.png', 'image/png'), '.pdf, image/*')).toBe(true);
    expect(matchesAccept(file('notes.txt', 'text/plain'), '.pdf, image/*')).toBe(false);
  });

  it('accepts everything for an atom that is neither an extension nor a mime type', () => {
    // naive-ui falls through to `true` for such an atom; kept identical here so
    // paste and drop cannot disagree on a malformed accept string.
    expect(matchesAccept(file('anything.bin'), 'nonsense')).toBe(true);
  });
});

describe('collectClipboardFiles', () => {
  it('returns the files a clipboard carries directly', () => {
    const a = file('a.pdf');
    const b = file('b.pdf');
    expect(collectClipboardFiles({ files: [a, b], items: null })).toEqual([a, b]);
  });

  it('falls back to file items when the clipboard exposes no file list', () => {
    // A screenshot pasted from Windows' snipping tool arrives as an item only.
    const shot = file('image.png', 'image/png');
    expect(collectClipboardFiles({ files: [], items: [item('file', 'image/png', shot)] }))
      .toEqual([shot]);
  });

  it('does not report the same file twice when both channels carry it', () => {
    const a = file('a.pdf');
    expect(collectClipboardFiles({
      files: [a],
      items: [item('file', 'application/pdf', a)],
    })).toEqual([a]);
  });

  it('ignores non-file items', () => {
    expect(collectClipboardFiles({
      files: [],
      items: [item('string', 'text/plain', null)],
    })).toEqual([]);
  });

  it('ignores a file item that yields no file', () => {
    expect(collectClipboardFiles({
      files: [],
      items: [item('file', 'image/png', null)],
    })).toEqual([]);
  });

  it('returns nothing for an empty or missing clipboard', () => {
    expect(collectClipboardFiles(null)).toEqual([]);
    expect(collectClipboardFiles(undefined)).toEqual([]);
    expect(collectClipboardFiles({ files: [], items: [] })).toEqual([]);
  });
});

describe('splitByAccept', () => {
  it('partitions files, preserving order', () => {
    const pdf = file('report.pdf', 'application/pdf');
    const png = file('photo.png', 'image/png');
    const txt = file('notes.txt', 'text/plain');

    expect(splitByAccept([png, pdf, txt], '.pdf, image/*')).toEqual({
      accepted: [png, pdf],
      rejected: [txt],
    });
  });

  it('accepts every file when the control has no accept', () => {
    const a = file('a.bin');
    const b = file('b.bin');
    expect(splitByAccept([a, b], '').rejected).toEqual([]);
  });
});
