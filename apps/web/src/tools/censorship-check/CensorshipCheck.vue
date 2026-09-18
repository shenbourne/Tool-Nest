<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const urls = ref('');
const loading = ref(false);
const error = ref('');
const result = ref<unknown>(null);

async function run() {
  loading.value = true;
  error.value = '';
  result.value = null;
  const urlList = urls.value.split('\n').map(u => u.trim()).filter(Boolean);
  if (!urlList.length) {
    error.value = 'Please enter at least one URL';
    loading.value = false;
    return;
  }
  try {
    const res = await fetch('/api/network/censorship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: urlList }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? 'Request failed');
    result.value = json.data;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Request failed';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="12">
        <NInput
          v-model:value="urls"
          type="textarea"
          placeholder="Enter URLs (one per line)..."
          :rows="4"
        />
        <NButton type="primary" :loading="loading" :disabled="!urls.trim()" @click="run">Check</NButton>
        <NAlert v-if="error" type="error" :title="error" />
        <pre v-if="result">{{ JSON.stringify(result, null, 2) }}</pre>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
