<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert, NSelect, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import Tesseract from 'tesseract.js';

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

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  selectedFile.value = file;
  extractedText.value = '';
  error.value = '';
  imagePreview.value = URL.createObjectURL(file);
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

function copyText() {
  if (extractedText.value) {
    navigator.clipboard.writeText(extractedText.value);
  }
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.imageToTextOcr.imageUpload')">
        <NSpace vertical :size="12">
          <input type="file" accept="image/*" @change="onFileChange" />
          <NSelect v-model:value="selectedLang" :options="languageOptions" style="width: 200px" />
          <img v-if="imagePreview" :src="imagePreview" style="max-width: 100%; max-height: 300px;" />
          <NButton type="primary" :loading="loading" :disabled="!selectedFile" @click="extractText">
            {{ t('tools.imageToTextOcr.extractText') }}
          </NButton>
          <NProgress v-if="loading" type="line" :percentage="progress" />
        </NSpace>
      </NCard>

      <NAlert v-if="error" type="error" :title="t('common.error')">
        {{ error }}
      </NAlert>

      <NCard v-if="extractedText" :title="t('tools.imageToTextOcr.extractedText')">
        <NSpace vertical :size="12">
          <NInput
            type="textarea"
            :value="extractedText"
            readonly
            :autosize="{ minRows: 6, maxRows: 20 }"
          />
          <NButton @click="copyText">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
