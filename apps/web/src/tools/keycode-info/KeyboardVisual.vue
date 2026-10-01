<script setup lang="ts">
import { KEYS, UNITS_PER_KEY } from '@/utils/keyboard-layout';

defineProps<{ activeCode: string | null }>();
</script>

<template>
  <div class="kb-plate" role="img" :aria-label="'keyboard'">
    <div class="kb-grid">
      <div
        v-for="key in KEYS"
        :key="key.code"
        class="kb-key"
        :class="{ 'kb-key--active': key.code === activeCode }"
        :style="{
          gridColumn: `${key.col + 1} / span ${key.u * UNITS_PER_KEY}`,
          gridRow: `${key.row + 1} / span ${key.rowSpan}`,
        }"
        :title="key.code"
      >
        <span v-if="key.sub" class="kb-key__sub">{{ key.sub }}</span>
        <span class="kb-key__label">{{ key.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kb-plate {
  background: var(--color-surface-2);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: 5px;
}

.kb-grid {
  display: grid;
  grid-template-columns: repeat(92, minmax(0, 1fr));
  grid-template-rows: repeat(6, 34px);
}

.kb-key {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1.5px;
  min-width: 0;
  overflow: hidden;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sm);
  color: var(--color-text-2);
  font-size: 10px;
  line-height: 1.1;
  user-select: none;
}

.kb-key__sub {
  font-size: 8px;
  color: var(--color-text-3);
}

.kb-key__label {
  white-space: nowrap;
}

.kb-key--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-canvas);
  transition: background 0.1s;
}

.kb-key--active .kb-key__sub {
  color: var(--color-canvas);
  opacity: 0.75;
}
</style>
