<script setup lang="ts">
import type { DiffRow } from '@/utils/line-diff';

defineProps<{
  rows: DiffRow[];
  leftTitle: string;
  rightTitle: string;
}>();

function rowStripeClass(type: DiffRow['type']): string {
  if (type === 'added') return 'diff-stripe-added';
  if (type === 'removed') return 'diff-stripe-removed';
  if (type === 'changed') return 'diff-stripe-changed';
  return '';
}

function rowBgClass(type: DiffRow['type']): string {
  if (type === 'added') return 'diff-bg-added';
  if (type === 'removed') return 'diff-bg-removed';
  if (type === 'changed') return 'diff-bg-changed';
  return '';
}

function leftBgClass(type: DiffRow['type']): string {
  return type === 'removed' || type === 'changed' ? rowBgClass(type) : '';
}

function rightBgClass(type: DiffRow['type']): string {
  return type === 'added' || type === 'changed' ? rowBgClass(type) : '';
}
</script>

<template>
  <div class="diff-viewer" role="table" :aria-label="`${leftTitle} / ${rightTitle}`">
    <div class="diff-scroll">
      <div class="diff-grid">
        <div class="diff-row" role="row">
          <div class="diff-stripe diff-header-cell" />
          <div class="diff-num diff-header-cell" />
          <div class="diff-code diff-header-cell diff-title">{{ leftTitle }}</div>
          <div class="diff-num diff-header-cell diff-right-gutter" />
          <div class="diff-code diff-header-cell diff-title">{{ rightTitle }}</div>
        </div>
        <div v-for="(row, idx) in rows" :key="idx" class="diff-row" role="row">
          <div class="diff-stripe" :class="rowStripeClass(row.type)" />
          <div class="diff-num">{{ row.leftNum ?? '' }}</div>
          <div class="diff-code" :class="leftBgClass(row.type)">
            <template v-if="row.leftSegments">
              <span
                v-for="(seg, sIdx) in row.leftSegments"
                :key="sIdx"
                :class="{ 'diff-inline-changed': seg.changed }"
              >{{ seg.text }}</span>
            </template>
            <template v-else>{{ row.leftText ?? '' }}</template>
          </div>
          <div class="diff-num diff-right-gutter">{{ row.rightNum ?? '' }}</div>
          <div class="diff-code" :class="rightBgClass(row.type)">
            <template v-if="row.rightSegments">
              <span
                v-for="(seg, sIdx) in row.rightSegments"
                :key="sIdx"
                :class="{ 'diff-inline-changed': seg.changed }"
              >{{ seg.text }}</span>
            </template>
            <template v-else>{{ row.rightText ?? '' }}</template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diff-viewer {
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  background: var(--color-canvas);
  overflow: hidden;
}

.diff-scroll {
  overflow: auto;
  max-height: 520px;
}

.diff-grid {
  display: grid;
  grid-template-columns: 8px 44px minmax(160px, max-content) 44px minmax(160px, max-content);
  width: max-content;
  min-width: 100%;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-code);
  line-height: 20px;
}

.diff-row {
  display: contents;
}

.diff-stripe {
  grid-column: 1;
}

.diff-num {
  grid-column: 2;
  padding: 0 var(--spacing-xs);
  text-align: right;
  color: var(--color-text-3);
  user-select: none;
  border-right: 1px solid var(--color-hairline);
  background: var(--color-surface-soft);
}

.diff-right-gutter {
  grid-column: 4;
  border-right: none;
  border-left: 1px solid var(--color-hairline);
}

.diff-code {
  padding: 0 var(--spacing-sm);
  white-space: pre;
}

.diff-header-cell {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-hairline);
}

.diff-title {
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-2);
  user-select: none;
}

.diff-stripe-added {
  background: var(--diff-gutter-added);
}

.diff-stripe-removed {
  background: var(--diff-gutter-removed);
}

.diff-stripe-changed {
  background: var(--diff-gutter-changed);
}

.diff-bg-added {
  background: var(--diff-added-bg);
}

.diff-bg-removed {
  background: var(--diff-removed-bg);
}

.diff-bg-changed {
  background: var(--diff-changed-bg);
}

.diff-inline-changed {
  background: var(--diff-changed-inline);
  border-radius: var(--radius-xs);
}

.diff-bg-added .diff-inline-changed {
  background: var(--diff-added-inline);
}

.diff-bg-removed .diff-inline-changed {
  background: var(--diff-removed-inline);
}
</style>
