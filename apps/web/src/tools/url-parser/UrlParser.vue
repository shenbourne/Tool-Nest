<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('https://user:pass@example.com:8080/path/to/page?query=value&foo=bar#section');
const parsed = computed(() => {
  try { return new URL(input.value); } catch { return null; }
});
const params = computed(() => {
  if (!parsed.value) return [];
  return [...parsed.value.searchParams.entries()].map(([k,v]) => ({ key: k, value: v }));
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard><NInput v-model:value="input" placeholder="Enter URL to parse..." /></NCard>
      <NAlert v-if="!parsed" type="error">Invalid URL</NAlert>
      <NCard v-if="parsed" title="URL Parts"><NSpace vertical :size="8">
        <div v-for="[label, val] in [['Protocol', parsed.protocol], ['Host', parsed.host], ['Hostname', parsed.hostname], ['Port', parsed.port || '(default)'], ['Pathname', parsed.pathname], ['Search', parsed.search], ['Hash', parsed.hash]]" :key="label" style="display:flex;gap:12px;">
          <span style="width:100px;opacity:0.6;font-size:13px;">{{ label }}</span>
          <NInput :value="val" readonly size="small" />
        </div>
      </NSpace></NCard>
      <NCard v-if="params.length" title="Query Parameters"><NSpace vertical :size="4">
        <div v-for="p in params" :key="p.key" style="display:flex;gap:8px;">
          <NInput :value="p.key" readonly size="small" style="flex:1;" />
          <NInput :value="p.value" readonly size="small" style="flex:2;" />
        </div>
      </NSpace></NCard>
    </NSpace>
  </ToolLayout>
</template>
