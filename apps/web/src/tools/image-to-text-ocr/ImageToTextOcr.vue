<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert, NSelect, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import Tesseract from 'tesseract.js';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const tool = useCurrentTool();

const selectedFile = ref<File | null>(null);
const imagePreview = ref<string>('');
const extractedText = ref('');
const loading = ref(false);
const progress = ref(0);
const error = ref('');

const languageOptions = [
  { label: 'English', value: 'eng' },
  { label: '简体中文', value: 'chi_sim' },
  { label: '繁體中文', value: 'chi_tra' },
  { label: '日本語', value: 'jpn' },
  { label: '한국어', value: 'kor' },
  { label: 'Deutsch', value: 'deu' },
  { label: 'Français', value: 'fra' },
  { label: 'Español', value: 'spa' },
  { label: 'Italiano', value: 'ita' },
  { label: 'Português', value: 'por' },
  { label: 'Русский', value: 'rus' },
  { label: 'العربية', value: 'ara' },
];
const selectedLang = ref('eng');

function onFileChange(files: File[]) {
  const selected = files[0] ?? null;
  selectedFile.value = selected;
  extractedText.value = '';
  error.value = '';
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
  imagePreview.value = selected ? URL.createObjectURL(selected) : '';
}

async function extractText() {
  if (!selectedFile.value) return;
  loading.value = true;
  progress.value = 0;
  error.value = '';
  extractedText.value = '';

  try {
    const result = await Tesseract.recognize(selectedFile.value, selectedLang.value, {
      logger: (m: { status: string; progress: number }) => {
        if (m.status === 'recognizing text') {
          progress.value = Math.round(m.progress * 100);
        }
      },
    });
    extractedText.value = result.data.text;
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}

onUnmounted(() => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
});
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept="image/*" @change="onFileChange" />
        </template>
        <template #output-files>
          <ToolTextPanel input-text="" :output-text="extractedText" hide-input export-name="ocr-result.txt" wrap-actions>
            <template #output>
          <NInput
            v-if="extractedText"
            type="textarea"
            :value="extractedText"
            readonly
            :autosize="{ minRows: 6, maxRows: 20 }"
           :input-props="{ id: 'imageToTextOcrField0' }"/>
            </template>
          </ToolTextPanel>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NSelect v-model:value="selectedLang" :options="languageOptions" style="width: 200px" />
            <NButton type="primary" :loading="loading" :disabled="!selectedFile" @click="extractText" block>
              {{ t('tools.imageToTextOcr.extractText') }}
            </NButton>
            <NProgress v-if="loading" type="line" :percentage="progress" />
            <NAlert v-if="error" type="error" :title="t('common.error')">
              {{ error }}
            </NAlert>
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
