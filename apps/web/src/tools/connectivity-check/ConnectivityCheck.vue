<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NButton, NAlert, NDataTable } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

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
  for (const target of TARGETS) {
    const start = Date.now();
    try {
      await fetch(target.url, { mode: 'no-cors', cache: 'no-store' });
      results.value.push({ name: target.name, status: t('tools.connectivityCheck.online'), time: (Date.now()-start) + 'ms' });
    } catch { results.value.push({ name: target.name, status: t('tools.connectivityCheck.offline'), time: '-' }); }
  }
  testing.value = false;
}
const cols = computed(() => [{ title: t('common.target'), key: 'name' }, { title: t('common.status'), key: 'status' }, { title: t('common.latency'), key: 'time' }]);
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NButton type="primary" :loading="testing" @click="test">{{ t('tools.connectivityCheck.testConnectivity') }}</NButton>
      <NDataTable v-if="results.length" :columns="cols" :data="results" :bordered="false" size="small" />
    </NSpace></NCard>
  </ToolLayout>
</template>
