<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

// --- Base64 → File ---
const base64Input = ref('');
const fileName = ref('output');
const fileExt = ref('png');
const previewUrl = ref('');
const downloadError = ref('');

const dataUrl = computed(() => {
  const raw = base64Input.value.trim();
  if (!raw) return '';
  if (raw.startsWith('data:')) return raw;
  return `data:image/${fileExt.value || 'png'};base64,${raw}`;
});

const isValidBase64 = computed(() => {
  const raw = base64Input.value.trim();
  if (!raw) return false;
  if (raw.startsWith('data:')) return /^data:[\w/+.-]+;base64,/.test(raw);
  // Charset alone is not enough — the length must be a multiple of 4 with
  // padding only at the end, otherwise the decode is garbage.
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) return false;
  return raw.length % 4 === 0;
});

function previewImage() {
  if (isValidBase64.value) {
    previewUrl.value = dataUrl.value;
    downloadError.value = '';
  } else {
    downloadError.value = t('tools.base64FileConverter.invalidBase64');
    previewUrl.value = '';
  }
}

function downloadFile() {
  if (!isValidBase64.value) {
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

// --- File → Base64 ---
const fileBase64Output = ref('');

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
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

function copyBase64() {
  if (fileBase64Output.value) copyToClipboard(fileBase64Output.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.base64FileConverter.base64ToFile')">
        <NSpace vertical :size="8">
          <NInput v-model:value="base64Input" type="textarea" :rows="6" :placeholder="t('tools.base64FileConverter.inputPlaceholder')" />
          <NSpace :size="8" align="center">
            <span>{{ t('tools.base64FileConverter.filenameLabel') }}</span>
            <NInput v-model:value="fileName" style="width: 140px;" />
            <span>.{{ fileExt }}</span>
            <NInput v-model:value="fileExt" style="width: 80px;" placeholder="ext" />
          </NSpace>
          <NSpace>
            <NButton :disabled="!isValidBase64" @click="previewImage">{{ t('common.preview') }}</NButton>
            <NButton :disabled="!isValidBase64" @click="downloadFile">{{ t('tool.download') }}</NButton>
          </NSpace>
          <div v-if="downloadError" style="color: var(--color-error);">{{ downloadError }}</div>
          <div v-if="previewUrl" style="margin-top: 8px;">
            <img :src="previewUrl" :alt="t('common.preview')" style="max-width: 100%; max-height: 300px; border: 1px solid var(--color-hairline);" />
          </div>
        </NSpace>
      </NCard>

      <NCard :title="t('tools.base64FileConverter.fileToBase64')">
        <NSpace vertical :size="8">
          <input type="file" @change="handleFileChange" />
          <NInput :value="fileBase64Output" type="textarea" :rows="6" readonly :placeholder="t('tools.base64FileConverter.outputPlaceholder')" />
          <NButton :disabled="!fileBase64Output" @click="copyBase64">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
