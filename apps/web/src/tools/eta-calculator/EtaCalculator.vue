<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInputNumber, NDatePicker, NSpace, NProgress, NStatistic, NDivider } from 'naive-ui';
import { useI18n } from 'vue-i18n';
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
      <NCard title="Task Parameters">
        <NSpace vertical :size="12">
          <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500;">Total Tasks</label>
              <NInputNumber v-model:value="totalTasks" :min="1" style="width: 100%;" />
            </div>
            <div style="flex: 1; min-width: 200px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500;">Completed Tasks</label>
              <NInputNumber v-model:value="completedTasks" :min="0" :max="totalTasks" style="width: 100%;" />
            </div>
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Start Time</label>
            <NDatePicker v-model:value="startTime" type="datetime" style="width: 100%;" />
          </div>
        </NSpace>
      </NCard>

      <NCard v-if="result" title="Results">
        <NSpace vertical :size="16">
          <NProgress
            type="line"
            :percentage="Math.min(result.progressPercent, 100)"
            :height="28"
            border-radius="6px"
            style="margin-bottom: 8px;"
          />

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
            <NStatistic label="Progress" :value="result.progressPercent.toFixed(1)" suffix="%" />
            <NStatistic label="Remaining Tasks" :value="result.remainingTasks" />
            <NStatistic label="Elapsed Time" :value="formatDuration(result.elapsedMs)" />
            <NStatistic label="Time Remaining" :value="formatDuration(result.remainingMs)" />
            <NStatistic label="Estimated End" :value="formatEndTime(result.estimatedEndTime)" />
          </div>
        </NSpace>
      </NCard>

      <NDivider />

      <NCard title="Example">
        <div style="opacity: 0.8; line-height: 1.6;">
          If you wash 5 plates in 3 minutes and you have 500 plates to wash, it will take you approximately 5 hours to wash them all.
          Enter the total task count, how many are completed, and when you started to see the estimated completion time.
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
