<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NButton, NAlert, NDataTable } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

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

const columns = computed(() => [
  { title: t('common.domain'), key: 'domain' },
  { title: t('tools.dnsLeakTest.resolved'), key: 'resolved' },
  { title: t('tools.dnsLeakTest.addresses'), key: 'addresses' },
]);

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
