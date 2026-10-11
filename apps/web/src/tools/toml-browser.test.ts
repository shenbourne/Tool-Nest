import { describe, expect, it } from 'vitest';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { loadConfigFromFile } from 'vite';

describe('TOML tools browser compatibility', () => {
  it.each([
    ['toml-to-json/toml-to-json.service.ts', 'tomlToJson', 'title = "example"\n[owner]\nname = "Tom"', '"name": "Tom"'],
    ['toml-to-yaml/toml-to-yaml.service.ts', 'tomlToYaml', 'title = "example"\n[owner]\nname = "Tom"', 'name: Tom'],
    ['yaml-to-toml/yaml-to-toml.service.ts', 'yamlToToml', 'title: example\nowner:\n  name: Tom', 'name = "Tom"'],
    ['json-to-toml/json-to-toml.service.ts', 'jsonToToml', '{"owner":{"name":"Tom"}}', 'name = "Tom"'],
  ])('loads %s without Node globals and converts input', async (service, name, input, expected) => {
    const config = await loadConfigFromFile({ command: 'build', mode: 'production' }, fileURLToPath(new URL('../../vite.config.ts', import.meta.url)));
    const bundle = await build({
      entryPoints: [fileURLToPath(new URL(`./${service}`, import.meta.url))],
      bundle: true, write: false, platform: 'browser', format: 'iife', globalName: 'converter',
      define: config?.config.define,
      plugins: [{ name: 'browser-stream', setup(builder) {
        builder.onResolve({ filter: /^stream$/ }, () => ({ path: 'stream', namespace: 'browser' }));
        builder.onLoad({ filter: /.*/, namespace: 'browser' }, () => ({ contents: 'module.exports = {}' }));
      } }],
    });
    const browser = {} as { converter: Record<string, (value: string) => { result: string; error: string | null }> };
    runInNewContext(bundle.outputFiles[0].text, browser);
    const convert = browser.converter[name];
    expect(convert(input).error).toBeNull();
    expect(convert(input).result).toContain(expected);
    expect(convert('  ')).toEqual({ result: '', error: null });
    expect(convert(name.startsWith('tomlTo') ? 'a = [' : '{bad').error).toBeTruthy();
    if (name.startsWith('tomlTo')) {
      expect(convert('date = 2026-10-11\ncount = 123').error).toBeNull();
      expect(convert('date = 2026-10-11\ncount = 123').result).toContain('2026-10-11');
    }
  });
});
