<script setup lang="ts">
import { NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';

withDefaults(defineProps<{
  gap?: number;
}>(), {
  gap: 16,
});

const emit = defineEmits<{
  requestPaste: [];
  requestImport: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="tool-file-panel">
    <!-- Two-column: input files (left) / output files (right) -->
    <div class="tool-file-panel__columns">
      <div class="tool-file-panel__column tool-file-panel__input">
        <slot name="input-files" />
      </div>
      <div class="tool-file-panel__column tool-file-panel__output">
        <slot name="output-files" />
      </div>
    </div>

    <!-- Action buttons: left (import/paste) — right (copy/export, provided by tool via slot) -->
    <div class="tool-file-panel__actions">
      <NSpace>
        <NButton @click="emit('requestImport')">{{ t('tool.importFile') }}</NButton>
        <NButton @click="emit('requestPaste')">{{ t('tool.pasteFile') }}</NButton>
        <slot name="actions-left" />
      </NSpace>
      <NSpace>
        <slot name="actions-right" />
      </NSpace>
    </div>

    <!-- Parameters, process button, and other controls -->
    <div class="tool-file-panel__params">
      <slot name="params" />
    </div>
  </div>
</template>

<style scoped>
.tool-file-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.tool-file-panel__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  align-items: stretch;
}

.tool-file-panel__column {
  min-height: 160px;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
  background: var(--color-surface-soft);
}

.tool-file-panel__params {
  border-top: 1px solid var(--color-hairline);
  padding-top: var(--spacing-sm);
}

.tool-file-panel__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
