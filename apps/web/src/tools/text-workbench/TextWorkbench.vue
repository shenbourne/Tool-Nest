<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import { TOOL_TAB_NAVIGATION, projectToolTabs, resolveToolTab, type TabName } from '@/utils/tool-tab-navigation';
import { useI18n } from 'vue-i18n';
import { NAlert, NButton, NInput, NInputNumber, NSelect, NSlider, NStatistic, NSwitch, NTag } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import ToolTabs from '@/components/ToolTabs.vue';
import DiffViewer from '@/components/DiffViewer.vue';
import { diffLines, summarize } from '@/utils/line-diff';
import { textStatistics } from './text-operations';
import { createTextProcessingState, type TextProcessingOptions } from './text-processing-state';
import { tool } from './index';
const { t } = useI18n();
const route = useRoute();
const processing = createTextProcessingState();
const snapshot = shallowRef(processing.read());
const input = computed({ get: () => snapshot.value.input, set: (value: string) => { snapshot.value = processing.setInput(value); } });
function option<K extends keyof TextProcessingOptions>(key: K) {
  return computed({
    get: () => snapshot.value.options[key],
    set: (value: TextProcessingOptions[K]) => { snapshot.value = processing.updateOptions({ [key]: value }); },
  });
}
const find = option('find');
const replacement = option('replacement');
const regex = option('regex');
const deduplicate = option('deduplicate');
const keepEmpty = option('keepEmpty');
const positions = option('positions');
const mode = option('mode');
const start = option('start');
const end = option('end');
const tab = ref<TabName<'/text-tools'>>(TOOL_TAB_NAVIGATION['/text-tools'].defaultTab);
const label = (key: string) => t(`tools.textWorkbench.${key}`);
const tabs = computed(() => projectToolTabs('/text-tools', t));
const processingError = computed(() => snapshot.value.error ? t('tools.textReplacer.invalidRegex') : '');
const beforeSlice = computed(() => snapshot.value.beforeSlice);
const max = computed(() => snapshot.value.max);
const range = computed<[number, number]>({
  get: (): [number, number] => [snapshot.value.options.start, snapshot.value.options.end],
  set: ([start, end]: [number, number]) => { snapshot.value = processing.updateOptions({ start, end }); },
});
const output = computed(() => snapshot.value.output);
function apply(operation: 'reverse' | 'rotate') { snapshot.value = processing.confirm(operation); }
const modes = computed(() => ['chars', 'words', 'lines'].map((value, i) => ({ value, label: t(`tools.textTruncate.${['characters', 'words', 'lines'][i]}`) })));
const columns = computed(() => [{ name: 'input', text: input.value }, { name: 'output', text: output.value }].map(column => ({ ...column, stats: textStatistics(column.text) })));
const rows = computed(() => diffLines(input.value, output.value));
const diffStats = computed(() => summarize(rows.value));
watch(() => route.query.tab, value => {
  const selected = resolveToolTab('/text-tools', value);
  if (selected !== undefined) tab.value = selected;
}, { immediate: true });
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="text.txt" stack-on-mobile wrap-actions action-size="small">
      <template #input><NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')" :input-props="{ id: 'textWorkbenchInput', 'aria-label': t('common.input') }" /></template>
      <template #output><NInput :value="output" type="textarea" :rows="6" readonly :input-props="{ id: 'textWorkbenchOutput', 'aria-label': t('common.output') }" /></template>
      <template #output-actions-before><NButton size="small" :disabled="!output || !!processingError" @click="input = output">{{ t('tools.listWorkbench.useOutput') }}</NButton></template>
      <template #params>
        <div class="summaries"><span v-for="column in columns" :key="column.name">{{ t('tools.textStats.characters') }}: {{ column.stats.characters }} · {{ t('tools.textStats.words') }}: {{ column.stats.words }}</span></div>
        <NAlert v-if="processingError" type="error" :title="processingError" />
        <ToolTabs v-model:value="tab" :tabs="tabs" :aria-label="label('operations')">
          <template #replace><div class="parameters"><div class="fields"><label>{{ t('tools.textReplacer.findPlaceholder') }}<NInput v-model:value="find" :input-props="{ 'aria-label': t('tools.textReplacer.findPlaceholder') }" /></label><label>{{ t('tools.textReplacer.replacePlaceholder') }}<NInput v-model:value="replacement" :input-props="{ 'aria-label': t('tools.textReplacer.replacePlaceholder') }" /></label></div><label class="inline"><NSwitch v-model:value="regex" :aria-label="t('common.regex')" />{{ t('common.regex') }}</label></div></template>
          <template #deduplicate><div class="parameters"><label class="inline"><NSwitch v-model:value="deduplicate" :aria-label="t('tools.removeDuplicateLines.name')" />{{ t('tools.removeDuplicateLines.name') }}</label><label class="inline"><NSwitch v-model:value="keepEmpty" :disabled="!deduplicate" :aria-label="t('tools.removeDuplicateLines.keepEmpty')" />{{ t('tools.removeDuplicateLines.keepEmpty') }}</label></div></template>
          <template #reorder><div class="parameters reorder"><div class="inline"><span>{{ t('tools.textReverse.name') }}</span><NButton :disabled="!beforeSlice || !!processingError" @click="apply('reverse')">{{ t('tools.listWorkbench.applyOnce') }}</NButton></div><div class="inline"><label for="textRotation">{{ t('common.positions') }}</label><NInputNumber :value="positions" @update:value="positions = $event ?? 0" :precision="0" :input-props="{ id: 'textRotation' }" class="number" /><NButton :disabled="!beforeSlice || !!processingError" @click="apply('rotate')">{{ t('tools.listWorkbench.applyOnce') }}</NButton></div></div></template>
          <template #slice><div class="parameters"><NSelect v-model:value="mode" :options="modes" :aria-label="label('slice')" /><NSlider v-model:value="range" range :min="1" :max="max" :step="1" :aria-label="label('slice')" /><div class="indices"><label class="inline" for="textSliceStart">{{ t('numericParams.startIndex') }}<NInputNumber :value="start" @update:value="start = $event ?? 1" :min="1" :max="max" :precision="0" :input-props="{ id: 'textSliceStart' }" class="number" /></label><label class="inline" for="textSliceEnd">{{ t('numericParams.endIndex') }}<NInputNumber :value="end" @update:value="end = $event ?? max" :min="1" :max="max" :precision="0" :input-props="{ id: 'textSliceEnd' }" class="number" /></label></div></div></template>
          <template #statistics><div class="parameters columns"><section v-for="column in columns" :key="column.name"><h2>{{ t(`common.${column.name}`) }}</h2><div class="stats"><NStatistic v-for="(value, key) in column.stats" :key="key" :label="t(`tools.textStats.${key}`)" :value="key === 'readingTime' ? t('tools.textStats.readingTimeValue', { count: value }) : value" /></div></section></div><div class="parameters"><h2>{{ label('diff') }}</h2><div class="inline"><NTag v-for="key in (['same', 'changed', 'removed', 'added'] as const)" :key="key">{{ t(`tools.textDiff.${key}`, { count: diffStats[key] }) }}</NTag></div><DiffViewer v-if="rows.length" :rows="rows" :left-title="t('common.input')" :right-title="t('common.output')" /></div></template>
        </ToolTabs>
        <p class="hint">{{ label('hint') }}</p>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
<style scoped>
.parameters { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
.fields, .columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.fields label { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.inline, .indices, .reorder { display: flex; flex-direction: row; align-items: center; flex-wrap: wrap; gap: 12px; }
.indices, .reorder { justify-content: space-between; }
.number { width: 120px; }
.summaries { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding: 12px 0; font-size: 13px; }
.summaries span:last-child { text-align: right; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; }
h2 { font-size: 16px; }
.hint { font-size: 13px; color: var(--color-text-3); margin-top: 16px; }
@media (max-width: 640px) { .columns, .fields { grid-template-columns: 1fr; } }
</style>
