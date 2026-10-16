<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import UrlFieldInput from './UrlFieldInput.vue';
const { t } = useI18n();
const input = ref('https://user:pass@example.com:8080/path/to/page?query=value&foo=bar#section');
const parsed = computed(() => {
  try { return new URL(input.value); } catch { return null; }
});
const params = computed(() => {
  if (!parsed.value) return [];
  return [...parsed.value.searchParams.entries()].map(([key, value], index) => ({ index, key, value }));
});
type PartField = 'protocol' | 'host' | 'hostname' | 'port' | 'pathname' | 'search' | 'hash';
const parts = computed(() => {
  if (!parsed.value) return [];
  const u = parsed.value;
  return [
    { field: 'protocol' as PartField, label: t('tools.urlParser.protocol'), value: u.protocol },
    { field: 'host' as PartField, label: t('tools.urlParser.host'), value: u.host },
    { field: 'hostname' as PartField, label: t('tools.urlParser.hostname'), value: u.hostname },
    { field: 'port' as PartField, label: t('tools.urlParser.port'), value: u.port, placeholder: t('tools.urlParser.defaultPort') },
    { field: 'pathname' as PartField, label: t('tools.urlParser.pathname'), value: u.pathname },
    { field: 'search' as PartField, label: t('tools.urlParser.search'), value: u.search },
    { field: 'hash' as PartField, label: t('tools.urlParser.hash'), value: u.hash },
  ];
});
// Apply an edit to one URL component and write the rebuilt URL back to the
// input box. Invalid edits are silently ignored; the field keeps its local
// draft until blur, then reverts to the last valid value.
function commitField(field: PartField, value: string) {
  if (!parsed.value) return;
  const u = new URL(input.value);
  try {
    switch (field) {
      case 'protocol': u.protocol = value; break;
      case 'host': u.host = value; break;
      case 'hostname': u.hostname = value; break;
      case 'port': u.port = value; break;
      case 'pathname': u.pathname = value; break;
      case 'search': u.search = value; break;
      case 'hash': u.hash = value; break;
    }
  } catch { return; }
  input.value = u.toString();
}
function commitParam(index: number, which: 'key' | 'value', value: string) {
  if (!parsed.value) return;
  const u = new URL(input.value);
  const entries = [...u.searchParams.entries()];
  if (!entries[index]) return;
  entries[index] = which === 'key' ? [value, entries[index][1]] : [entries[index][0], value];
  u.search = new URLSearchParams(entries).toString();
  input.value = u.toString();
}
function addParam() {
  if (!parsed.value) return;
  const u = new URL(input.value);
  u.searchParams.append('', '');
  input.value = u.toString();
}
function removeParam(index: number) {
  if (!parsed.value) return;
  const u = new URL(input.value);
  const entries = [...u.searchParams.entries()];
  u.search = '';
  entries.forEach(([key, value], i) => {
    if (i !== index) u.searchParams.append(key, value);
  });
  input.value = u.toString();
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard><NInput v-model:value="input" :placeholder="t('tools.urlParser.inputPlaceholder')"  :input-props="{ id: 'urlParserField0' }"/></NCard>
      <NAlert v-if="!parsed" type="error">{{ t('tools.urlParser.invalidUrl') }}</NAlert>
      <NCard v-if="parsed" :title="t('tools.urlParser.urlParts')"><NSpace vertical :size="8">
        <div v-for="part in parts" :key="part.field" style="display:flex;gap:12px;align-items:center;">
          <span style="width:100px;opacity:0.6;font-size:13px;flex-shrink:0;">{{ part.label }}</span>
          <UrlFieldInput
            style="flex:1;"
            :value="part.value"
            :placeholder="part.placeholder"
            input-id="urlParserField1"
            @commit="(v: string) => commitField(part.field, v)"
          />
        </div>
      </NSpace></NCard>
      <NCard v-if="parsed" :title="t('tools.urlParser.queryParameters')"><NSpace vertical :size="4">
        <div v-for="p in params" :key="p.index" style="display:flex;gap:8px;align-items:center;">
          <UrlFieldInput
            style="flex:1;"
            :value="p.key"
            input-id="urlParserField2"
            @commit="(v: string) => commitParam(p.index, 'key', v)"
          />
          <UrlFieldInput
            style="flex:2;"
            :value="p.value"
            input-id="urlParserField3"
            @commit="(v: string) => commitParam(p.index, 'value', v)"
          />
          <NButton size="small" circle secondary type="error" :title="t('tools.urlParser.removeParam')" @click="removeParam(p.index)">-</NButton>
        </div>
        <div>
          <NButton size="small" circle secondary type="success" :title="t('tools.urlParser.addParam')" @click="addParam">+</NButton>
        </div>
      </NSpace></NCard>
    </NSpace>
  </ToolLayout>
</template>
