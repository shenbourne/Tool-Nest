<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert, NDataTable } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const results = ref<{name: string; status: string; time: string}[]>([]);
const testing = ref(false);
const TARGETS = [
  { name: 'Google DNS', url: 'https://dns.google' },
  { name: 'Cloudflare', url: 'https://1.1.1.1' },
  { name: 'GitHub', url: 'https://api.github.com' },
  { name: 'W3C', url: 'https://www.w3.org' },
];
async function test() {
  testing.value = true; results.value = [];
  for (const t of TARGETS) {
    const start = Date.now();
    try {
      await fetch(t.url, { mode: 'no-cors', cache: 'no-store' });
      results.value.push({ name: t.name, status: '✅ Online', time: (Date.now()-start) + 'ms' });
    } catch { results.value.push({ name: t.name, status: '❌ Offline', time: '-' }); }
  }
  testing.value = false;
}
const cols = [{ title: 'Target', key: 'name' }, { title: 'Status', key: 'status' }, { title: 'Latency', key: 'time' }];
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NButton type="primary" :loading="testing" @click="test">Test Connectivity</NButton>
      <NDataTable v-if="results.length" :columns="cols" :data="results" :bordered="false" size="small" />
    </NSpace></NCard>
  </ToolLayout>
</template>
