import { describe, expect, it } from 'vitest';
import { buildImagesToGifCommand } from './image-slideshow';

const build = (overrides: Partial<Parameters<typeof buildImagesToGifCommand>[0]> = {}) =>
  buildImagesToGifCommand({
    inputNames: ['a.png', 'b.png', 'c.png'],
    listName: 'list.txt',
    outputName: 'out.gif',
    frameDuration: 0.5,
    ...overrides,
  });

const namesOf = (listContent: string) =>
  listContent
    .split('\n')
    .filter((line) => line.startsWith('file '))
    .map((line) => line.slice("file '".length, -1));

const capOf = (args: string[]) => args[args.indexOf('-frames:v') + 1];

describe('buildImagesToGifCommand', () => {
  // FFmpeg's fps filter ends the stream at the last frame's own timestamp plus
  // that frame's duration. The concat demuxer stamps the terminal entry with the
  // image demuxer's default frame duration rather than its `duration` directive,
  // so the final image is the frame that gets dropped.
  it('repeats the last entry, so the final image is no longer the terminal frame', () => {
    expect(build().listContent).toBe(
      [
        "file 'a.png'",
        'duration 0.5',
        "file 'b.png'",
        'duration 0.5',
        "file 'c.png'",
        'duration 0.5',
        "file 'c.png'",
        'duration 0.5',
      ].join('\n'),
    );
  });

  it('keeps the images in the order they were selected', () => {
    expect(namesOf(build().listContent)).toEqual(['a.png', 'b.png', 'c.png', 'c.png']);
  });

  it('gives every entry the labelled frame duration', () => {
    const listContent = build({ frameDuration: 1.5 }).listContent;
    expect(listContent.match(/duration 1\.5/g)).toHaveLength(4);
  });

  // Cores that do honour the terminal duration emit the repeated entry; the cap
  // makes both versions produce exactly one frame per image.
  it('caps the output at one frame per image', () => {
    expect(capOf(build().args)).toBe('3');
  });

  it('repeats the last image and caps the count for any number of images', () => {
    for (const count of [1, 2, 5]) {
      const inputNames = Array.from({ length: count }, (_, i) => `f${i}.png`);
      const { listContent, args } = build({ inputNames });

      expect(namesOf(listContent)).toEqual([...inputNames, inputNames[count - 1]]);
      expect(capOf(args)).toBe(String(count));
    }
  });

  it('resamples at the labelled frame duration without rounding', () => {
    expect(build({ frameDuration: 0.5 }).args).toContain('fps=2,scale=480:-1:flags=lanczos');
    expect(build({ frameDuration: 3 }).args).toContain('fps=0.3333333333333333,scale=480:-1:flags=lanczos');
  });

  it('still drives the concat demuxer and writes the named output', () => {
    const { args } = build();
    expect(args.slice(0, 5)).toEqual(['-f', 'concat', '-safe', '0', '-i']);
    expect(args[5]).toBe('list.txt');
    expect(args[args.length - 1]).toBe('out.gif');
    expect(args).toContain('-loop');
  });
});
