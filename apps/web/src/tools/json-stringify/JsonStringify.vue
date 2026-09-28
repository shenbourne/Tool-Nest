<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
// Echoing the raw input on failure made a failed conversion look identical to
// a successful one; report the failure separately instead.
const error = computed(() => {
  if (!input.value.trim()) return '';
  try { JSON.parse(input.value); return ''; } catch { return t('common.invalidJson'); }
});
const output = computed(() => {
  if (error.value) return '';
  if (!input.value.trim()) return '';
  try { const obj = JSON.parse(input.value); return JSON.stringify(obj, null, 2); }
  catch { return ''; }
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'jsonStringifyField0' }"/>
      <NAlert v-if="error" type="error" :title="error" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'jsonStringifyField1' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
