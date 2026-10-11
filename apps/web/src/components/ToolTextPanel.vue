<script setup lang="ts">
import { ref } from 'vue';
import { NButton, useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useCopy } from '@/composables/useCopy';
import { readClipboardText } from '@/utils/clipboard';

// Text sibling of ToolFilePanel: two columns (input textarea | output
// textarea), each with the PDF actions bar underneath — import/paste on the
// input side, copy/export on the output side — and a params slot below.
// The tool keeps owning its NInput bindings through the input/output slots;
// the panel owns the four clipboard/file actions.
const props = withDefaults(defineProps<{
  inputTitle?: string;
  outputTitle?: string;
  inputText: string;
  outputText: string;
  exportName?: string;
  hideInput?: boolean;
  hideOutput?: boolean;
  fileActions?: boolean;
}>(), {
  inputTitle: '',
  outputTitle: '',
  exportName: 'output.txt',
  hideInput: false,
  hideOutput: false,
  fileActions: true,
});

const emit = defineEmits<{
  'update:inputText': [string];
}>();

const { t } = useI18n();
const message = useMessage();
const { copyToClipboard } = useCopy();
const fileInput = ref<HTMLInputElement | null>(null);

function triggerImport() {
  fileInput.value?.click();
}

async function onImportChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  target.value = '';
  if (!file) return;
  try {
    emit('update:inputText', await file.text());
  } catch {
    message.error(t('tool.importFailed'));
  }
}

async function pasteFromClipboard() {
  const text = await readClipboardText();
  if (text === null) {
    message.error(t('tool.pasteFailed'));
    return;
  }
  emit('update:inputText', text);
}

function copyOutput() {
  if (props.outputText) copyToClipboard(props.outputText);
}

function exportOutput() {
  if (!props.outputText) return;
  const blob = new Blob([props.outputText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = props.exportName;
  anchor.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="tool-text-panel">
    <div class="tool-text-panel__columns" :class="{ 'tool-text-panel__columns--single': hideInput || hideOutput }">
      <section v-if="!hideInput" class="tool-text-panel__column">
        <div v-if="inputTitle" class="tool-text-panel__title">{{ inputTitle }}</div>
        <div class="tool-text-panel__textarea"><slot name="input" /></div>
        <div class="tool-text-panel__actions">
          <slot name="input-actions">
          <NButton v-if="fileActions" @click="triggerImport">{{ t('tool.importFile') }}</NButton>
          <NButton @click="pasteFromClipboard">{{ t(fileActions ? 'tool.pasteFile' : 'tool.pasteText') }}</NButton>
          </slot>
        </div>
      </section>
      <section v-if="!hideOutput" class="tool-text-panel__column">
        <div v-if="outputTitle" class="tool-text-panel__title">{{ outputTitle }}</div>
        <div class="tool-text-panel__textarea"><slot name="output" /></div>
        <div class="tool-text-panel__actions tool-text-panel__actions--right">
          <slot name="output-actions">
          <NButton :disabled="!outputText" @click="copyOutput">{{ t('tool.copy') }}</NButton>
          <NButton v-if="fileActions" :disabled="!outputText" @click="exportOutput">{{ t('tool.exportFile') }}</NButton>
          </slot>
        </div>
      </section>
    </div>
    <div v-if="$slots.params" class="tool-text-panel__params">
      <slot name="params" />
    </div>
    <input v-if="fileActions" ref="fileInput" type="file" hidden @change="onImportChange" />
  </div>
</template>

<style scoped>
.tool-text-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.tool-text-panel__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  align-items: stretch;
}

.tool-text-panel__columns--single {
  grid-template-columns: 1fr;
}

.tool-text-panel__column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 0;
  min-height: 160px;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
  background: var(--color-surface-soft);
}

.tool-text-panel__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: var(--color-ink);
}

.tool-text-panel__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
}

.tool-text-panel__textarea :slotted(*) {
  flex: 1;
}

.tool-text-panel__actions {
  display: flex;
  gap: var(--spacing-xs);
}

.tool-text-panel__actions--right {
  justify-content: flex-end;
}

.tool-text-panel__params {
  border-top: 1px solid var(--color-hairline);
  padding-top: var(--spacing-sm);
}
</style>
