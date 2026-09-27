<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NInputNumber, NInput } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const start = ref(1);
const diff = ref(3);
const count = ref(10);
// Cleared NInputNumber fields are null; fall back to sensible defaults so the
// sequence, nth term, and sum never show stale or NaN values.
const params = computed(() => ({
  start: start.value ?? 0,
  diff: diff.value ?? 0,
  count: count.value && count.value >= 1 ? Math.floor(count.value) : 1,
}));
const seq = computed(() => Array.from({ length: params.value.count }, (_, i) => params.value.start + i * params.value.diff));
const nth = computed(() => params.value.start + (params.value.count - 1) * params.value.diff);
const sum = computed(() => params.value.count * (params.value.start + nth.value) / 2);
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NSpace><NInputNumber v-model:value="start" :placeholder="t('tools.arithmeticSequence.firstTerm')" style="width:130px" /><NInputNumber v-model:value="diff" :placeholder="t('tools.arithmeticSequence.difference')" style="width:130px" /><NInputNumber v-model:value="count" :min="1" :max="100" :placeholder="t('common.count')" style="width:130px" /></NSpace>
      <NInput :value="t('tools.arithmeticSequence.sequence', { value: seq.join(', ') })" readonly />
      <NInput :value="t('tools.arithmeticSequence.nthTerm', { value: nth }) + ' | ' + t('common.sum', { value: sum })" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
