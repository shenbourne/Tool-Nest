<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { TOOL_TAB_NAVIGATION, projectToolTabs, resolveToolTab, type TabName } from '@/utils/tool-tab-navigation';
import { NAlert, NFormItem, NInput, NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import EmbeddedPanel from './EmbeddedPanel.vue';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTabs from '@/components/ToolTabs.vue';
import TimeToolPanel from './TimeToolPanel.vue';
import Weekday from '../date-weekday-calculator/DateWeekdayCalculator.vue';
import Interval from '../time-between-dates/TimeBetweenDates.vue';
import Discord from '../discord-timestamp/DiscordTimestamp.vue';
import Truncate from '../truncate-clock-time/TruncateClockTime.vue';
import { durationSeconds, durationClock, type DurationUnit } from './duration';
import { tool } from './index';
const { t } = useI18n();
const tabs = computed(() => projectToolTabs('/date-time', t));
const route = useRoute();
const activeTab = ref<TabName<'/date-time'>>(TOOL_TAB_NAVIGATION['/date-time'].defaultTab);
watch(() => route.query.tab, value => {
  const selected = resolveToolTab('/date-time', value);
  if (selected !== undefined) activeTab.value = selected;
}, { immediate: true });
const input = ref('1');
const unit = ref<DurationUnit>('days');
const options = computed(() => [
  ...(['days', 'hours', 'minutes', 'seconds'] as const).map(value => ({ value, label: t('common.' + value) })),
  { value: 'clock', label: t('tools.dateTime.clock') },
]);
const seconds = computed(() => durationSeconds(input.value, unit.value));
const output = computed(() => {
  if (seconds.value === null) return '';
  const s = seconds.value;
  const number = (value: number) => String(Number(value.toPrecision(12)));
  return [
    number(s / 86400) + ' ' + t('common.days'),
    number(s / 3600) + ' ' + t('common.hours'),
    number(s / 60) + ' ' + t('common.minutes'),
    number(s) + ' ' + t('common.seconds'),
    durationClock(s),
    Math.floor(s / 86400) + ' ' + t('common.days') + ' ' + durationClock(s % 86400),
  ].join('\n');
});
const results = computed(() => {
  if (!output.value) return [];
  const values = output.value.split('\n');
  const labels = [...(['days', 'hours', 'minutes', 'seconds'] as const).map(key => t('common.' + key)), t('tools.dateTime.resultsClock'), t('tools.dateTime.remainder')];
  return labels.map((label, i) => ({ label, value: i < 4 ? values[i].split(' ')[0] : values[i] }));
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTabs v-model:value="activeTab" :tabs="tabs" :aria-label="t(tool.name)">
      <template #duration>
        <TimeToolPanel :results="results">
          <NFormItem :show-feedback="false" :label="t('tools.dateTime.amount')"><NInput v-model:value="input" :input-props="{ 'aria-label': t('tools.dateTime.amount'), inputmode: unit === 'clock' ? 'text' : 'decimal' }" :placeholder="unit === 'clock' ? 'HH:MM:SS' : '0'" /></NFormItem>
          <NFormItem :show-feedback="false" :label="t('tools.dateTime.unit')"><NSelect v-model:value="unit" :options="options" :aria-label="t('tools.dateTime.unit')" /></NFormItem>
          <template #feedback><NAlert v-if="input.trim() && seconds === null" type="error">{{ t('tools.dateTime.invalid') }}</NAlert></template>
        </TimeToolPanel>
      </template>
      <template #weekday><EmbeddedPanel><Weekday /></EmbeddedPanel></template>
      <template #interval><EmbeddedPanel><Interval /></EmbeddedPanel></template>
      <template #discord><EmbeddedPanel><Discord /></EmbeddedPanel></template>
      <template #truncate><EmbeddedPanel><Truncate /></EmbeddedPanel></template>
    </ToolTabs>
  </ToolLayout>
</template>
