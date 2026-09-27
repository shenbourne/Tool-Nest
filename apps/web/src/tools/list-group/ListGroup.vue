<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const size = ref(3);
const output = computed(() => {
  const items = input.value.split('\n');
  // Clearing the input yields null, and `i += null` would loop forever, so
  // fall back to a positive step whenever the value is missing or invalid.
  const step = size.value && size.value >= 1 ? size.value : 3;
  const groups: string[] = [];
  for (let i = 0; i < items.length; i += step) groups.push(t('tools.listGroup.groupLabel', { number: groups.length + 1 }) + '\n' + items.slice(i, i+step).join('\n'));
  return groups.join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('tools.listGroup.inputPlaceholder')" />
      <NInputNumber v-model:value="size" :min="1" :placeholder="t('tools.listGroup.groupSize')" style="width:130px" />
      <NInput :value="output" type="textarea" :rows="8" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
