<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NButton, NInput, NSelect, NDataTable, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const domain = ref('example.com');
const type = ref('A');
const results = ref<{name: string; type: string; data: string; ttl: string}[]>([]);
const loading = ref(false);
const error = ref('');
async function resolve() {
  loading.value = true; results.value = []; error.value = '';
  try {
    const r = await fetch('https://dns.google/resolve?name=' + encodeURIComponent(domain.value) + '&type=' + type.value);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    if (j.Answer) results.value = j.Answer.map((a: any) => ({ name: a.name, type: type.value, data: a.data, ttl: String(a.TTL) }));
    if (!results.value.length) error.value = t('tools.dnsResolver.noRecords');
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('tools.dnsResolver.resolveFailed');
  } finally {
    loading.value = false;
  }
}
const cols = computed(() => [{ title: t('common.name'), key: 'name' }, { title: t('tools.dnsResolver.type'), key: 'type' }, { title: t('tools.dnsResolver.data'), key: 'data' }, { title: 'TTL', key: 'ttl' }]);
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NSpace><NInput v-model:value="domain" :placeholder="t('common.domainNamePlaceholder')" style="width:220px"  :input-props="{ id: 'dnsResolverField0' }"/><NSelect v-model:value="type" :options="['A','AAAA','CNAME','MX','NS','TXT','SOA','SRV'].map(opt=>({label:opt,value:opt}))" style="width:100px" /></NSpace>
      <NButton type="primary" :loading="loading" @click="resolve">{{ t('tools.dnsResolver.resolve') }}</NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <div v-if="results.length" key="summary" class="dns-summary"><strong>{{ results[0]?.name }}</strong><span>{{ t('networkResults.recordCount', { count: results.length }) }}</span></div>
      <NDataTable v-if="results.length" key="records" :columns="cols" :data="results" :bordered="false" size="small" />
    </NSpace></NCard>
  </ToolLayout>
</template>

<style scoped>
.dns-summary { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.dns-summary strong { font-size: 18px; overflow-wrap: anywhere; }
.dns-summary span { color: var(--color-text-2); }
</style>
