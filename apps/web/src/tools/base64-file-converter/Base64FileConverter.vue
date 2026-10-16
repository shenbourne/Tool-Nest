<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NInput, NSpace, NButton, NDivider } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import FileCard from '@/components/FileCard.vue';
import { useCopy } from '@/composables/useCopy';
import { mimeTypes } from '@/tools/mime-types/mime-data';

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();

// --- Base64 → File ---
const base64Input = ref('');
const fileName = ref('output');
const fileExt = ref('png');
const downloadError = ref('');

watch(base64Input, value => {
  const mime = /^data:([\w/+.-]+)(?:;[^,]*)?;base64,/i.exec(value.trim())?.[1]?.toLowerCase();
  if (!mime) return;
  const extension = mimeTypes.find(entry => entry.mimeType === mime)?.extensions[0];
  if (extension) fileExt.value = extension;
});

const dataUrl = computed(() => {
  const raw = base64Input.value.trim();
  if (!raw) return '';
  if (/^data:/i.test(raw)) return raw;
  return `data:image/${fileExt.value || 'png'};base64,${raw}`;
});

const isValidBase64 = computed(() => {
  const raw = base64Input.value.trim();
  if (!raw) return false;
  if (/^data:/i.test(raw)) return /^data:[\w/+.-]+(?:;[^,]*)?;base64,/i.test(raw);
  // Charset alone is not enough — the length must be a multiple of 4 with
  // padding only at the end, otherwise the decode is garbage.
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) return false;
  return raw.length % 4 === 0;
});

const resultFile = computed(() => {
  if (!isValidBase64.value) return null;
  try {
    const comma = dataUrl.value.indexOf(',');
    const mime = dataUrl.value.slice(5, dataUrl.value.indexOf(';'));
    const decoded = atob(dataUrl.value.slice(comma + 1));
    const bytes = Uint8Array.from(decoded, char => char.charCodeAt(0));
    return new File([bytes], `${fileName.value}.${fileExt.value}`, { type: mime });
  } catch {
    return null;
  }
});

const resultThumbnail = computed(() => resultFile.value?.type.startsWith('image/') ? dataUrl.value : '');

function downloadFile() {
  if (!resultFile.value) {
    downloadError.value = t('tools.base64FileConverter.invalidBase64');
    return;
  }
  downloadError.value = '';
  const url = dataUrl.value;
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.value}.${fileExt.value}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function copyFile() {
  if (!resultFile.value) return;
  await copyFileToClipboard(resultFile.value);
}

// --- File → Base64 ---
const fileBase64Output = ref('');
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

function handleFileChange(files: File[]) {
  const file = files[0];
  if (!file) {
    fileBase64Output.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    fileBase64Output.value = reader.result as string;
  };
  reader.readAsDataURL(file);
}

</script>

<template>
  <NSpace vertical :size="12" class="base64-file-converter">
    <ToolTextPanel input-text="" :output-text="fileBase64Output" :input-title="t('tools.base64FileConverter.fileToBase64')" :output-title="t('common.output')" export-name="base64.txt">
      <template #input>
        <ToolFileUpload ref="fileUpload" @change="handleFileChange" />
      </template>
      <template #input-actions>
        <NButton @click="fileUpload?.triggerSelect()">{{ t('tool.importFile') }}</NButton>
        <NButton @click="fileUpload?.triggerPaste()">{{ t('tool.pasteFile') }}</NButton>
      </template>
      <template #output>
        <NInput :value="fileBase64Output" type="textarea" :rows="3" readonly :placeholder="t('tools.base64FileConverter.outputPlaceholder')" :input-props="{ id: 'base64FileConverterField3' }" />
      </template>
    </ToolTextPanel>

    <NDivider style="margin: 0 0 12px 0;" />

    <ToolTextPanel v-model:input-text="base64Input" output-text="" :input-title="t('tools.base64FileConverter.base64ToFile')" :output-title="t('common.output')">
      <template #input>
        <NInput v-model:value="base64Input" type="textarea" :rows="3" :placeholder="t('tools.base64FileConverter.inputPlaceholder')" :input-props="{ id: 'base64FileConverterField0' }" />
      </template>
      <template #output>
        <div class="base64-file-converter__file-output">
          <FileCard v-if="resultFile" :name="resultFile.name" :file="resultFile" :file-type="resultFile.type" :thumbnail-url="resultThumbnail" />
        </div>
      </template>
      <template #output-actions>
        <NButton :disabled="!resultFile" @click="copyFile">{{ t('tool.copyFile') }}</NButton>
        <NButton :disabled="!resultFile" @click="downloadFile">{{ t('tool.download') }}</NButton>
      </template>
      <template #params>
        <NSpace :size="8" align="center">
          <span>{{ t('tools.base64FileConverter.filenameLabel') }}</span>
          <NInput v-model:value="fileName" style="width: 140px;" :input-props="{ id: 'base64FileConverterField1' }" />
          <span>.</span>
          <NInput v-model:value="fileExt" style="width: 80px;" placeholder="ext" :input-props="{ id: 'base64FileConverterField2' }" />
        </NSpace>
        <div v-if="downloadError" style="color: var(--color-error);">{{ downloadError }}</div>
      </template>
    </ToolTextPanel>
  </NSpace>
</template>

<style scoped>
.base64-file-converter__file-output {
  display: flex;
  min-height: 160px;
}

@media (max-width: 640px) {
  .base64-file-converter :deep(.tool-text-panel__columns) {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
