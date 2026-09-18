<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import html2canvas from 'html2canvas';
import { tool } from './index';

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
      errorMsg.value = `No element found for selector: ${selector.value}`;
      return;
    }
    const canvas = await html2canvas(el as HTMLElement);
    previewUrl.value = canvas.toDataURL('image/png');
  }
  catch (e: any) {
    errorMsg.value = e?.message || 'Failed to capture screenshot';
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

async function copyToClipboard() {
  if (!previewUrl.value) return;
  try {
    const res = await fetch(previewUrl.value);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  }
  catch (e: any) {
    errorMsg.value = e?.message || 'Failed to copy to clipboard';
  }
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="12">
      <NCard title="CSS Selector">
        <NSpace vertical :size="8">
          <NInput v-model:value="selector" placeholder="Enter CSS selector (default: body)" />
          <NButton type="primary" :loading="capturing" @click="capture">Capture</NButton>
        </NSpace>
      </NCard>
      <NAlert v-if="errorMsg" type="error" :title="errorMsg" />
      <NCard v-if="previewUrl" title="Preview">
        <NSpace vertical :size="8">
          <img :src="previewUrl" style="max-width:100%;border:1px solid #e0e0e0;border-radius:4px;" />
          <NSpace>
            <NButton type="primary" @click="downloadPng">Download PNG</NButton>
            <NButton @click="copyToClipboard">Copy to Clipboard</NButton>
          </NSpace>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
