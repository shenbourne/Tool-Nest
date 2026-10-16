<script setup lang="ts">
import { NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';

withDefaults(defineProps<{
  gap?: number;
  /** Set when the tool's result box can hold more than one file. */
  outputMultiple?: boolean;
  /** 2 = input/output boxes side by side; 1 = a single full-width box (canvas tools). */
  columns?: 1 | 2;
}>(), {
  gap: 16,
  outputMultiple: false,
  columns: 2,
});

const emit = defineEmits<{
  requestPaste: [];
  requestImport: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="tool-file-panel">
    <!-- Two-column: input files (left) / output files (right); single-column: one full-width box -->
    <div
      class="tool-file-panel__columns"
      :class="{ 'tool-file-panel__columns--single': columns === 1 }"
    >
      <template v-if="columns === 2">
        <div class="tool-file-panel__column tool-file-panel__input">
          <slot name="input-files" />
        </div>
        <div
          class="tool-file-panel__column tool-file-panel__output"
          :class="{ 'tool-file-panel__output--multi': outputMultiple }"
        >
          <slot name="output-files" />
        </div>
      </template>
      <!-- Single-column tools (canvas editors) put their only box in the default slot -->
      <div v-else class="tool-file-panel__column tool-file-panel__single">
        <slot />
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
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--spacing-md);
  align-items: stretch;
}

.tool-file-panel__columns--single {
  grid-template-columns: 1fr;
}

.tool-file-panel__column {
  min-width: 0;
  min-height: 160px;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
  background: var(--color-surface-soft);
  display: flex;
  flex-direction: column;
}

.tool-file-panel__column > .tool-file-upload {
  flex: 1;
  min-height: 0;
}

/* Several result files: 128x128 tiles in a grid, the same shape a multi-file
   input box uses. One result file keeps the column, so it renders as the
   full-width card. */
.tool-file-panel__output--multi {
  display: grid;
  grid-template-columns: repeat(auto-fill, 128px);
  gap: var(--spacing-sm);
  align-content: start;
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

@media (max-width: 640px) {
  .tool-file-panel__columns {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
