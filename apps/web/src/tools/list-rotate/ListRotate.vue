<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const pos = ref(1);
const output = computed(() => {
  const lines = input.value.split('\n');
  const n = ((pos.value % lines.length) + lines.length) % lines.length;
  return [...lines.slice(n), ...lines.slice(0, n)].join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.listItemsPlaceholder')" />
      <NInputNumber v-model:value="pos" :placeholder="t('common.positions')" style="width:130px" />
      <NInput :value="output" type="textarea" :rows="6" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
