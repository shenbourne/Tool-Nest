<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import NetworkResults from '@/components/NetworkResults.vue';

const { t } = useI18n();

interface DnsResult {
  domain: string;
  resolved: boolean;
  addresses: string[];
}

const loading = ref(false);
const error = ref('');
const results = ref<DnsResult[]>([]);
const DOMAINS = ['dnsleaktest.com', 'expressvpn.com'];

async function run() {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  results.value = [];
  try {
    const res = await fetch('/api/network/dns-leak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains: DOMAINS }),
    });
    if (res.status === 429) throw new Error(t('networkResults.rateLimited'));
    const json = await res.json().catch(() => { throw new Error(t('networkResults.invalidResponse')); });
    if (!json.success) throw new Error(json.error?.message ?? t('common.requestFailed'));
    results.value = json.data;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('common.requestFailed');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="12">
        <NButton type="primary" :loading="loading" @click="run">{{ t('tools.dnsLeakTest.runTest') }}</NButton>
        <NAlert v-if="error" type="error" :title="error" />
        <NetworkResults v-if="results.length" :data="results" kind="dns-leak" />
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
