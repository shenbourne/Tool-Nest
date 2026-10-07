<script setup lang="ts">
import { ref, computed } from 'vue';
import { NSpace, NInput, NTag, NAlert, NCard } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPairPanel from '@/components/ToolTextPairPanel.vue';
import { diffJsonTree, summarizeJsonTree, type JsonDiffRow } from '@/utils/json-tree-diff';
import { tool } from './index';

const { t } = useI18n();

const leftJson = ref('');
const rightJson = ref('');
const errorMsg = ref('');

const diffResult = computed<JsonDiffRow[]>(() => {
  errorMsg.value = '';
  if (!leftJson.value.trim() && !rightJson.value.trim()) return [];
  try {
    const a = leftJson.value.trim() === '' ? undefined : JSON.parse(leftJson.value);
    const b = rightJson.value.trim() === '' ? undefined : JSON.parse(rightJson.value);
    return diffJsonTree(a, b);
  }
  catch (e: any) {
    errorMsg.value = e?.message || t('common.invalidJson');
    return [];
  }
});

const stats = computed(() => summarizeJsonTree(diffResult.value));

function tagType(type: JsonDiffRow['type']): 'success' | 'error' | 'warning' | 'default' {
  if (type === 'added') return 'success';
  if (type === 'removed') return 'error';
  if (type === 'changed') return 'warning';
  return 'default';
}

function indentStyle(depth: number) {
  return { paddingLeft: `${depth * 16 + 8}px` };
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
              <div v-for="(row, i) in diffResult" :key="i" class="json-diff-row" :class="'json-diff-row-' + row.type">
                <div class="json-diff-stripe" :class="'json-diff-stripe-' + row.type" />
                <div class="json-diff-path" :style="indentStyle(row.depth)">
                  <NTag
                    v-if="row.type !== 'same'"
                    :type="tagType(row.type)"
                    size="small"
                    :bordered="false"
                    class="json-diff-tag"
                  >{{ t(`tools.jsonDiff.${row.type}`) }}</NTag>
                  <span class="json-diff-label" :class="{ 'json-diff-label-dim': row.type === 'same' }">{{ row.label }}</span>
                </div>
                <div class="json-diff-value json-diff-value-left" :class="row.type === 'added' ? '' : 'json-diff-left-fill'">
                  <template v-if="row.type !== 'added'">{{ row.leftValue }}</template>
                </div>
                <div class="json-diff-value" :class="row.type === 'removed' ? '' : 'json-diff-right-fill'">
                  <template v-if="row.type !== 'removed'">{{ row.rightValue }}</template>
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
  overflow-y: auto;
  max-height: 520px;
}

.json-diff-grid {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
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
  padding: 2px var(--spacing-sm) 2px 0;
  border-right: 1px solid var(--color-hairline);
  background: var(--color-surface-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.json-diff-tag {
  margin-right: 4px;
}

.json-diff-label {
  font-weight: 600;
}

.json-diff-label-dim {
  color: var(--color-text-3);
  font-weight: 400;
}

.json-diff-value {
  padding: 2px var(--spacing-sm);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
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
