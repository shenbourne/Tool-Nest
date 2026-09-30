<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();
const files = ref<File[]>([]);
const resultUrl = ref('');
const processing = ref(false);
const error = ref('');
function onFiles(list: File[]) { if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); resultUrl.value = ''; files.value = list; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'merged.pdf'; a.click(); } }
async function copy() {
  if (!resultUrl.value) return;
  const res = await fetch(resultUrl.value);
  const blob = await res.blob();
  await copyFileToClipboard(blob);
}
async function process() {
  if (files.value.length < 2) { error.value = t('tools.pdfMerge.selectAtLeastTwo'); return; }
  processing.value = true; error.value = '';
  try {
    const { PDFDocument } = await import('pdf-lib');
    const merged = await PDFDocument.create();
    for (const f of files.value) {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    const bytes = await merged.save();
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
    resultUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  } catch (e: any) { error.value = e.message; }
  processing.value = false;
}
onUnmounted(() => {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept=".pdf" multiple compact @change="onFiles" />
          <NAlert v-if="files.length" type="info" :title="t('tools.pdfMerge.filesSelected', { count: files.length })" style="margin-top: 8px;" />
        </template>
        <template #output-files>
          <div v-if="resultUrl" class="tool-file-panel__output-preview">
            <NCard size="small" :title="t('tools.pdfMerge.downloadMerged')">
              <p style="font-size: 13px; color: var(--color-text-2);">merged.pdf</p>
            </NCard>
          </div>
        </template>
        <template #actions-right>
          <NButton :disabled="!resultUrl" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultUrl" @click="download">{{ t('tool.exportFile') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NButton type="primary" :loading="processing" @click="process" :disabled="files.length < 2" block>
              {{ t('tools.pdfMerge.merge') }}
            </NButton>
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>

<style scoped>
.tool-file-panel__output-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
