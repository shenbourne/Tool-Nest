import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Every tool that reads a local file must import it through the shared
// ToolFileUpload control, so all tools show the same pick/drag/paste UI.
// A bare native input is both unstyled and invisible to paste support.
const toolsDir = fileURLToPath(new URL('.', import.meta.url));

type Expectation = {
  /** `accept` of each ToolFileUpload on the page, in render order; null = no attribute. */
  accept: (string | null)[];
  /** Whether the control is `multiple` (default false). */
  multiple?: boolean;
};

const EXPECTED: Record<string, Expectation> = {
  'audio-change-speed/AudioChangeSpeed.vue': { accept: ['audio/*'] },
  'audio-converter/AudioConverter.vue': { accept: ['audio/*'] },
  'audio-extract/AudioExtract.vue': { accept: ['video/*'] },
  'audio-loop/AudioLoop.vue': { accept: ['audio/*'] },
  'audio-merge/AudioMerge.vue': { accept: ['audio/*'], multiple: true },
  'audio-trim/AudioTrim.vue': { accept: ['audio/*'] },
  'base64-file-converter/Base64FileConverter.vue': { accept: [null] },
  'gif-change-speed/GifChangeSpeed.vue': { accept: ['image/gif'] },
  'image-change-colors/ImageChangeColors.vue': { accept: ['image/*'] },
  'image-create-transparent/ImageCreateTransparent.vue': { accept: ['image/*'] },
  'image-crop/ImageCrop.vue': { accept: ['image/*'] },
  'image-editor/ImageEditor.vue': { accept: ['image/*'] },
  'image-remove-background/ImageRemoveBackground.vue': { accept: ['image/*'] },
  'image-split/ImageSplit.vue': { accept: ['image/*'] },
  'image-to-text-ocr/ImageToTextOcr.vue': { accept: ['image/*'] },
  'images-to-gif/ImagesToGif.vue': { accept: ['image/*'], multiple: true },
  'jpg-to-png/JpgToPng.vue': { accept: ['image/jpeg'] },
  'video-add-audio/VideoAddAudio.vue': { accept: ['video/*', 'audio/*'] },
  'video-change-speed/VideoChangeSpeed.vue': { accept: ['video/*'] },
  'video-compress/VideoCompress.vue': { accept: ['video/*'] },
  'video-crop/VideoCrop.vue': { accept: ['video/*'] },
  'video-flip/VideoFlip.vue': { accept: ['video/*'] },
  'video-loop/VideoLoop.vue': { accept: ['video/*'] },
  'video-merge/VideoMerge.vue': { accept: ['video/*'], multiple: true },
  'video-resize/VideoResize.vue': { accept: ['video/*'] },
  'video-rotate/VideoRotate.vue': { accept: ['video/*'] },
  'video-to-gif/VideoToGif.vue': { accept: ['video/*'] },
  'video-trim/VideoTrim.vue': { accept: ['video/*'] },
};

const componentPaths = readdirSync(toolsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((entry) =>
    readdirSync(join(toolsDir, entry.name))
      .filter((name) => name.endsWith('.vue'))
      .map((name) => `${entry.name}/${name}`),
  );

function source(name: string) {
  return readFileSync(join(toolsDir, ...name.split('/')), 'utf8');
}

function controlTags(markup: string) {
  return [...markup.matchAll(/<ToolFileUpload\b[^>]*>/g)].map((match) => match[0]);
}

function acceptOf(tag: string) {
  return tag.match(/\baccept="([^"]*)"/)?.[1] ?? null;
}

describe('tool file import controls', () => {
  it('has no tool rendering a bare native file input', () => {
    const offenders = componentPaths.filter((name) => source(name).includes('type="file"'));
    expect(offenders).toEqual([]);
  });

  it('imports every local file through the shared control', () => {
    const failures: string[] = [];

    for (const [name, expectation] of Object.entries(EXPECTED)) {
      if (!componentPaths.includes(name)) {
        failures.push(`${name}: component not found`);
        continue;
      }
      const tags = controlTags(source(name));
      if (tags.length !== expectation.accept.length) {
        failures.push(
          `${name}: expected ${expectation.accept.length} ToolFileUpload control(s), found ${tags.length}`,
        );
        continue;
      }
      const accepted = tags.map(acceptOf);
      if (JSON.stringify(accepted) !== JSON.stringify(expectation.accept)) {
        failures.push(
          `${name}: accept ${JSON.stringify(accepted)} != ${JSON.stringify(expectation.accept)}`,
        );
      }
      const multiples = tags.map((tag) => /\smultiple\b/.test(tag));
      if (multiples.some((value) => value !== (expectation.multiple ?? false))) {
        failures.push(`${name}: multiple ${JSON.stringify(multiples)} != ${expectation.multiple ?? false}`);
      }
    }

    expect(failures).toEqual([]);
  });
});
