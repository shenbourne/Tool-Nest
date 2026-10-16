<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import { TOOL_TAB_NAVIGATION, projectToolTabs, resolveToolTab, type TabName } from '@/utils/tool-tab-navigation';
import { NButton, NInput, NInputNumber, NSelect, NSlider, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import ToolTabs from '@/components/ToolTabs.vue';
import ListSeparators from '@/components/ListSeparators.vue';
import { tool } from './index';
import { listFrequencies, type PipelineOptions } from './list-pipeline';
import { createListProcessingState } from './list-processing-state';

const { t } = useI18n();
const route = useRoute();
const processing = createListProcessingState('apple, banana, apple, cherry, banana, date');
const snapshot = shallowRef(processing.read());
const inputText = computed({ get: () => snapshot.value.input, set: (value: string) => { snapshot.value = processing.setInput(value); } });
const options = computed(() => snapshot.value.options);
function updateOptions(patch: Partial<PipelineOptions>) { snapshot.value = processing.updateOptions(patch); }
const tab = ref<TabName<'/list-converter'>>(TOOL_TAB_NAVIGATION['/list-converter'].defaultTab);
const statsLimit = ref(10);
const statsOrder = ref('desc');
const result = computed(() => snapshot.value.result);
function applyReorder(operation: 'reverse' | 'rotate' | 'shuffle') { snapshot.value = processing.confirm(operation); }
const sliderMax = computed(() => snapshot.value.max);
const range = computed<[number, number]>({
  get: (): [number, number] => [snapshot.value.options.start, snapshot.value.options.end],
  set: ([start, end]: [number, number]) => updateOptions({ start, end }),
});
const statistics = computed(() => [
  { name: 'input', title: t('common.input'), items: result.value.sourceItems },
  { name: 'output', title: t('common.output'), items: result.value.items },
].map(column => {
  const frequencies = listFrequencies(column.items);
  if (statsOrder.value === 'asc') frequencies.sort((a, b) => a.count - b.count);
  return { ...column, unique: frequencies.length, rows: frequencies.slice(0, statsLimit.value) };
}));
const label = (key: string) => t(`tools.listWorkbench.${key}`);
const tabs = computed(() => projectToolTabs('/list-converter', t));
const sortOptions = computed(() => ['none', 'ascending', 'descending'].map((key, i) => ({
  label: t(`tools.listConverter.${key}`), value: ['none', 'asc', 'desc'][i],
})));
const cleanupControls = ['trimItems', 'removeEmpty', 'lowerCase', 'removeDuplicates', 'unwrap'] as const;
const reorderControls = ['reverse', 'rotate', 'shuffle'] as const;
const groupSeparators = computed(() => [
  { label: label('blankLine'), value: '\n\n' }, { label: label('newLine'), value: '\n' },
  { label: label('semicolon'), value: ';' }, { label: label('pipe'), value: '|' },
]);
watch(() => route.query, query => {
  const selected = resolveToolTab('/list-converter', query.tab);
  if (selected !== undefined) tab.value = selected;
  if (query.statistics === 'input') tab.value = 'statistics';
  const operation = String(query.operation ?? '');
  if (operation === 'sort') updateOptions({ sortItems: 'asc' });
  if (operation === 'slice') updateOptions({ sliceEnabled: true });
  if (operation === 'group') updateOptions({ groupEnabled: true });
  if (operation === 'unwrap') updateOptions({ conversionEnabled: true, unwrap: true });
}, { immediate: true });
</script>

<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel class="list-workbench" v-model:input-text="inputText" :output-text="result.output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="list.txt" stack-on-mobile wrap-actions action-size="small">
      <template #input>
        <NInput v-model:value="inputText" type="textarea" :rows="6" :placeholder="t('tools.listConverter.inputPlaceholder')" :input-props="{ id: 'listWorkbenchInput', 'aria-label': t('common.input') }" />
      </template>
      <template #output>
        <NInput :value="result.output" type="textarea" :rows="6" readonly :input-props="{ id: 'listWorkbenchOutput', 'aria-label': t('common.output') }" />
      </template>
      <template #output-actions-before>
        <NButton size="small" :disabled="!result.output" @click="inputText = result.output">{{ label('useOutput') }}</NButton>
      </template>
      <template #params>
        <div class="list-summaries">
          <span v-for="column in statistics" :key="column.name" :aria-label="column.title">
            {{ t('tools.listWorkbench.summary', { total: column.items.length, unique: column.unique }) }}
          </span>
        </div>
        <ToolTabs v-model:value="tab" :tabs="tabs" :aria-label="label('operations')">
          <template v-for="entry in tabs" :key="entry.name" #[entry.name]>
            <template v-if="entry.name === 'convert'">
              <div class="parameters">
                <ListSeparators :input-separator="options.inputSeparator" @update:input-separator="updateOptions({ inputSeparator: $event })" :output-separator="options.separator" @update:output-separator="updateOptions({ separator: $event })" />
                <div class="switches"><label v-for="key in cleanupControls" :key="key" class="switch-field"><NSwitch :value="options[key]" @update:value="updateOptions({ [key]: $event })" :aria-label="label(key)" />{{ label(key) }}</label></div>
                <div class="fields"><label>{{ t('tools.listConverter.itemPrefix') }}<NInput :value="options.itemPrefix" @update:value="updateOptions({ itemPrefix: $event })" :input-props="{ 'aria-label': t('tools.listConverter.itemPrefix') }" /></label><label>{{ t('tools.listConverter.itemSuffix') }}<NInput :value="options.itemSuffix" @update:value="updateOptions({ itemSuffix: $event })" :input-props="{ 'aria-label': t('tools.listConverter.itemSuffix') }" /></label></div>
              </div>
            </template>
            <template v-else-if="entry.name === 'reorder'">
              <div class="parameters">
                <div class="fields"><label>{{ t('tools.listConverter.sortOrder') }}<NSelect :value="options.sortItems" @update:value="updateOptions({ sortItems: $event })" :options="sortOptions" :aria-label="t('tools.listConverter.sortOrder')" /></label></div>
                <div class="reorder-actions">
                  <div v-for="operation in reorderControls" :key="operation" class="reorder-action">
                    <span>{{ label(operation) }}</span>
                    <label v-if="operation === 'rotate'" class="rotation-positions" for="listRotationPositions">
                      <span>{{ label('positions') }}</span>
                      <NInputNumber :value="options.positions" @update:value="updateOptions({ positions: $event ?? 0 })" :precision="0" class="rotation-value" :input-props="{ id: 'listRotationPositions' }" />
                    </label>
                    <NButton :disabled="!result.beforeSlice.length" :aria-label="label(operation) + ' · ' + label('applyOnce')" @click="applyReorder(operation)">{{ label('applyOnce') }}</NButton>
                  </div>
                </div>
                <p class="hint">{{ label('rotateHint') }}</p>
              </div>
            </template>
            <template v-else-if="entry.name === 'slice'">
              <div class="parameters">
                <NSlider v-model:value="range" range :min="1" :max="sliderMax" :step="1" :aria-label="label('slice')" />
                <div class="index-row"><label>{{ t('numericParams.startIndex') }}<NInputNumber class="index-value" :value="options.start" @update:value="updateOptions({ start: $event ?? 1 })" :min="1" :max="sliderMax" :precision="0" :update-value-on-input="false" :input-props="{ 'aria-label': t('numericParams.startIndex') }" /></label><label>{{ t('numericParams.endIndex') }}<NInputNumber class="index-value" :value="options.end" @update:value="updateOptions({ end: $event ?? sliderMax })" :min="1" :max="sliderMax" :precision="0" :update-value-on-input="false" :input-props="{ 'aria-label': t('numericParams.endIndex') }" /></label></div>
                <p class="hint">{{ label('rangeHint') }}</p>
              </div>
            </template>
            <template v-else-if="entry.name === 'group'">
              <p class="hint">{{ label('groupDisabledHint') }}</p>
              <div class="parameters fields"><label>{{ label('groupSize') }}<NInputNumber :value="options.groupSize" @update:value="updateOptions({ groupSize: $event ?? 0 })" :min="0" :precision="0" :aria-label="label('groupSize')" /></label><label>{{ label('groupSeparator') }}<NSelect :value="options.groupSeparator" @update:value="updateOptions({ groupSeparator: $event })" :options="groupSeparators" :aria-label="label('groupSeparator')" /></label></div>
            </template>
            <template v-else>
              <div class="parameters statistics">
                <div class="fields">
                  <label>{{ label('statsOrder') }}<NSelect v-model:value="statsOrder" :aria-label="label('statsOrder')" :options="[{ label: label('mostFirst'), value: 'desc' }, { label: label('leastFirst'), value: 'asc' }]" /></label>
                  <label>{{ label('topN') }}<NInputNumber :value="statsLimit" @update:value="statsLimit = $event ?? 10" :min="1" :precision="0" :aria-label="label('topN')" /></label>
                </div>
                <p class="hint">{{ label('statsHint') }}</p>
                <div class="statistics-columns">
                  <section v-for="column in statistics" :key="column.name" class="statistics" :aria-label="column.title">
                    <div class="section-heading">
                      <h2>{{ column.title }}</h2>
                    </div>
                    <div class="frequency-table">
                      <table><thead><tr><th>{{ label('item') }}</th><th>{{ label('count') }}</th></tr></thead>
                        <tbody><tr v-for="row in column.rows" :key="row.item"><td>{{ row.item || label('emptyItem') }}</td><td>{{ row.count }}</td></tr>
                          <tr v-if="!column.rows.length"><td colspan="2">{{ label('noItems') }}</td></tr></tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </div>
            </template>
          </template>
        </ToolTabs>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>

<style scoped>
.statistics, .parameters { display: flex; flex-direction: column; gap: 12px; }
.parameters { margin-top: 16px; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
h2 { margin: 0; font-size: 16px; }
.fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 12px; }
.fields > label { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.switches { display: flex; justify-content: center; flex-wrap: wrap; gap: 16px 24px; }
.switch-field { display: flex; align-items: center; gap: 8px; }
.reorder-actions { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 16px; }
.reorder-action { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.reorder-action:nth-child(2) { justify-content: center; }
.reorder-action:last-child { justify-content: flex-end; }
.rotation-positions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.rotation-value { width: 120px; }
.hint { margin: 0; color: var(--color-text-3); font-size: 13px; overflow-wrap: anywhere; }
.list-summaries { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-md); padding: 12px 0; color: #000; font-size: 13px; }
.list-summaries span:last-child { text-align: right; }
.statistics-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-md); }
.frequency-table { max-height: 200px; overflow: auto; border: 1px solid var(--color-hairline); border-radius: 8px; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--color-hairline); overflow-wrap: anywhere; white-space: pre-wrap; }
th:last-child, td:last-child { width: 65px; text-align: right; }
th { background: var(--color-surface-soft); }
.index-row { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.index-row label { display: flex; align-items: center; gap: 8px; }
.index-row label:last-child { margin-left: auto; }
.index-value { width: 120px; }
@media (max-width: 640px) {
  .reorder-actions { grid-template-columns: 1fr; }
  .reorder-action { justify-content: flex-start; }
  .reorder-action:nth-child(2) { justify-content: center; }
  .reorder-action:last-child { justify-content: flex-end; }
  .statistics-columns { grid-template-columns: 1fr; }
}
</style>
