<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const count = ref(10);
const output = computed(() => input.value.split('\n').filter(Boolean).slice(0, count.value).join('\n'));
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" placeholder="List items..." />
      <NInputNumber v-model:value="count" :min="1" style="width:130px" />
      <NInput :value="output" type="textarea" :rows="6" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
