<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSelect, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const inputBase = ref(10);
const outputBase = ref(16);
const inputValue = ref('255');

const bases = [
  { label: 'Binary (2)', value: 2 }, { label: 'Octal (8)', value: 8 },
  { label: 'Decimal (10)', value: 10 }, { label: 'Hexadecimal (16)', value: 16 },
  { label: 'Base32', value: 32 }, { label: 'Base36', value: 36 },
];

const output = computed(() => {
  try {
    const decimal = parseInt(inputValue.value, inputBase.value);
    if (isNaN(decimal)) return 'Invalid input';
    return decimal.toString(outputBase.value).toUpperCase();
  } catch { return 'Error'; }
});
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="12">
        <div style="display: flex; gap: 12px;">
          <NSelect v-model:value="inputBase" :options="bases" label="Input base" style="flex:1;" />
          <NSelect v-model:value="outputBase" :options="bases" label="Output base" style="flex:1;" />
        </div>
        <NInput v-model:value="inputValue" placeholder="Enter number..." />
        <NInput :value="output" readonly placeholder="Result..." />
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
