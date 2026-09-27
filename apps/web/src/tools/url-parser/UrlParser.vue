<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('https://user:pass@example.com:8080/path/to/page?query=value&foo=bar#section');
const parsed = computed(() => {
  try { return new URL(input.value); } catch { return null; }
});
const params = computed(() => {
  if (!parsed.value) return [];
  return [...parsed.value.searchParams.entries()].map(([k,v]) => ({ key: k, value: v }));
});
const parts = computed(() => {
  if (!parsed.value) return [];
  const u = parsed.value;
  return [
    { label: t('tools.urlParser.protocol'), value: u.protocol },
    { label: t('tools.urlParser.host'), value: u.host },
    { label: t('tools.urlParser.hostname'), value: u.hostname },
    { label: t('tools.urlParser.port'), value: u.port || t('tools.urlParser.defaultPort') },
    { label: t('tools.urlParser.pathname'), value: u.pathname },
    { label: t('tools.urlParser.search'), value: u.search },
    { label: t('tools.urlParser.hash'), value: u.hash },
  ];
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard><NInput v-model:value="input" :placeholder="t('tools.urlParser.inputPlaceholder')" /></NCard>
      <NAlert v-if="!parsed" type="error">{{ t('tools.urlParser.invalidUrl') }}</NAlert>
      <NCard v-if="parsed" :title="t('tools.urlParser.urlParts')"><NSpace vertical :size="8">
        <div v-for="part in parts" :key="part.label" style="display:flex;gap:12px;">
          <span style="width:100px;opacity:0.6;font-size:13px;">{{ part.label }}</span>
          <NInput :value="part.value" readonly size="small" />
        </div>
      </NSpace></NCard>
      <NCard v-if="params.length" :title="t('tools.urlParser.queryParameters')"><NSpace vertical :size="4">
        <div v-for="(p, i) in params" :key="p.key + '-' + i" style="display:flex;gap:8px;">
          <NInput :value="p.key" readonly size="small" style="flex:1;" />
          <NInput :value="p.value" readonly size="small" style="flex:2;" />
        </div>
      </NSpace></NCard>
    </NSpace>
  </ToolLayout>
</template>
