<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const downloadSpeed = ref(0);
const latency = ref(0);
const testing = ref(false);
async function test() {
  testing.value = true; downloadSpeed.value = 0; latency.value = 0;
  // Latency test
  const latStart = Date.now();
  try { await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' }); latency.value = Date.now() - latStart; } catch {}
  // Download speed test
  try {
    const start = Date.now();
    const resp = await fetch('https://speed.cloudflare.com/__down?bytes=10000000', { cache: 'no-store' });
    const blob = await resp.blob();
    const elapsed = (Date.now() - start) / 1000;
    downloadSpeed.value = Math.round((blob.size * 8) / elapsed / 1000000);
  } catch {}
  testing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="16">
      <NButton type="primary" :loading="testing" @click="test">Start Speed Test</NButton>
      <NSpace v-if="downloadSpeed || latency">
        <NAlert type="info" :title="'Latency: ' + latency + ' ms'" />
        <NAlert type="success" :title="'Download: ' + downloadSpeed + ' Mbps'" />
      </NSpace>
    </NSpace></NCard>
  </ToolLayout>
</template>
