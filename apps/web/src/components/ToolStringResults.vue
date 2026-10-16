<script setup lang="ts">
import { NInput } from 'naive-ui';
import { useCopy } from '@/composables/useCopy';

defineProps<{ results: { label: string; value: string }[]; idPrefix: string }>();
const { copyToClipboard } = useCopy();
</script>

<template>
  <div class="string-results">
    <div v-for="(result, index) in results" :key="result.label" class="string-results__row">
      <label :for="`${idPrefix}-${index}`">{{ result.label }}</label>
      <NInput :value="result.value" readonly
        :input-props="{ id: `${idPrefix}-${index}` }"
        @click="copyToClipboard(result.value)"
        @keydown.enter.prevent="copyToClipboard(result.value)" />
    </div>
  </div>
</template>

<style scoped>
.string-results { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.string-results__row { display: flex; align-items: center; gap: 12px; min-width: 0; }
.string-results__row label { width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0; }
.string-results__row :deep(.n-input) { flex: 1; min-width: 0; }
@media (max-width: 640px) {
  .string-results__row { flex-direction: column; align-items: stretch; gap: 4px; }
  .string-results__row label { width: auto; }
}
</style>
