<script setup lang="ts">
import { ref, computed } from 'vue';
import { NSpace, NButton, NInput, NTag, NAlert, NCard } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPairPanel from '@/components/ToolTextPairPanel.vue';
import { tool } from './index';

const { t } = useI18n();

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
  if (!leftJson.value.trim() && !rightJson.value.trim()) return [];
  try {
    // Empty sides use undefined (not null) so a literal JSON `null` on one
    // side is never mistaken for an untouched textbox on the other.
    const a = leftJson.value.trim() === '' ? undefined : JSON.parse(leftJson.value);
    const b = rightJson.value.trim() === '' ? undefined : JSON.parse(rightJson.value);
    if (a === undefined || b === undefined) {
      return a === undefined
        ? [{ path: '(root)', type: 'added', newValue: b }]
        : [{ path: '(root)', type: 'removed', oldValue: a }];
    }
    return diff(a, b);
  }
  catch (e: any) {
    errorMsg.value = e?.message || t('common.invalidJson');
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
      <ToolTextPairPanel
        v-model:left-text="leftJson"
        v-model:right-text="rightJson"
        :left-title="t('tools.jsonDiff.leftJson')"
        :right-title="t('tools.jsonDiff.rightJson')"
        accept=".json,application/json"
      >
        <template #left><NInput v-model:value="leftJson" type="textarea" :rows="10" :placeholder="t('tools.jsonDiff.leftPlaceholder')" :input-props="{ id: 'jsonDiffField0' }" /></template>
        <template #right><NInput v-model:value="rightJson" type="textarea" :rows="10" :placeholder="t('tools.jsonDiff.rightPlaceholder')" :input-props="{ id: 'jsonDiffField1' }" /></template>
      </ToolTextPairPanel>
      <NAlert v-if="errorMsg" type="error" :title="errorMsg" />
      <NSpace v-if="diffResult.length">
        <NTag type="success">{{ t('tools.jsonDiff.added') }}: {{ stats.added }}</NTag>
        <NTag type="error">{{ t('tools.jsonDiff.removed') }}: {{ stats.removed }}</NTag>
        <NTag type="warning">{{ t('tools.jsonDiff.changed') }}: {{ stats.changed }}</NTag>
      </NSpace>
      <NCard v-if="diffResult.length" :title="t('tools.jsonDiff.differences')">
        <div class="json-diff-viewer">
          <div class="json-diff-scroll">
            <div class="json-diff-grid">
              <div v-for="(d, i) in diffResult" :key="i" class="json-diff-row">
                <div class="json-diff-stripe" :class="'json-diff-stripe-' + d.type" />
                <div class="json-diff-path">
                  <NTag
                    :type="d.type==='added'?'success':d.type==='removed'?'error':'warning'"
                    size="small"
                    :bordered="false"
                    style="margin-right:8px;"
                  >{{ t(`tools.jsonDiff.${d.type}`) }}</NTag>
                  <strong>{{ d.path }}</strong>
                </div>
                <div class="json-diff-value json-diff-value-left" :class="d.type==='added' ? '' : 'json-diff-left-fill'">
                  <template v-if="d.type !== 'added'">{{ formatVal(d.oldValue) }}</template>
                </div>
                <div class="json-diff-value" :class="d.type==='removed' ? '' : 'json-diff-right-fill'">
                  <template v-if="d.type !== 'removed'">{{ formatVal(d.newValue) }}</template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>

<style scoped>
.json-diff-viewer {
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  background: var(--color-canvas);
  overflow: hidden;
}

.json-diff-scroll {
  overflow: auto;
  max-height: 520px;
}

.json-diff-grid {
  display: grid;
  grid-template-columns: 8px minmax(140px, max-content) minmax(160px, max-content) minmax(160px, max-content);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-code);
  line-height: 20px;
}

.json-diff-row {
  display: contents;
}

.json-diff-stripe {
  grid-column: 1;
}

.json-diff-stripe-added {
  background: var(--diff-gutter-added);
}

.json-diff-stripe-removed {
  background: var(--diff-gutter-removed);
}

.json-diff-stripe-changed {
  background: var(--diff-gutter-changed);
}

.json-diff-path {
  grid-column: 2;
  padding: 2px var(--spacing-sm);
  border-right: 1px solid var(--color-hairline);
  background: var(--color-surface-soft);
  white-space: nowrap;
}

.json-diff-value {
  padding: 2px var(--spacing-sm);
  white-space: pre-wrap;
  word-break: break-all;
}

.json-diff-value-left {
  border-right: 1px solid var(--color-hairline);
}

.json-diff-left-fill {
  background: var(--diff-removed-bg);
}

.json-diff-right-fill {
  background: var(--diff-added-bg);
}
</style>
