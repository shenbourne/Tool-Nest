<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { NSpace, NButton, NInput, NInputNumber, NSelect, NColorPicker, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import FileCard from '@/components/FileCard.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
import { addPdfTextOverlay } from './pdf-text-overlay';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();
const file = ref<File | null>(null);
const text = ref('');
const position = ref<string>('center');
const fontSize = ref(24);
const color = ref('#000000');
const resultUrl = ref('');
const resultFile = ref<File | null>(null);
const processing = ref(false);
const error = ref('');

const positionOptions = computed(() => [
  { label: t('tools.pdfEditor.position.topLeft'), value: 'top-left' },
  { label: t('tools.pdfEditor.position.topCenter'), value: 'top-center' },
  { label: t('tools.pdfEditor.position.topRight'), value: 'top-right' },
  { label: t('tools.pdfEditor.position.center'), value: 'center' },
  { label: t('tools.pdfEditor.position.bottomLeft'), value: 'bottom-left' },
  { label: t('tools.pdfEditor.position.bottomCenter'), value: 'bottom-center' },
  { label: t('tools.pdfEditor.position.bottomRight'), value: 'bottom-right' },
]);

function onFile(files: File[]) { const f = files[0] ?? null; if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); file.value = f; resultUrl.value = ''; error.value = ''; }

// Any edit invalidates a previously generated PDF; keep the download in sync
// with the current inputs.
watch([text, position, fontSize, color], () => {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
  resultUrl.value = '';
  resultFile.value = null;
});

function download() {
  if (resultUrl.value) {
    const a = document.createElement('a');
    a.href = resultUrl.value;
    a.download = 'edited.pdf';
    a.click();
  }
}

async function copy() {
  if (!resultUrl.value) return;
  const res = await fetch(resultUrl.value);
  const blob = await res.blob();
  await copyFileToClipboard(blob);
}

async function apply() {
  if (!file.value || !text.value) return;
  processing.value = true;
  error.value = '';
  try {
    const buf = await file.value.arrayBuffer();
    const bytes = await addPdfTextOverlay(buf, { text: text.value, fontSize: fontSize.value, color: color.value, position: position.value });
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    resultUrl.value = URL.createObjectURL(blob);
    resultFile.value = new File([blob], 'edited.pdf', { type: 'application/pdf' });
  } catch (e: unknown) {
    error.value = (e instanceof Error ? e.message : '') || t('tools.pdfEditor.failed');
  }
  processing.value = false;
}
onUnmounted(() => { if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); });
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept=".pdf" @change="onFile" />
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" name="edited.pdf" :file="resultFile" file-type="application/pdf" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultUrl" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultUrl" @click="download">{{ t('tool.exportFile') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NInput v-model:value="text" :placeholder="t('tools.pdfEditor.textPlaceholder')" :input-props="{ id: 'pdfEditorField0' }" />
            <div class="pdf-editor__text-options">
              <NSelect v-model:value="position" :options="positionOptions" :placeholder="t('tools.pdfEditor.positionPlaceholder')" />
              <NInputNumber v-model:value="fontSize" :min="8" :max="120" :placeholder="t('tools.pdfEditor.fontSize')" :input-props="{ id: 'pdfEditorField1' }" />
              <NColorPicker v-model:value="color" />
            </div>
            <NButton type="primary" :loading="processing" @click="apply" :disabled="!file || !text" block>
              {{ t('common.apply') }}
            </NButton>
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>

<style scoped>
.pdf-editor__text-options {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 150px) 100px;
  align-items: center;
  gap: 12px;
}

.pdf-editor__text-options > * {
  min-width: 0;
  width: 100%;
}
</style>
