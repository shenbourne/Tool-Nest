<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NButton, NCard, NInput, NInputNumber, NSpace, NFormItem, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';

const { t } = useI18n();
const { copyToClipboard } = useCopy();

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const hex = ref('#4a90d9');
const r = ref(74); const g = ref(144); const b = ref(217);

// Re-entrancy guard: hex / rgb / hsl all write each other, so only one
// direction may propagate per change to avoid watch ping-pong.
let syncing = false;

function parseHex(v: string): [number, number, number] | undefined {
  const m = v.replace('#', '').match(/^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{3}$/);
  if (!m) return undefined;
  const full = m[0].length === 3 ? m[0].split('').map(c => c + c).join('') : m[0];
  const parts = full.match(/.{2}/g)!;
  return [parseInt(parts[0], 16), parseInt(parts[1], 16), parseInt(parts[2], 16)];
}

function rgbToHexString(rr: number, gg: number, bb: number) {
  return '#' + [rr, gg, bb].map(c => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0')).join('');
}

function rgbToHslValues(rr: number, gg: number, bb: number) {
  const rn = clamp(rr, 0, 255) / 255, gn = clamp(gg, 0, 255) / 255, bn = clamp(bb, 0, 255) / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let hh = 0, ss = 0; const ll = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    ss = ll > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) hh = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) hh = ((bn - rn) / d + 2) / 6;
    else hh = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(hh * 360), s: Math.round(ss * 100), l: Math.round(ll * 100) };
}

function hslToRgbValues(hh: number, ss: number, ll: number): [number, number, number] {
  const hNorm = (((hh % 360) + 360) % 360) / 360;
  const sNorm = clamp(ss, 0, 100) / 100;
  const lNorm = clamp(ll, 0, 100) / 100;
  if (sNorm === 0) {
    const v = Math.round(lNorm * 255);
    return [v, v, v];
  }
  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  const channel = (tNorm: number) => {
    let tn = tNorm;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };
  return [Math.round(channel(hNorm + 1 / 3) * 255), Math.round(channel(hNorm) * 255), Math.round(channel(hNorm - 1 / 3) * 255)];
}

// HSL is always *derived* from the RGB values so HEX/RGB edits never lose
// precision; the H/S/L inputs are write-only: editing them converts back to
// RGB once, which then re-derives HSL for display.
const h = computed(() => rgbToHslValues(r.value, g.value, b.value).h);
const s = computed(() => rgbToHslValues(r.value, g.value, b.value).s);
const l = computed(() => rgbToHslValues(r.value, g.value, b.value).l);

function applyHsl(hh: number, ss: number, ll: number) {
  const [rr, gg, bb] = hslToRgbValues(hh, ss, ll);
  syncing = true;
  r.value = rr; g.value = gg; b.value = bb;
  hex.value = rgbToHexString(rr, gg, bb);
  syncing = false;
}
function onHslInput(which: 'h' | 's' | 'l', v: number | null) {
  if (v === null) return;
  applyHsl(which === 'h' ? v : h.value, which === 's' ? v : s.value, which === 'l' ? v : l.value);
}

const hexError = computed(() => {
  const v = hex.value.trim();
  return v && !parseHex(v) ? t('tools.colorConverter.invalidHex') : '';
});

watch(hex, (v) => {
  if (syncing) return;
  const parsed = parseHex(v.trim());
  if (!parsed) return;
  syncing = true;
  [r.value, g.value, b.value] = parsed;
  syncing = false;
});

watch([r, g, b], () => {
  if (syncing) return;
  syncing = true;
  hex.value = rgbToHexString(r.value ?? 0, g.value ?? 0, b.value ?? 0);
  syncing = false;
});

const rgbText = computed(() => `rgb(${r.value}, ${g.value}, ${b.value})`);
const hslText = computed(() => `hsl(${h.value}, ${s.value}%, ${l.value}%)`);
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="16">
        <div :style="{ width: '100%', height: '60px', borderRadius: '8px', background: hex }" />
        <NFormItem label="HEX" label-placement="left">
          <NInput v-model:value="hex" placeholder="#000000" :input-props="{ id: 'colorConverterField0' }" />
        </NFormItem>
        <NAlert v-if="hexError" type="error" :title="hexError" />
        <div class="channel-row">
          <NFormItem label="R" label-placement="left" class="channel-item">
            <NInputNumber v-model:value="r" :min="0" :max="255" :input-props="{ id: 'colorConverterField1' }" />
          </NFormItem>
          <NFormItem label="G" label-placement="left" class="channel-item">
            <NInputNumber v-model:value="g" :min="0" :max="255" :input-props="{ id: 'colorConverterField2' }" />
          </NFormItem>
          <NFormItem label="B" label-placement="left" class="channel-item">
            <NInputNumber v-model:value="b" :min="0" :max="255" :input-props="{ id: 'colorConverterField3' }" />
          </NFormItem>
        </div>
        <div class="channel-row">
          <NFormItem label="H" label-placement="left" class="channel-item" :label-props="{ for: 'colorConverterField6' }">
            <NInputNumber :value="h" :min="0" :max="360" :input-props="{ id: 'colorConverterField6' }" @update:value="onHslInput('h', $event)" />
          </NFormItem>
          <NFormItem label="S" label-placement="left" class="channel-item" :label-props="{ for: 'colorConverterField7' }">
            <NInputNumber :value="s" :min="0" :max="100" :input-props="{ id: 'colorConverterField7' }" @update:value="onHslInput('s', $event)" />
          </NFormItem>
          <NFormItem label="L" label-placement="left" class="channel-item" :label-props="{ for: 'colorConverterField8' }">
            <NInputNumber :value="l" :min="0" :max="100" :input-props="{ id: 'colorConverterField8' }" @update:value="onHslInput('l', $event)" />
          </NFormItem>
        </div>
        <NFormItem label="RGB" label-placement="left">
          <NInput :value="rgbText" readonly :input-props="{ id: 'colorConverterField5' }" />
          <template #feedback>
            <NButton size="small" :disabled="!rgbText" @click="copyToClipboard(rgbText)">{{ t('tool.copy') }}</NButton>
          </template>
        </NFormItem>
        <NFormItem label="HSL" label-placement="left">
          <NInput :value="hslText" readonly :input-props="{ id: 'colorConverterField4' }" />
          <template #feedback>
            <NButton size="small" :disabled="!hslText" @click="copyToClipboard(hslText)">{{ t('tool.copy') }}</NButton>
          </template>
        </NFormItem>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>

<style scoped>
.channel-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.channel-row .channel-item {
  flex: 1 1 140px;
  min-width: 0;
}
@media (max-width: 640px) {
  .channel-row {
    flex-direction: column;
  }
  .channel-row .channel-item {
    width: 100%;
  }
}
</style>
