<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const downloadSpeed = ref(0);
const latency = ref(0);
const testing = ref(false);
const failed = ref(false);
async function test() {
  testing.value = true; downloadSpeed.value = 0; latency.value = 0; failed.value = false;
  // Latency test
  const latStart = Date.now();
  try { await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' }); latency.value = Date.now() - latStart; } catch { failed.value = true; }
  // Download speed test
  try {
    const start = Date.now();
    const resp = await fetch('https://speed.cloudflare.com/__down?bytes=10000000', { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    const elapsed = (Date.now() - start) / 1000;
    downloadSpeed.value = Math.round((blob.size * 8) / elapsed / 1000000);
  } catch { failed.value = true; }
  testing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="16">
      <NButton type="primary" :loading="testing" @click="test">{{ t('tools.speedTest.start') }}</NButton>
      <NAlert v-if="failed && !testing" type="error" :title="t('tools.speedTest.testFailed')" />
      <NSpace v-if="!failed && (downloadSpeed || latency)">
        <NAlert type="info" :title="t('tools.speedTest.latencyValue', { n: latency })" />
        <NAlert type="success" :title="t('tools.speedTest.downloadValue', { n: downloadSpeed })" />
      </NSpace>
    </NSpace></NCard>
  </ToolLayout>
</template>
