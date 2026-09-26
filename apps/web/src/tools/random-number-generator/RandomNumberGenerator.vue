<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NInputNumber, NButton, NInput, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const min = ref(1); const max = ref(100); const count = ref(1);
const unique = ref(false); const result = ref('');
function gen() {
  const nums = new Set<number>();
  const range = max.value - min.value + 1;
  if (unique.value && count.value > range) { result.value = t('tools.randomNumberGenerator.rangeTooSmall'); return; }
  while (nums.size < count.value) {
    nums.add(Math.floor(Math.random() * range) + min.value);
    if (nums.size > 10000) break;
  }
  result.value = [...nums].join(', ');
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NSpace><NInputNumber v-model:value="min" :placeholder="t('common.min')" style="width:120px" /><NInputNumber v-model:value="max" :placeholder="t('common.max')" style="width:120px" /><NInputNumber v-model:value="count" :min="1" :max="10000" :placeholder="t('common.count')" style="width:120px" /></NSpace>
      <NSwitch v-model:value="unique">{{ t('tools.randomNumberGenerator.uniqueOnly') }}</NSwitch>
      <NButton type="primary" @click="gen">{{ t('common.generate') }}</NButton>
      <NInput :value="result" type="textarea" :rows="4" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
