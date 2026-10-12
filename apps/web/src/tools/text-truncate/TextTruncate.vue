<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NInput, NInputNumber, NSelect, NSlider } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const mode = ref('chars');
// 人类直觉的 1 基索引：起始从 1 开始，结束索引包含自身，全选为 [1, N]
const start = ref(1);
const end = ref(10);
const modeOptions = computed(() => [
  { label: t('tools.textTruncate.characters'), value: 'chars' },
  { label: t('tools.textTruncate.words'), value: 'words' },
  { label: t('tools.textTruncate.lines'), value: 'lines' },
]);
const units = computed<string[]>(() => {
  if (mode.value === 'words') return input.value.split(/\s+/);
  if (mode.value === 'lines') return input.value.split('\n');
  return Array.from(input.value);
});
const unitCount = computed(() => units.value.length);
// 输入变化后单位总数可能缩小，钳制起止索引避免越界
watch(unitCount, (n) => {
  const max = Math.max(n, 1);
  if (start.value > max) start.value = max;
  if (end.value > max) end.value = max;
});
// 起始不超过结束、结束不早于起始（与滑条双柄互相推挤的行为一致）
watch(start, (s) => { if (s > end.value) end.value = s; });
watch(end, (e) => { if (e < start.value) start.value = e; });
const sliderMax = computed(() => Math.max(unitCount.value, 1));
const rangeValue = computed<[number, number]>({
  get: (): [number, number] => [Math.min(start.value, sliderMax.value), Math.min(end.value, sliderMax.value)],
  set: ([s, e]: [number, number]) => { start.value = s; end.value = e; },
});
const output = computed(() => {
  if (mode.value === 'words') return units.value.slice(start.value - 1, end.value).join(' ');
  if (mode.value === 'lines') return units.value.slice(start.value - 1, end.value).join('\n');
  return input.value.slice(start.value - 1, end.value);
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="5" :placeholder="t('tools.textTruncate.inputPlaceholder')"  :input-props="{ id: 'textTruncateField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="5" readonly  :input-props="{ id: 'textTruncateField2' }"/>
      </template>
      <template #params>
        <div class="slice-params">
          <NSelect v-model:value="mode" :options="modeOptions" style="width:140px" />
          <NSlider v-model:value="rangeValue" range :min="1" :max="sliderMax" :step="1" :aria-label="t('tools.textTruncate.name')" />
          <div class="slice-index-row">
            <div class="tool-numeric-param">
              <label for="textTruncateField1">{{ t('numericParams.startIndex') }}:</label>
              <NInputNumber v-model:value="start" :min="1" :max="sliderMax" :placeholder="t('common.start')" style="width:120px"  :input-props="{ id: 'textTruncateField1' }"/>
            </div>
            <div class="tool-numeric-param slice-index-end">
              <label for="textTruncateField3">{{ t('numericParams.endIndex') }}:</label>
              <NInputNumber v-model:value="end" :min="1" :max="sliderMax" :placeholder="t('common.end')" style="width:120px"  :input-props="{ id: 'textTruncateField3' }"/>
            </div>
          </div>
        </div>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>

<style scoped>
.slice-params {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}
.slice-index-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
}
.slice-index-end {
  text-align: right;
}
</style>
