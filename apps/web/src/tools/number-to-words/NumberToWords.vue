<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const ONES = ['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function toWords(n: number): string {
  if (n === 0) return 'zero';
  if (n < 0) return 'negative ' + toWords(-n);
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n/10)] + (n%10 ? '-' + ONES[n%10] : '');
  if (n < 1000) return ONES[Math.floor(n/100)] + ' hundred' + (n%100 ? ' and ' + toWords(n%100) : '');
  if (n < 1e6) return toWords(Math.floor(n/1000)) + ' thousand' + (n%1000 ? ' ' + toWords(n%1000) : '');
  if (n < 1e9) return toWords(Math.floor(n/1e6)) + ' million' + (n%1e6 ? ' ' + toWords(n%1e6) : '');
  return toWords(Math.floor(n/1e9)) + ' billion' + (n%1e9 ? ' ' + toWords(n%1e9) : '');
}
const output = computed(() => { const n = parseInt(input.value); return isNaN(n) ? '' : toWords(n); });
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')" />
    </NSpace></NCard>
  </ToolLayout>
</template>
