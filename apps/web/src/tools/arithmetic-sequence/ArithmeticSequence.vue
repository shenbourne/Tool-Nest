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
const seq = computed(() => Array.from({length: count.value}, (_, i) => start.value + i * diff.value));
const nth = computed(() => start.value + (count.value - 1) * diff.value);
const sum = computed(() => count.value * (start.value + nth.value) / 2);
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
