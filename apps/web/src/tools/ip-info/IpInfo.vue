<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NCard, NSpace, NButton, NDataTable, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const data = ref<{key: string; value: string}[]>([]);
const loading = ref(false);
const error = ref('');
async function fetchInfo() {
  loading.value = true; error.value = '';
  try {
    const r = await fetch('https://ipapi.co/json/');
    const j = await r.json();
    data.value = [
      { key: 'IP Address', value: j.ip || '' },
      { key: 'Version', value: j.version || '' },
      { key: 'City', value: j.city || '' },
      { key: 'Region', value: j.region || '' },
      { key: 'Country', value: j.country_name || '' },
      { key: 'Country Code', value: j.country_code || '' },
      { key: 'Postal', value: j.postal || '' },
      { key: 'Latitude', value: String(j.latitude || '') },
      { key: 'Longitude', value: String(j.longitude || '') },
      { key: 'Timezone', value: j.timezone || '' },
      { key: 'ISP', value: j.org || '' },
      { key: 'ASN', value: j.asn || '' },
    ];
  } catch (e: any) { error.value = e.message; }
  loading.value = false;
}
onMounted(fetchInfo);
const cols = [{ title: 'Property', key: 'key' }, { title: 'Value', key: 'value' }];
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NButton :loading="loading" @click="fetchInfo">Refresh</NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <NDataTable v-if="data.length" :columns="cols" :data="data" :bordered="false" size="small" />
    </NSpace></NCard>
  </ToolLayout>
</template>
