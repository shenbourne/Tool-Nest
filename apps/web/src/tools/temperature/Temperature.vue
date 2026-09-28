<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NInputNumber, NSpace, NFormItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const celsius = ref(0);
const fahrenheit = computed(() => (celsius.value * 9/5) + 32);
const kelvin = computed(() => celsius.value + 273.15);
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="16">
      <NFormItem :label="t('tools.temperature.celsius')" label-placement="left"><NInputNumber v-model:value="celsius"  :input-props="{ id: 'temperatureField0' }"/></NFormItem>
      <NFormItem :label="t('tools.temperature.fahrenheit')" label-placement="left"><NInput :value="String(fahrenheit.toFixed(2))" readonly  :input-props="{ id: 'temperatureField1' }"/></NFormItem>
      <NFormItem :label="t('tools.temperature.kelvin')" label-placement="left"><NInput :value="String(kelvin.toFixed(2))" readonly  :input-props="{ id: 'temperatureField2' }"/></NFormItem>
    </NSpace></NCard>
  </ToolLayout>
</template>
