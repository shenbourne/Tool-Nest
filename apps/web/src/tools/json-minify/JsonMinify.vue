<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { minifyJson } from './json-minify.service';

const { t } = useI18n();
const tool = useCurrentTool();

const inputJson = ref('');
const minified = computed(() => minifyJson(inputJson.value));

function copyOutput() {
  if (minified.value.result) navigator.clipboard.writeText(minified.value.result);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NAlert v-if="minified.error" type="error" title="Invalid JSON">
        {{ minified.error }}
      </NAlert>

      <NCard title="Input JSON">
        <NSpace vertical :size="8">
          <NInput v-model:value="inputJson" type="textarea" :rows="8" placeholder="Paste JSON to minify..." />
        </NSpace>
      </NCard>

      <NCard title="Minified Output">
        <NSpace vertical :size="8">
          <NInput :value="minified.result" type="textarea" :rows="8" readonly placeholder="Minified JSON output..." />
          <NButton :disabled="!minified.result" @click="copyOutput">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
