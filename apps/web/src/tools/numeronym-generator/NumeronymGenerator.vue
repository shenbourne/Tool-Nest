<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { generateNumeronym } from './numeronym-generator.service';

const { t } = useI18n();
const tool = useCurrentTool();

const word = ref('');
const numeronym = computed(() => generateNumeronym(word.value));

function copyOutput() {
  if (numeronym.value) navigator.clipboard.writeText(numeronym.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16" align="center">
      <NInput v-model:value="word" placeholder="Enter a word, e.g. 'internationalization'" size="large" clearable style="max-width: 500px;" />
      <div style="font-size: 24px;">↓</div>
      <NCard style="max-width: 500px; width: 100%; text-align: center;">
        <span style="font-size: 28px; font-weight: bold;">{{ numeronym }}</span>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
