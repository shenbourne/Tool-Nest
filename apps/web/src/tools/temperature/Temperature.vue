<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NInputNumber, NSpace, NFormItem } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const celsius = ref(0);
const fahrenheit = computed(() => (celsius.value * 9/5) + 32);
const kelvin = computed(() => celsius.value + 273.15);
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="16">
      <NFormItem label="Celsius (°C)" label-placement="left"><NInputNumber v-model:value="celsius" /></NFormItem>
      <NFormItem label="Fahrenheit (°F)" label-placement="left"><NInput :value="String(fahrenheit.toFixed(2))" readonly /></NFormItem>
      <NFormItem label="Kelvin (K)" label-placement="left"><NInput :value="String(kelvin.toFixed(2))" readonly /></NFormItem>
    </NSpace></NCard>
  </ToolLayout>
</template>
