import { readFileSync } from 'node:fs';
import { describe, it, expect, vi } from 'vitest';
import { ref, computed, watch, nextTick, effectScope } from 'vue';
import ts from 'typescript';
import { generateSecret, secretPresets } from './password-generator/password-generator.service';
import { generateRandomNumbers } from './random-number-generator/random-number-generator.service';

function setup(path: string, names: string[], extras: Record<string, unknown> = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8').split('<script setup lang="ts">')[1].split('</script>')[0].replace(/^import .*;\r?\n/gm, '');
  const dependencies = { ref, computed, watch, useI18n: () => ({ t: (key: string) => key }), generateSecret, secretPresets, generateRandomNumbers, ...extras };
  const code = ts.transpile(source, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None });
  const scope = effectScope();
  const state = scope.run(() => new Function(...Object.keys(dependencies), code + '\nreturn {' + names.join(',') + '};')(...Object.values(dependencies)));
  return { state, stop: () => scope.stop() };
}

describe('automatic generator interactions', () => {
  it('generates secrets on open, batches preset changes, reacts to exclusions and regenerates', async () => {
    const generator = vi.fn(generateSecret);
    const { state: s, stop } = setup('./password-generator/PasswordGenerator.vue', ['pw','length','upper','lower','nums','syms','exclude','error','applyPreset','gen'], { generateSecret: generator });
    try {
      expect(s.pw.value).toHaveLength(16);
      s.applyPreset('token'); await nextTick();
      expect(s.pw.value).toHaveLength(64);
      expect(generator).toHaveBeenCalledTimes(2);
      s.length.value = 12; s.exclude.value = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; await nextTick();
      expect(s.pw.value).toHaveLength(12); expect(s.pw.value).not.toMatch(/[A-Z]/);
      s.gen(); expect(generator).toHaveBeenCalledTimes(4);
      s.upper.value = s.lower.value = s.nums.value = s.syms.value = false; await nextTick();
      expect(s.pw.value).toBe(''); expect(s.error.value).toContain('selectOneOption');
      s.nums.value = true; await nextTick(); expect(s.pw.value).toMatch(/^\d{12}$/);
    } finally { stop(); }
  });
  it('generates random numbers on open/change/retry and recovers after invalid ranges', async () => {
    const generator = vi.fn(generateRandomNumbers);
    const { state: s, stop } = setup('./random-number-generator/RandomNumberGenerator.vue', ['min','max','count','unique','result','gen'], { generateRandomNumbers: generator });
    try {
      expect(s.result.value).toMatch(/^\d+$/);
      s.min.value = 7; s.max.value = 7; s.count.value = 2; await nextTick(); expect(s.result.value).toBe('7, 7');
      s.unique.value = true; await nextTick(); expect(s.result.value).toContain('rangeTooSmall');
      s.count.value = 1; await nextTick(); expect(s.result.value).toBe('7');
      s.gen(); expect(generator).toHaveBeenCalledTimes(5);
    } finally { stop(); }
  });
  it('serializes RSA requests, discards stale results and stops on unmount', async () => {
    const jobs: { bits: number; finish: (err: Error | null, pair?: unknown) => void }[] = [];
    let unmount = () => {};
    const forge = { pki: { rsa: { generateKeyPair: ({ bits }: { bits: number }, finish: typeof jobs[number]['finish']) => jobs.push({bits,finish}) }, publicKeyToPem: (key: string) => key, privateKeyToPem: (key: string) => key } };
    const { state: s, stop } = setup('./rsa-key-pair-generator/RsaKeyPair.vue', ['keySize','publicKey','privateKey','generating','error','generate'], { forge, onBeforeUnmount: (fn: () => void) => { unmount = fn; } });
    try {
      expect(jobs[0].bits).toBe(2048);
      s.keySize.value = 4096; await nextTick(); expect(jobs).toHaveLength(1);
      jobs[0].finish(null, { publicKey: 'old', privateKey: 'old' });
      expect(s.publicKey.value).toBe(''); expect(jobs[1].bits).toBe(4096);
      jobs[1].finish(null, { publicKey: 'new-public', privateKey: 'new-private' }); expect(s.publicKey.value).toBe('new-public');
      s.generate(); expect(jobs).toHaveLength(3); expect(s.publicKey.value).toBe('');
      jobs[2].finish(new Error('failure')); expect(s.error.value).toBe('failure');
      s.keySize.value = null; await nextTick(); expect(jobs).toHaveLength(3); expect(s.generating.value).toBe(false);
      s.keySize.value = 1024; await nextTick(); unmount(); jobs[3].finish(null, { publicKey: 'late', privateKey: 'late' }); expect(s.publicKey.value).toBe('');
    } finally { stop(); }
  });
});
