<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import markdownit from 'markdown-it';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const tool = useCurrentTool();

const md = markdownit({ html: true, linkify: true });

const inputMarkdown = ref('');
const outputHtml = computed(() => inputMarkdown.value ? md.render(inputMarkdown.value) : '');

function copyHtml() {
  if (outputHtml.value) navigator.clipboard.writeText(outputHtml.value);
}

function printHtml() {
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(outputHtml.value);
    win.document.close();
    win.print();
  }
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Markdown Input">
        <NSpace vertical :size="8">
          <NInput v-model:value="inputMarkdown" type="textarea" :rows="10" placeholder="Enter Markdown here..." />
        </NSpace>
      </NCard>

      <NCard title="HTML Output">
        <NSpace vertical :size="8">
          <NInput :value="outputHtml" type="textarea" :rows="10" readonly placeholder="HTML output..." />
          <NSpace>
            <NButton :disabled="!outputHtml" @click="copyHtml">Copy HTML</NButton>
            <NButton :disabled="!outputHtml" @click="printHtml">Print</NButton>
          </NSpace>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
