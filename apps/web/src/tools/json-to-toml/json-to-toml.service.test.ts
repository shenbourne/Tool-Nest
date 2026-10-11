import { describe, expect, it } from 'vitest';
import { build } from 'esbuild';
import { runInNewContext } from 'node:vm';
import { jsonToToml } from './json-to-toml.service';

describe('JSON to TOML', () => {
  it('loads and converts in a browser without Node globals', async () => {
    const bundle = await build({
      entryPoints: [new URL('./json-to-toml.service.ts', import.meta.url).pathname.replace(/^\/(\w:)/, '$1')],
      bundle: true, write: false, platform: 'browser', format: 'iife', globalName: 'converter',
      plugins: [{ name: 'browser-stream', setup(builder) {
        builder.onResolve({ filter: /^stream$/ }, () => ({ path: 'stream', namespace: 'browser' }));
        builder.onLoad({ filter: /.*/, namespace: 'browser' }, () => ({ contents: 'module.exports = {}' }));
      } }],
    });
    const browser = {} as { converter: { jsonToToml: typeof jsonToToml } };
    runInNewContext(bundle.outputFiles[0].text, browser);
    expect(browser.converter.jsonToToml('{"title":"example","owner":{"name":"Tom"}}'))
      .toEqual({ result: 'title = "example"\n\n[owner]\nname = "Tom"\n', error: null });
  });
  it('handles empty and invalid input', () => {
    expect(jsonToToml('  ')).toEqual({ result: '', error: null });
    expect(jsonToToml('{bad').error).toBeTruthy();
    expect(jsonToToml('null').error).toBeTruthy();
  });
});
