<script setup lang="ts">
import { computed } from 'vue';
import { NCard, NInputNumber, NSlider } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import { useTemperature } from './temperature-model';

defineOptions({ name: 'TemperatureConverter' });
const { t } = useI18n();
const { celsius, fahrenheit, kelvin } = useTemperature();
const maxCelsius = computed(() => Math.max(100, Math.ceil(celsius.value / 100) * 100));
const fields = computed(() => [
  { key: 'celsius', value: celsius, min: -273.15, max: maxCelsius.value },
  { key: 'fahrenheit', value: fahrenheit, min: -459.67, max: maxCelsius.value * 9 / 5 + 32 },
  { key: 'kelvin', value: kelvin, min: 0, max: maxCelsius.value + 273.15 },
]);
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard>
      <div class="temperature-fields">
        <div v-for="(field, index) in fields" :key="field.key" class="temperature-row">
          <label :for="`temperatureField${index}`">{{ t(`tools.temperature.${field.key}`) }}</label>
          <NInputNumber v-model:value="field.value.value" :min="field.min" :step="0.01" :update-value-on-input="true" :input-props="{ id: `temperatureField${index}` }" />
          <NSlider v-model:value="field.value.value" :min="field.min" :max="field.max" :step="0.01" :aria-label="t(`tools.temperature.${field.key}`)" />
        </div>
      </div>
    </NCard>
  </ToolLayout>
</template>
<style scoped>
.temperature-fields { display: flex; flex-direction: column; gap: 24px; }
.temperature-row { display: grid; grid-template-columns: 140px 180px minmax(0, 1fr); align-items: center; gap: 16px; }
@media (max-width: 640px) {
  .temperature-row { grid-template-columns: minmax(0, 1fr); gap: 12px; }
}
</style>

