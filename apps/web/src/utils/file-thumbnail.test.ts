import { describe, expect, it } from 'vitest';
import { containDestRect, coverSourceRect, fileCategory, thumbnailKind } from './file-thumbnail';

function file(name: string, type = '') {
  return { name, type };
}

describe('thumbnailKind', () => {
  it('treats anything under image/ as an image', () => {
    expect(thumbnailKind(file('a.png', 'image/png'))).toBe('image');
    expect(thumbnailKind(file('a.jpeg', 'image/jpeg'))).toBe('image');
    expect(thumbnailKind(file('a.svg', 'image/svg+xml'))).toBe('image');
  });

  it('treats a PDF by MIME type', () => {
    expect(thumbnailKind(file('report.pdf', 'application/pdf'))).toBe('pdf');
  });

  it('falls back to the extension for a PDF with no usable MIME type', () => {
    // Files dragged from some clients arrive with an empty type.
    expect(thumbnailKind(file('report.pdf'))).toBe('pdf');
    expect(thumbnailKind(file('REPORT.PDF', 'application/octet-stream'))).toBe('pdf');
  });

  it('treats anything under video/ as a video', () => {
    expect(thumbnailKind(file('clip.mp4', 'video/mp4'))).toBe('video');
    expect(thumbnailKind(file('clip.mov', 'video/quicktime'))).toBe('video');
  });

  it('falls back to the extension for a video with no usable MIME type', () => {
    expect(thumbnailKind(file('clip.mp4'))).toBe('video');
    expect(thumbnailKind(file('clip.MKV'))).toBe('video');
  });

  it('has no thumbnail for audio or unknown types', () => {
    expect(thumbnailKind(file('song.mp3', 'audio/mpeg'))).toBe('none');
    expect(thumbnailKind(file('song.wav', 'audio/wav'))).toBe('none');
    expect(thumbnailKind(file('notes.txt', 'text/plain'))).toBe('none');
    expect(thumbnailKind(file('mystery'))).toBe('none');
  });

  it('prefers the MIME type over a misleading extension', () => {
    expect(thumbnailKind(file('renamed.pdf', 'image/png'))).toBe('image');
    expect(thumbnailKind(file('actually-a-video.pdf', 'video/mp4'))).toBe('video');
  });
});

describe('coverSourceRect', () => {
  // A square output canvas takes the largest centred square of the source.
  it('crops the wide side of a landscape image', () => {
    expect(coverSourceRect(100, 50)).toEqual({ x: 25, y: 0, width: 50, height: 50 });
  });

  it('crops the tall side of a portrait image', () => {
    expect(coverSourceRect(50, 100)).toEqual({ x: 0, y: 25, width: 50, height: 50 });
  });

  it('keeps a square source whole', () => {
    expect(coverSourceRect(60, 60)).toEqual({ x: 0, y: 0, width: 60, height: 60 });
  });

  it('handles an extreme aspect ratio', () => {
    expect(coverSourceRect(1, 1000)).toEqual({ x: 0, y: 499.5, width: 1, height: 1 });
  });

  it('refuses a source with no area', () => {
    expect(coverSourceRect(0, 50)).toBeNull();
    expect(coverSourceRect(50, 0)).toBeNull();
    expect(coverSourceRect(-5, 50)).toBeNull();
    expect(coverSourceRect(Number.NaN, 50)).toBeNull();
  });
});

describe('containDestRect', () => {
  it('letterboxes a landscape source inside the box', () => {
    expect(containDestRect(100, 50, 40)).toEqual({ x: 0, y: 10, width: 40, height: 20 });
  });

  it('pillarboxes a portrait source inside the box', () => {
    expect(containDestRect(50, 100, 40)).toEqual({ x: 10, y: 0, width: 20, height: 40 });
  });

  it('fills the box when the source is already square', () => {
    expect(containDestRect(40, 40, 40)).toEqual({ x: 0, y: 0, width: 40, height: 40 });
  });

  it('keeps an extreme ratio inside the box', () => {
    const rect = containDestRect(1, 1000, 40);
    expect(rect?.height).toBe(40);
    expect(rect?.width).toBeCloseTo(0.04);
    expect(rect?.x).toBeCloseTo(19.98);
    expect(rect?.y).toBe(0);
  });

  it('scales a small source up to the box, so a tiny page is still visible', () => {
    expect(containDestRect(10, 5, 40)).toEqual({ x: 0, y: 10, width: 40, height: 20 });
  });

  it('refuses a source or a box with no area', () => {
    expect(containDestRect(0, 50, 40)).toBeNull();
    expect(containDestRect(50, 100, 0)).toBeNull();
    expect(containDestRect(50, 100, -1)).toBeNull();
    expect(containDestRect(50, Number.NaN, 40)).toBeNull();
  });
});

describe('fileCategory', () => {
  it('classifies PDF by MIME type', () => {
    expect(fileCategory(file('report.pdf', 'application/pdf'))).toBe('pdf');
  });

  it('classifies PDF by extension when MIME is empty', () => {
    expect(fileCategory(file('report.pdf'))).toBe('pdf');
    expect(fileCategory(file('REPORT.PDF'))).toBe('pdf');
  });

  it('classifies video by MIME type', () => {
    expect(fileCategory(file('clip.mp4', 'video/mp4'))).toBe('video');
    expect(fileCategory(file('clip.mov', 'video/quicktime'))).toBe('video');
  });

  it('classifies video by extension when MIME is empty', () => {
    expect(fileCategory(file('clip.mp4'))).toBe('video');
    expect(fileCategory(file('clip.MKV'))).toBe('video');
  });

  it('classifies audio by MIME type', () => {
    expect(fileCategory(file('song.mp3', 'audio/mpeg'))).toBe('audio');
    expect(fileCategory(file('song.wav', 'audio/wav'))).toBe('audio');
  });

  it('classifies audio by extension when MIME is empty', () => {
    expect(fileCategory(file('song.flac'))).toBe('audio');
    expect(fileCategory(file('song.M4A'))).toBe('audio');
  });

  it('classifies image by MIME type', () => {
    expect(fileCategory(file('photo.png', 'image/png'))).toBe('image');
    expect(fileCategory(file('photo.jpg', 'image/jpeg'))).toBe('image');
  });

  it('classifies archives by extension', () => {
    expect(fileCategory(file('backup.zip'))).toBe('archive');
    expect(fileCategory(file('backup.tar.gz'))).toBe('archive');
    expect(fileCategory(file('backup.7z'))).toBe('archive');
  });

  it('classifies spreadsheets by extension', () => {
    expect(fileCategory(file('data.xlsx'))).toBe('spreadsheet');
    expect(fileCategory(file('data.csv'))).toBe('spreadsheet');
  });

  it('classifies code files by extension', () => {
    expect(fileCategory(file('app.ts'))).toBe('code');
    expect(fileCategory(file('style.css'))).toBe('code');
    expect(fileCategory(file('data.json'))).toBe('code');
    expect(fileCategory(file('README.md'))).toBe('code');
  });

  it('classifies plain text by MIME type', () => {
    expect(fileCategory(file('notes.txt', 'text/plain'))).toBe('text');
    expect(fileCategory(file('log', 'text/log'))).toBe('text');
  });

  it('returns other for unknown types', () => {
    expect(fileCategory(file('mystery'))).toBe('other');
    expect(fileCategory(file('data.bin', 'application/octet-stream'))).toBe('other');
  });

  it('prefers MIME type over a misleading extension', () => {
    expect(fileCategory(file('renamed.pdf', 'image/png'))).toBe('image');
    expect(fileCategory(file('actually-video.pdf', 'video/mp4'))).toBe('video');
  });
});
