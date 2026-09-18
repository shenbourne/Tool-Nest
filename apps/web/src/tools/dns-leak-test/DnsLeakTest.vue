<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert, NDataTable } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

interface DnsResult {
  domain: string;
  resolved: boolean;
  addresses: string[];
}

const loading = ref(false);
const error = ref('');
const results = ref<DnsResult[]>([]);
const DOMAINS = ['dnsleaktest.com', 'expressvpn.com'];

const columns = [
  { title: 'Domain', key: 'domain' },
  { title: 'Resolved', key: 'resolved' },
  { title: 'Addresses', key: 'addresses' },
];

async function run() {
  loading.value = true;
  error.value = '';
  results.value = [];
  try {
    const res = await fetch('/api/network/dns-leak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains: DOMAINS }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? 'Request failed');
    results.value = json.data;
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
        <NButton type="primary" :loading="loading" @click="run">Run Test</NButton>
        <NAlert v-if="error" type="error" :title="error" />
        <NDataTable
          v-if="results.length"
          :columns="columns"
          :data="results"
          :bordered="false"
          size="small"
        />
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
