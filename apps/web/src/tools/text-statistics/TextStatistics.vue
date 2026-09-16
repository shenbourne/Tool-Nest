<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NStatistic } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const text = ref('');
const chars = computed(() => text.value.length);
const charsNoSpace = computed(() => text.value.replace(/\s/g, '').length);
const words = computed(() => text.value.trim() ? text.value.trim().split(/\s+/).length : 0);
const lines = computed(() => text.value ? text.value.split('\n').length : 0);
const sentences = computed(() => text.value.trim() ? (text.value.match(/[.!?]+/g) || []).length || (text.value.trim() ? 1 : 0) : 0);
const paragraphs = computed(() => text.value.trim() ? text.value.split(/\n\s*\n/).filter(p => p.trim()).length : 0);
const readingTime = computed(() => `${Math.ceil(words.value / 200)} min`);
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard><NInput v-model:value="text" type="textarea" :rows="8" placeholder="Paste or type text here..." /></NCard>
      <NCard><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px;">
        <NStatistic label="Characters" :value="chars" />
        <NStatistic label="Characters (no spaces)" :value="charsNoSpace" />
        <NStatistic label="Words" :value="words" />
        <NStatistic label="Lines" :value="lines" />
        <NStatistic label="Sentences" :value="sentences" />
        <NStatistic label="Paragraphs" :value="paragraphs" />
        <NStatistic label="Reading time" :value="readingTime" />
      </div></NCard>
    </NSpace>
  </ToolLayout>
</template>
