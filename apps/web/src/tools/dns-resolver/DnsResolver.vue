<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NSelect, NDataTable } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const domain = ref('example.com');
const type = ref('A');
const results = ref<{name: string; type: string; data: string; ttl: string}[]>([]);
const loading = ref(false);
async function resolve() {
  loading.value = true; results.value = [];
  try {
    const r = await fetch('https://dns.google/resolve?name=' + encodeURIComponent(domain.value) + '&type=' + type.value);
    const j = await r.json();
    if (j.Answer) results.value = j.Answer.map((a: any) => ({ name: a.name, type: type.value, data: a.data, ttl: String(a.TTL) }));
  } catch {}
  loading.value = false;
}
const cols = [{ title: 'Name', key: 'name' }, { title: 'Type', key: 'type' }, { title: 'Data', key: 'data' }, { title: 'TTL', key: 'ttl' }];
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NSpace><NInput v-model:value="domain" placeholder="Domain name..." style="width:220px" /><NSelect v-model:value="type" :options="['A','AAAA','CNAME','MX','NS','TXT','SOA','SRV'].map(t=>({label:t,value:t}))" style="width:100px" /></NSpace>
      <NButton type="primary" :loading="loading" @click="resolve">Resolve</NButton>
      <NDataTable v-if="results.length" :columns="cols" :data="results" :bordered="false" size="small" />
    </NSpace></NCard>
  </ToolLayout>
</template>
