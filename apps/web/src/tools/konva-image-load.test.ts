import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Konva's Image shape only *listens* for a `load` event on its source element
// (`konva/lib/shapes/Image.js`), it never dispatches one — so vue-konva's
// `@load` on `<v-image>` is dead code. A tool that populates its image element
// only from that handler feeds `null` back into the node and draws nothing,
// which is exactly how image-editor and image-crop shipped a blank canvas.
const toolsDir = fileURLToPath(new URL('.', import.meta.url));

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

function konvaImageTags(markup: string) {
  return [...markup.matchAll(/<v-image\b[\s\S]*?\/>/g)].map((match) => match[0]);
}

const canvasTools = componentPaths.filter((name) => source(name).includes('<v-image'));

describe('konva image loading', () => {
  it('finds the tools that render a konva image', () => {
    expect(canvasTools.length).toBeGreaterThan(0);
  });

  it('never binds @load on a konva <v-image>', () => {
    const offenders = canvasTools.filter((name) =>
      konvaImageTags(source(name)).some((tag) => /\s@load\b/.test(tag)),
    );
    expect(offenders).toEqual([]);
  });

  it('loads the image through a DOM <img @load> before handing it to konva', () => {
    const failures = canvasTools.filter((name) => !/<img\b[^>]*\s@load=/.test(source(name)));
    expect(failures).toEqual([]);
  });
});
