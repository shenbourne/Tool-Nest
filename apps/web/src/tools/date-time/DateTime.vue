<script setup lang="ts">
import { computed, ref } from 'vue';
import { NAlert, NInput, NSelect, NTabPane, NTabs } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import EmbeddedPanel from './EmbeddedPanel.vue';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import Weekday from '../date-weekday-calculator/DateWeekdayCalculator.vue';
import Interval from '../time-between-dates/TimeBetweenDates.vue';
import Discord from '../discord-timestamp/DiscordTimestamp.vue';
import Truncate from '../truncate-clock-time/TruncateClockTime.vue';
import { durationSeconds, durationClock, type DurationUnit } from './duration';
import { tool } from './index';
const { t } = useI18n();
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
</script>
<template>
  <ToolLayout :tool="tool">
    <NTabs type="line" animated>
      <NTabPane name="duration" :tab="t('tools.dateTime.duration')" display-directive="show:lazy">
        <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('tools.dateTime.amount')" :output-title="t('common.output')" :file-actions="false">
          <template #params>
            <label class="unit-field"><span>{{ t('tools.dateTime.unit') }}</span><NSelect v-model:value="unit" :options="options" /></label>
            <NAlert v-if="input.trim() && seconds === null" type="error">{{ t('tools.dateTime.invalid') }}</NAlert>
          </template>
          <template #input><NInput v-model:value="input" :placeholder="unit === 'clock' ? 'HH:MM:SS' : '0'" /></template>
          <template #output><NInput :value="output" type="textarea" :rows="6" readonly /></template>
        </ToolTextPanel>
      </NTabPane>
      <NTabPane name="weekday" :tab="t('tools.dateWeekdayCalculator.name')" display-directive="show:lazy"><EmbeddedPanel><Weekday /></EmbeddedPanel></NTabPane>
      <NTabPane name="interval" :tab="t('tools.timeBetweenDates.name')" display-directive="show:lazy"><EmbeddedPanel><Interval /></EmbeddedPanel></NTabPane>
      <NTabPane name="discord" :tab="t('tools.discordTimestamp.name')" display-directive="show:lazy"><EmbeddedPanel><Discord /></EmbeddedPanel></NTabPane>
      <NTabPane name="truncate" :tab="t('tools.truncateClockTime.name')" display-directive="show:lazy"><EmbeddedPanel><Truncate /></EmbeddedPanel></NTabPane>
    </NTabs>
  </ToolLayout>
</template>
<style scoped>
.unit-field { display: grid; gap: 6px; width: min(100%, 280px); }
</style>
