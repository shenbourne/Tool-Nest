<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import markdownit from 'markdown-it';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const md = markdownit({ html: true, linkify: true });

const inputMarkdown = ref('');
const outputHtml = computed(() => inputMarkdown.value ? md.render(inputMarkdown.value) : '');

function copyHtml() {
  if (outputHtml.value) copyToClipboard(outputHtml.value);
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
      <NCard :title="t('tools.markdownToHtml.markdownInput')">
        <NSpace vertical :size="8">
          <NInput v-model:value="inputMarkdown" type="textarea" :rows="10" :placeholder="t('tools.markdownToHtml.inputPlaceholder')" />
        </NSpace>
      </NCard>

      <NCard :title="t('tools.markdownToHtml.htmlOutput')">
        <NSpace vertical :size="8">
          <NInput :value="outputHtml" type="textarea" :rows="10" readonly :placeholder="t('tools.markdownToHtml.outputPlaceholder')" />
          <NSpace>
            <NButton :disabled="!outputHtml" @click="copyHtml">{{ t('tools.markdownToHtml.copyHtml') }}</NButton>
            <NButton :disabled="!outputHtml" @click="printHtml">{{ t('tools.markdownToHtml.print') }}</NButton>
          </NSpace>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
