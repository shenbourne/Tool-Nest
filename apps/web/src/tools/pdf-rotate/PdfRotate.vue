<script setup lang="ts">
import { ref } from 'vue';
import { NSpace, NButton, NInputNumber, NSelect, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import FileCard from '@/components/FileCard.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();
const file = ref<File | null>(null);
const angle = ref(90);
const resultUrl = ref('');
const resultFile = ref<File | null>(null);
const processing = ref(false);
const error = ref('');
function onFile(files: File[]) { const f = files[0] ?? null; file.value = f; resultUrl.value = ''; resultFile.value = null; error.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'rotated.pdf'; a.click(); } }
async function copy() {
  if (!resultUrl.value) return;
  const res = await fetch(resultUrl.value);
  const blob = await res.blob();
  await copyFileToClipboard(blob);
}
async function process() {
  if (!file.value) return;
  processing.value = true;
  error.value = '';
  try {
    const { PDFDocument, degrees } = await import('pdf-lib');
    const buf = await file.value.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    // Accumulate on the page's existing rotation (e.g. scanned documents),
    // otherwise rotating a 90° scan by 90° is a no-op the user cannot see.
    doc.getPages().forEach(p => p.setRotation(degrees((p.getRotation().angle + angle.value) % 360)));
    const bytes = await doc.save();
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    resultUrl.value = URL.createObjectURL(blob);
    resultFile.value = new File([blob], 'rotated.pdf', { type: 'application/pdf' });
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('common.processingFailed');
  } finally {
    processing.value = false;
  }
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept=".pdf" compact @change="onFile" />
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" name="rotated.pdf" :file="resultFile" file-type="application/pdf" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultUrl" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultUrl" @click="download">{{ t('tool.exportFile') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NSelect v-model:value="angle" :options="[{label:'90°',value:90},{label:'180°',value:180},{label:'270°',value:270}]" style="width:120px" />
            <NButton type="primary" :loading="processing" @click="process" :disabled="!file" block>
              {{ t('tools.pdfRotate.rotate') }}
            </NButton>
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>

<style scoped>
</style>
