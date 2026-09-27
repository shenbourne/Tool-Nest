<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NCard, NInput, NInputNumber, NSpace, NFormItem, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const hex = ref('#4a90d9');
const r = ref(74); const g = ref(144); const b = ref(217);

function hexToRgb(h: string) {
  const m = h.replace('#','').match(/.{2}/g);
  if (!m || m.length < 3) return;
  r.value = parseInt(m[0], 16); g.value = parseInt(m[1], 16); b.value = parseInt(m[2], 16);
}
function rgbToHex() {
  hex.value = '#' + [r.value, g.value, b.value].map(c => Math.max(0,Math.min(255,c)).toString(16).padStart(2,'0')).join('');
}

const hexError = computed(() => {
  const v = hex.value.trim();
  return v && !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? t('tools.colorConverter.invalidHex') : '';
});
watch(hex, (v) => {
  const m = v.replace('#','');
  if (/^[0-9a-fA-F]{3}$/.test(m)) hexToRgb(m.split('').map(c => c + c).join(''));
  else if (/^[0-9a-fA-F]{6}$/.test(m)) hexToRgb(m);
});
watch([r, g, b], () => rgbToHex());

const hsl = computed(() => {
  const rn = r.value/255, gn = g.value/255, bn = b.value/255;
  const max = Math.max(rn,gn,bn), min = Math.min(rn,gn,bn);
  let h = 0, s = 0; const l = (max+min)/2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    if (max === rn) h = ((gn-bn)/d + (gn<bn?6:0))/6;
    else if (max === gn) h = ((bn-rn)/d+2)/6;
    else h = ((rn-gn)/d+4)/6;
  }
  return `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
});
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="16">
        <div :style="{ width: '100%', height: '60px', borderRadius: '8px', background: hex }" />
        <NInput v-model:value="hex" placeholder="#000000" />
        <NAlert v-if="hexError" type="error" :title="hexError" />
        <div style="display: flex; gap: 12px;">
          <NFormItem label="R" label-placement="left" style="flex:1;">
            <NInputNumber v-model:value="r" :min="0" :max="255" />
          </NFormItem>
          <NFormItem label="G" label-placement="left" style="flex:1;">
            <NInputNumber v-model:value="g" :min="0" :max="255" />
          </NFormItem>
          <NFormItem label="B" label-placement="left" style="flex:1;">
            <NInputNumber v-model:value="b" :min="0" :max="255" />
          </NFormItem>
        </div>
        <NInput :value="hsl" readonly />
        <NInput :value="`rgb(${r}, ${g}, ${b})`" readonly />
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
