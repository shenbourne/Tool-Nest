<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const MORSE: Record<string,string> = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.'};
const REV = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));
const output = computed(() => {
  const t = input.value.trim();
  if (!t) return '';
  if (t.includes('.')) return t.split(' / ').map(w => w.split(' ').map(c => REV[c]||'').join('')).join(' ');
  return t.toUpperCase().split('').map(c => c === ' ' ? '/' : MORSE[c] || '').filter(Boolean).join(' ');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')" />
    </NSpace></NCard>
  </ToolLayout>
</template>
