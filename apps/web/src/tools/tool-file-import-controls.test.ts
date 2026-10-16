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
  'table-tools/TableTools.vue': { accept: ['.csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain'] },
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
  'image-format-converter/ImageFormatConverter.vue': { accept: ['image/*'] },
  'pdf-merge/PdfMerge.vue': { accept: ['.pdf'], multiple: true },
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

// A box shows one file or many, and only that decides its shape: several files
// are 128x128 tiles the user can drag to reorder and remove with the card's own
// button, one file is the full-width card. A tool that re-implements any of
// that next to the control (a duplicate filename list, its own reorder buttons)
// is the layout drift this pins down.
const MULTI_OUTPUT_TOOLS = [
  'image-split/ImageSplit.vue',
  'pdf-to-png/PdfToPng.vue',
  'pdf-extract-images/PdfExtractImages.vue',
];

describe('file box shapes', () => {
  it('leaves every box shape to the control', () => {
    const offenders = componentPaths.filter((name) => {
      const src = source(name);
      if (controlTags(src).some((tag) => /\s:?compact\b/.test(tag))) return true;
      return /common\.(moveUp|moveDown)/.test(src);
    });

    expect(offenders).toEqual([]);
  });

  it('hands several result files to the panel as a grid', () => {
    const offenders = MULTI_OUTPUT_TOOLS.filter(
      (name) => !source(name).includes('<ToolFilePanel output-multiple'),
    );

    expect(offenders).toEqual([]);
  });
});
