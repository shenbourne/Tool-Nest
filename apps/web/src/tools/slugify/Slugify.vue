<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('Hello World! This is a Test.');
const slug = computed(() => input.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" placeholder="Enter text to slugify..." />
      <NInput :value="slug" readonly placeholder="Slug..." />
    </NSpace></NCard>
  </ToolLayout>
</template>
