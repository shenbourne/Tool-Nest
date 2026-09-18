<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NButton, NInput, NTag, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

interface DiffEntry {
  path: string;
  type: 'added' | 'removed' | 'changed';
  oldValue?: any;
  newValue?: any;
}

const leftJson = ref('');
const rightJson = ref('');
const errorMsg = ref('');

function diff(a: any, b: any, path = ''): DiffEntry[] {
  const entries: DiffEntry[] = [];
  if (a === b) return entries;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) || Array.isArray(b)) {
    if (a !== b) {
      entries.push({ path: path || '(root)', type: 'changed', oldValue: a, newValue: b });
    }
    return entries;
  }
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    const childPath = path ? `${path}.${key}` : key;
    if (!(key in a)) {
      entries.push({ path: childPath, type: 'added', newValue: b[key] });
    }
    else if (!(key in b)) {
      entries.push({ path: childPath, type: 'removed', oldValue: a[key] });
    }
    else {
      entries.push(...diff(a[key], b[key], childPath));
    }
  }
  return entries;
}

const diffResult = computed<DiffEntry[]>(() => {
  errorMsg.value = '';
  if (!leftJson.value && !rightJson.value) return [];
  try {
    const a = leftJson.value ? JSON.parse(leftJson.value) : null;
    const b = rightJson.value ? JSON.parse(rightJson.value) : null;
    if (a === null && b === null) return [];
    if (a === null) return [{ path: '(root)', type: 'added', newValue: b }];
    if (b === null) return [{ path: '(root)', type: 'removed', oldValue: a }];
    return diff(a, b);
  }
  catch (e: any) {
    errorMsg.value = e?.message || 'Invalid JSON';
    return [];
  }
});

const stats = computed(() => {
  const s = { added: 0, removed: 0, changed: 0 };
  diffResult.value.forEach(d => s[d.type]++);
  return s;
});

function formatVal(v: any): string {
  if (v === undefined) return '';
  return typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v);
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <div style="display:flex;gap:12px;">
        <NCard title="Left JSON" style="flex:1;"><NInput v-model:value="leftJson" type="textarea" :rows="10" placeholder="Paste left JSON..." /></NCard>
        <NCard title="Right JSON" style="flex:1;"><NInput v-model:value="rightJson" type="textarea" :rows="10" placeholder="Paste right JSON..." /></NCard>
      </div>
      <NAlert v-if="errorMsg" type="error" :title="errorMsg" />
      <NSpace v-if="diffResult.length">
        <NTag type="success">Added: {{ stats.added }}</NTag>
        <NTag type="error">Removed: {{ stats.removed }}</NTag>
        <NTag type="warning">Changed: {{ stats.changed }}</NTag>
      </NSpace>
      <NCard v-if="diffResult.length" title="Differences">
        <div style="font-family:monospace;font-size:13px;">
          <div v-for="(d, i) in diffResult" :key="i" :style="{ padding: '4px 8px', borderBottom: '1px solid #eee', background: d.type==='added'?'#e6ffed':d.type==='removed'?'#ffeef0':'#fff5b1' }">
            <NTag :type="d.type==='added'?'success':d.type==='removed'?'error':'warning'" size="small" style="margin-right:8px;">{{ d.type }}</NTag>
            <strong>{{ d.path }}</strong>
            <span v-if="d.type==='removed'" style="color:#d03050;margin-left:8px;">{{ formatVal(d.oldValue) }}</span>
            <span v-else-if="d.type==='added'" style="color:#18a058;margin-left:8px;">{{ formatVal(d.newValue) }}</span>
            <span v-else style="margin-left:8px;"><span style="color:#d03050;">{{ formatVal(d.oldValue) }}</span> → <span style="color:#18a058;">{{ formatVal(d.newValue) }}</span></span>
          </div>
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
