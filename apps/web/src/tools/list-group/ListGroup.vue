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
  const items = input.value.split('\n').filter(Boolean);
  const groups: string[] = [];
  for (let i = 0; i < items.length; i += size.value) groups.push(t('tools.listGroup.groupLabel', { number: groups.length + 1 }) + '\n' + items.slice(i, i+size.value).join('\n'));
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
