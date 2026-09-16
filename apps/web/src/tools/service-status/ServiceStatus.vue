<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NDataTable } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const url = ref('https://example.com');
const results = ref<{check: string; status: string; time: string}[]>([]);
const loading = ref(false);
async function check() {
  loading.value = true; results.value = [];
  const start = Date.now();
  try {
    await fetch(url.value, { mode: 'no-cors', cache: 'no-store' });
    const elapsed = Date.now() - start;
    results.value = [
      { check: 'HTTP Request', status: '✅ Reachable', time: elapsed + 'ms' },
      { check: 'Response Time', status: elapsed < 500 ? '✅ Fast' : elapsed < 2000 ? '⚠️ Moderate' : '❌ Slow', time: elapsed + 'ms' },
      { check: 'SSL/TLS', status: url.value.startsWith('https') ? '✅ HTTPS' : '❌ HTTP only', time: '' },
    ];
  } catch {
    results.value = [{ check: 'HTTP Request', status: '❌ Unreachable', time: '-' }];
  }
  loading.value = false;
}
const cols = [{ title: 'Check', key: 'check' }, { title: 'Status', key: 'status' }, { title: 'Time', key: 'time' }];
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="url" placeholder="URL to check..." style="width:300px" />
      <NButton type="primary" :loading="loading" @click="check">Check Status</NButton>
      <NDataTable v-if="results.length" :columns="cols" :data="results" :bordered="false" size="small" />
    </NSpace></NCard>
  </ToolLayout>
</template>
