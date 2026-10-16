<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { NAlert, NButton, NInput, NSelect } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
import { convertData, formats, isFormat } from './data-converter.service';
const route = useRoute();
const router = useRouter();
const { t, te } = useI18n();
const input = ref('');
const from = computed(() => isFormat(route.query.from) ? route.query.from : 'json');
const to = computed(() => isFormat(route.query.to) ? route.query.to : 'yaml');
const options = formats.map(value => ({ label: value.toUpperCase(), value }));
const conversion = computed(() => convertData(input.value, from.value, to.value));
const error = computed(() => {
  const message = conversion.value.error;
  return message && te(`tools.dataConverter.${message}`) ? t(`tools.dataConverter.${message}`) : message;
});
function select(key: 'from' | 'to', value: string) {
  void router.replace({ query: { ...route.query, [key]: value }, hash: route.hash });
}
function swap() {
  if (!conversion.value.result || error.value) return;
  input.value = conversion.value.result;
  void router.replace({ query: { ...route.query, from: to.value, to: from.value }, hash: route.hash });
}
</script>
<template>
  <ToolLayout :tool="tool">
    <div class="format-controls">
      <label><span>{{ t('tools.dataConverter.from') }}</span><NSelect :value="from" :options="options" :aria-label="t('tools.dataConverter.from')" @update:value="select('from', $event)" /></label>
      <NButton :disabled="!conversion.result || !!error" @click="swap">{{ t('tools.dataConverter.swap') }}</NButton>
      <label><span>{{ t('tools.dataConverter.to') }}</span><NSelect :value="to" :options="options" :aria-label="t('tools.dataConverter.to')" @update:value="select('to', $event)" /></label>
    </div>
    <ToolTextPanel v-model:input-text="input" :output-text="conversion.result" :input-title="`${t('common.input')} · ${from.toUpperCase()}`" :output-title="`${t('common.output')} · ${to.toUpperCase()}`" :export-name="`output.${to}`" stack-on-mobile wrap-actions>
      <template #input><NInput v-model:value="input" type="textarea" :rows="12" :placeholder="t('common.inputPlaceholder')" :input-props="{ 'aria-label': t('common.input') }" /></template>
      <template #output><NInput :value="conversion.result" type="textarea" :rows="12" readonly :placeholder="t('common.outputPlaceholder')" :input-props="{ 'aria-label': t('common.output') }" /></template>
      <template #params>
        <NAlert v-if="error" type="error">{{ error }}</NAlert>
        <NAlert type="info">{{ t('tools.dataConverter.note') }}</NAlert>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
<style scoped>
.format-controls { display: flex; align-items: end; gap: 12px; margin-bottom: 16px; }
.format-controls label { flex: 1; min-width: 0; display: grid; gap: 6px; }
@media (max-width: 600px) { .format-controls { flex-wrap: wrap; } .format-controls label { flex-basis: 100%; } .format-controls :deep(.n-button) { order: 1; } }
</style>
