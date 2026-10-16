<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { NCard, NSpace, NButton, NDataTable, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const data = ref<{key: string; value: string}[]>([]);
const loading = ref(false);
const error = ref('');
async function fetchInfo() {
  loading.value = true; error.value = '';
  try {
    const r = await fetch('https://ipapi.co/json/');
    const j = await r.json();
    // Rate-limited/error responses are JSON without an `ip` field; treat them
    // as failures instead of rendering a table of empty rows.
    if (!r.ok || !j.ip) throw new Error(j.reason || `HTTP ${r.status}`);
    data.value = [
      { key: t('tools.ipInfo.ipAddress'), value: j.ip || '' },
      { key: t('common.version'), value: j.version || '' },
      { key: t('tools.ipInfo.city'), value: j.city || '' },
      { key: t('tools.ipInfo.region'), value: j.region || '' },
      { key: t('tools.ipInfo.country'), value: j.country_name || '' },
      { key: t('tools.ipInfo.countryCode'), value: j.country_code || '' },
      { key: t('tools.ipInfo.postal'), value: j.postal || '' },
      { key: t('tools.ipInfo.latitude'), value: String(j.latitude || '') },
      { key: t('tools.ipInfo.longitude'), value: String(j.longitude || '') },
      { key: t('tools.ipInfo.timezone'), value: j.timezone || '' },
      { key: 'ISP', value: j.org || '' },
      { key: 'ASN', value: j.asn || '' },
    ];
  } catch (e: unknown) { error.value = (e instanceof Error ? e.message : String(e)); }
  loading.value = false;
}
onMounted(fetchInfo);
const cols = computed(() => [{ title: t('tools.ipInfo.property'), key: 'key' }, { title: t('tools.ipInfo.value'), key: 'value' }]);
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NButton :loading="loading" @click="fetchInfo">{{ t('common.refresh') }}</NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <div v-if="data.length" key="summary" class="ip-summary"><strong>{{ data[0]?.value }}</strong><span>{{ [data[2]?.value, data[4]?.value, data[10]?.value].filter(Boolean).join(' · ') }}</span></div>
      <NDataTable v-if="data.length" key="records" :columns="cols" :data="data" :bordered="false" size="small" />
    </NSpace></NCard>
  </ToolLayout>
</template>

<style scoped>
.ip-summary { display: flex; flex-direction: column; gap: 6px; padding: 12px 0; overflow-wrap: anywhere; }
.ip-summary strong { font-size: 26px; color: var(--color-primary); }
.ip-summary span { color: var(--color-text-2); }
</style>
