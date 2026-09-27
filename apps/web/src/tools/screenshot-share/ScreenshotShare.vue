<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import html2canvas from 'html2canvas';
import { tool } from './index';
import { useI18n } from 'vue-i18n';
import { useCopy } from '@/composables/useCopy';

const { t } = useI18n();
const { copyImageToClipboard } = useCopy();

const selector = ref('body');
const previewUrl = ref('');
const capturing = ref(false);
const errorMsg = ref('');

async function capture() {
  errorMsg.value = '';
  previewUrl.value = '';
  capturing.value = true;
  try {
    const el = document.querySelector(selector.value);
    if (!el) {
      errorMsg.value = t('tools.screenshotShare.noElementFound', { selector: selector.value });
      return;
    }
    const canvas = await html2canvas(el as HTMLElement);
    previewUrl.value = canvas.toDataURL('image/png');
  }
  catch (e: any) {
    errorMsg.value = e?.message || t('tools.screenshotShare.captureFailed');
  }
  finally {
    capturing.value = false;
  }
}

async function downloadPng() {
  if (!previewUrl.value) return;
  const a = document.createElement('a');
  a.href = previewUrl.value;
  a.download = 'screenshot.png';
  a.click();
}

async function copyScreenshot() {
  if (!previewUrl.value) return;
  try {
    const res = await fetch(previewUrl.value);
    const blob = await res.blob();
    await copyImageToClipboard(blob);
  }
  catch (e: any) {
    errorMsg.value = e?.message || t('tools.screenshotShare.copyFailed');
  }
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="12">
      <NCard :title="t('tools.screenshotShare.cssSelector')">
        <NSpace vertical :size="8">
          <NInput v-model:value="selector" :placeholder="t('tools.screenshotShare.selectorPlaceholder')" />
          <NButton type="primary" :loading="capturing" @click="capture">{{ t('tools.screenshotShare.capture') }}</NButton>
        </NSpace>
      </NCard>
      <NAlert v-if="errorMsg" type="error" :title="errorMsg" />
      <NCard v-if="previewUrl" :title="t('common.preview')">
        <NSpace vertical :size="8">
          <img :src="previewUrl" style="max-width:100%;border:1px solid var(--color-hairline);border-radius:4px;" />
          <NSpace>
            <NButton type="primary" @click="downloadPng">{{ t('tools.screenshotShare.downloadPng') }}</NButton>
            <NButton @click="copyScreenshot">{{ t('tools.screenshotShare.copyToClipboard') }}</NButton>
          </NSpace>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
