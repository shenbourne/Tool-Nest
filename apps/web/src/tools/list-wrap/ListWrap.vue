<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const prefix = ref('"');
const suffix = ref('"');
const output = computed(() => input.value.split('\n').filter(Boolean).map(l => prefix.value + l + suffix.value).join('\n'));
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" placeholder="List items..." />
      <NSpace><NInput v-model:value="prefix" placeholder="Prefix" style="width:120px" /><NInput v-model:value="suffix" placeholder="Suffix" style="width:120px" /></NSpace>
      <NInput :value="output" type="textarea" :rows="6" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
