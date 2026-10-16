<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import markdownit from 'markdown-it';
import { printMarkdown } from './print-document';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const tool = useCurrentTool();

const md = markdownit({ html: true, linkify: true });

const inputMarkdown = ref('');
const outputHtml = computed(() => inputMarkdown.value ? md.render(inputMarkdown.value) : '');

function printHtml() {
  printMarkdown(inputMarkdown.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="inputMarkdown" :output-text="outputHtml" :input-title="t('tools.markdownToHtml.markdownInput')" :output-title="t('tools.markdownToHtml.htmlOutput')" export-name="output.html">
      <template #input>
        <NInput v-model:value="inputMarkdown" type="textarea" :rows="10" :placeholder="t('tools.markdownToHtml.inputPlaceholder')"  :input-props="{ id: 'markdownToHtmlField0' }"/>
      </template>
      <template #output>
        <NInput :value="outputHtml" type="textarea" :rows="10" readonly :placeholder="t('tools.markdownToHtml.outputPlaceholder')"  :input-props="{ id: 'markdownToHtmlField1' }"/>
      </template>
      <template #params>
        <NSpace>
          <NButton :disabled="!outputHtml" @click="printHtml">{{ t('tools.markdownToHtml.print') }}</NButton>
        </NSpace>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
