<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { NButton, NIcon, NTooltip, useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import {
  ChevronDown,
  ChevronRight,
  Clipboard,
  FileImport,
} from '@vicons/tabler';
import { readClipboardText } from '@/utils/clipboard';
import { collectClipboardFiles } from '@/utils/clipboard-files';

// Two-input comparator sibling of ToolTextPanel: side-by-side textareas that
// are BOTH inputs (diff tools), so each column gets import/paste actions and a
// shared collapse toggle — clicking either arrow collapses or expands both
// columns together. The tool keeps owning its NInput bindings through the
// left/right slots; the panel owns the file/clipboard actions and collapse.
withDefaults(defineProps<{
  leftTitle?: string;
  rightTitle?: string;
  leftText: string;
  rightText: string;
  accept?: string;
}>(), {
  leftTitle: '',
  rightTitle: '',
  accept: '',
});

const emit = defineEmits<{
  'update:leftText': [string];
  'update:rightText': [string];
}>();

const { t } = useI18n();
const message = useMessage();

const collapsed = ref(false);
const lastFocusedSide = ref<'left' | 'right'>('left');
const leftFileInput = ref<HTMLInputElement | null>(null);
const rightFileInput = ref<HTMLInputElement | null>(null);

function toggleCollapsed() {
  collapsed.value = !collapsed.value;
}

function setText(side: 'left' | 'right', text: string) {
  if (side === 'left') emit('update:leftText', text);
  else emit('update:rightText', text);
}

async function importFile(side: 'left' | 'right', file: File) {
  try {
    setText(side, await file.text());
  } catch {
    message.error(t('tool.importFailed'));
  }
}

function onFileChange(side: 'left' | 'right', event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  target.value = '';
  if (file) void importFile(side, file);
}

async function pasteInto(side: 'left' | 'right') {
  // Files first (a copied file in the OS file manager), then plain text.
  try {
    const clipboard = await navigator.clipboard.read();
    for (const item of clipboard) {
      const fileType = item.types.find((type) => type !== 'text/plain');
      if (fileType) {
        const blob = await item.getType(fileType);
        await importFile(side, new File([blob], 'pasted', { type: blob.type }));
        return;
      }
    }
  } catch {
    // Clipboard read of files can be denied; fall through to text.
  }
  const text = await readClipboardText();
  if (text === null) {
    message.error(t('tool.pasteFailed'));
    return;
  }
  setText(side, text);
}

function onPaneFocus(side: 'left' | 'right') {
  lastFocusedSide.value = side;
}

function onPagePaste(event: ClipboardEvent) {
  const files = collectClipboardFiles(event.clipboardData);
  if (files.length === 0) return;
  event.preventDefault();
  void importFile(lastFocusedSide.value, files[0]);
}

onMounted(() => document.addEventListener('paste', onPagePaste));
onBeforeUnmount(() => document.removeEventListener('paste', onPagePaste));
</script>

<template>
  <div class="tool-text-pair-panel">
    <div class="tool-text-pair-panel__columns" :class="{ 'tool-text-pair-panel__columns--collapsed': collapsed }">
      <section v-for="side in (['left', 'right'] as const)" :key="side" class="tool-text-pair-panel__column">
        <div class="tool-text-pair-panel__header">
          <span class="tool-text-pair-panel__title">{{ side === 'left' ? leftTitle : rightTitle }}</span>
          <NTooltip>
            <template #trigger>
              <NButton quaternary circle size="small" :aria-label="t(collapsed ? 'tool.expand' : 'tool.collapse')" @click="toggleCollapsed">
                <NIcon><ChevronDown v-if="!collapsed" /><ChevronRight v-else /></NIcon>
              </NButton>
            </template>
            {{ t(collapsed ? 'tool.expand' : 'tool.collapse') }}
          </NTooltip>
        </div>
        <template v-if="!collapsed">
          <div class="tool-text-pair-panel__textarea" @focusin="onPaneFocus(side)">
            <slot :name="side" />
          </div>
          <div class="tool-text-pair-panel__actions">
            <NTooltip>
              <template #trigger>
                <NButton quaternary circle size="small" :aria-label="t('tool.importFile')" @click="(side === 'left' ? leftFileInput : rightFileInput)?.click()">
                  <NIcon><FileImport /></NIcon>
                </NButton>
              </template>
              {{ t('tool.importFile') }}
            </NTooltip>
            <NTooltip>
              <template #trigger>
                <NButton quaternary circle size="small" :aria-label="t('tool.pasteFile')" @click="pasteInto(side)">
                  <NIcon><Clipboard /></NIcon>
                </NButton>
              </template>
              {{ t('tool.pasteFile') }}
            </NTooltip>
          </div>
        </template>
      </section>
    </div>
    <input ref="leftFileInput" type="file" hidden :accept="accept" @change="onFileChange('left', $event)" />
    <input ref="rightFileInput" type="file" hidden :accept="accept" @change="onFileChange('right', $event)" />
  </div>
</template>

<style scoped>
.tool-text-pair-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.tool-text-pair-panel__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  align-items: start;
}

.tool-text-pair-panel__column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 0;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
  background: var(--color-surface-soft);
}

.tool-text-pair-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xs);
}

.tool-text-pair-panel__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: var(--color-ink);
}

.tool-text-pair-panel__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
}

.tool-text-pair-panel__textarea :slotted(*) {
  flex: 1;
}

.tool-text-pair-panel__actions {
  display: flex;
  gap: var(--spacing-xs);
}
</style>
