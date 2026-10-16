<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInputNumber, NSpace, NProgress, NStatistic, NDivider } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import DateTimePicker from '@/components/DateTimePicker.vue';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { calculateEta, formatDuration, formatEndTime } from './eta-calculator.service';

const { t } = useI18n();
const tool = useCurrentTool();

const totalTasks = ref(500);
const completedTasks = ref(186);
const startTime = ref(Date.now() - 15 * 60 * 1000); // 15 minutes ago

const result = computed(() =>
  calculateEta({
    totalTasks: totalTasks.value,
    completedTasks: completedTasks.value,
    startTime: startTime.value,
  })
);
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.etaCalculator.taskParameters')">
        <NSpace vertical :size="12">
          <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500;" :for="'etaCalculatorField0'">{{ t('tools.etaCalculator.totalTasks') }}</label>
              <NInputNumber v-model:value="totalTasks" :min="1" style="width: 100%;"  :input-props="{ id: 'etaCalculatorField0' }"/>
            </div>
            <div style="flex: 1; min-width: 200px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500;" :for="'etaCalculatorField1'">{{ t('tools.etaCalculator.completedTasks') }}</label>
              <NInputNumber v-model:value="completedTasks" :min="0" :max="totalTasks" style="width: 100%;"  :input-props="{ id: 'etaCalculatorField1' }"/>
            </div>
          </div>
          <div>
            <span style="display: block; margin-bottom: 4px; font-weight: 500;">{{ t('tools.etaCalculator.startTime') }}</span>
            <DateTimePicker v-model:value="startTime" />
          </div>
        </NSpace>
      </NCard>

      <NCard v-if="result" :title="t('common.results')">
        <NSpace vertical :size="16">
          <NProgress
            type="line"
            :percentage="Math.min(result.progressPercent, 100)"
            :height="28"
            border-radius="6px"
            style="margin-bottom: 8px;"
          />

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
            <NStatistic :label="t('tools.etaCalculator.progress')" :value="result.progressPercent.toFixed(1)" suffix="%" />
            <NStatistic :label="t('tools.etaCalculator.remainingTasks')" :value="result.remainingTasks" />
            <NStatistic :label="t('tools.etaCalculator.elapsedTime')" :value="formatDuration(result.elapsedMs)" />
            <NStatistic :label="t('tools.etaCalculator.timeRemaining')" :value="formatDuration(result.remainingMs)" />
            <NStatistic :label="t('tools.etaCalculator.estimatedEnd')" :value="formatEndTime(result.estimatedEndTime)" />
          </div>
        </NSpace>
      </NCard>

      <NDivider />

      <NCard :title="t('tools.etaCalculator.example')">
        <div style="opacity: 0.8; line-height: 1.6;">
          {{ t('tools.etaCalculator.exampleText') }}
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
