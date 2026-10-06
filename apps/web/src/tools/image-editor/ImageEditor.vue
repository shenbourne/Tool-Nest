<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, type Component } from 'vue';
import { NButton, NCard, NIcon, NPopconfirm, NTooltip } from 'naive-ui';
import {
  ArrowBackUp,
  ArrowForwardUp,
  Click as SelectIcon,
  CloudUpload,
  Eraser,
  GridDots,
  Line,
  ListNumbers,
  Pencil,
  Rectangle,
  Trash,
  Typography,
} from '@vicons/tabler';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useCopy } from '@/composables/useCopy';
import {
  canRedo,
  canUndo,
  commit,
  createHistory,
  historyState,
  redo,
  undo,
  type Annotation,
  type Tool,
} from './image-editor.service';

/** The Konva stage node, used to tell background clicks from annotation clicks. */
interface KonvaPointerEvent {
  /** The node that received the click; the stage itself means empty background. */
  target: unknown;
  /** Stops the event reaching the stage, which owns the background click. */
  cancelBubble?: boolean;
}

/** A `vue-konva` node component exposes its Konva node through `getNode`. */
interface KonvaComponentRef {
  getNode(): unknown;
}

const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const tool = useCurrentTool();
const { copyFileToClipboard } = useCopy();

const file = ref<File | null>(null);
const imageUrl = ref<string>('');
const imageEl = ref<HTMLImageElement | null>(null);
const stageWidth = ref(800);
const stageHeight = ref(600);

function onFileChange(files: File[]) {
  const f = files[0] ?? null;
  file.value = f;
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  imageUrl.value = f ? URL.createObjectURL(f) : '';
  if (!f) imageEl.value = null;
}

// Konva's Image shape only *listens* for a load event on its source element, it
// never dispatches one, so the element has to be loaded by a real DOM <img>
// before it can be handed to the stage.
function onImageLoad(e: Event) {
  const img = (e.target as HTMLImageElement);
  imageEl.value = img;
  const maxW = 800;
  const maxH = 600;
  const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
  stageWidth.value = Math.round(img.naturalWidth * scale);
  stageHeight.value = Math.round(img.naturalHeight * scale);
}

// --- toolbar -----------------------------------------------------------------

const activeTool = ref<Tool>('select');
const selectedId = ref<number | null>(null);

interface ToolButton {
  tool: Tool;
  icon: Component;
  labelKey: string;
}

const toolButtons: ToolButton[] = [
  { tool: 'select', icon: SelectIcon, labelKey: 'tools.imageEditor.toolSelect' },
  { tool: 'shape', icon: Rectangle, labelKey: 'tools.imageEditor.toolShape' },
  { tool: 'line', icon: Line, labelKey: 'tools.imageEditor.toolLine' },
  { tool: 'number', icon: ListNumbers, labelKey: 'tools.imageEditor.toolNumber' },
  { tool: 'pen', icon: Pencil, labelKey: 'tools.imageEditor.toolPen' },
  { tool: 'text', icon: Typography, labelKey: 'tools.imageEditor.toolText' },
  { tool: 'eraser', icon: Eraser, labelKey: 'tools.imageEditor.toolEraser' },
  { tool: 'mosaic', icon: GridDots, labelKey: 'tools.imageEditor.toolMosaic' },
];

function setTool(next: Tool) {
  activeTool.value = next;
}

// --- annotations + history ---------------------------------------------------

const annotations = ref<Annotation[]>([]);
const history = ref(createHistory<Annotation[]>([]));

const canUndoNow = computed(() => canUndo(history.value));
const canRedoNow = computed(() => canRedo(history.value));

let pendingCommit: ReturnType<typeof setTimeout> | null = null;

/**
 * Records the current annotations. Property edits fire many times per gesture,
 * so they coalesce and structural edits commit through here immediately.
 */
function pushHistory() {
  if (pendingCommit) {
    clearTimeout(pendingCommit);
    pendingCommit = null;
  }
  if (JSON.stringify(annotations.value) === JSON.stringify(historyState(history.value))) return;
  history.value = commit(history.value, annotations.value);
}

function undoAction() {
  pushHistory();
  history.value = undo(history.value);
  applyRestored();
}

function redoAction() {
  pushHistory();
  history.value = redo(history.value);
  applyRestored();
}

function applyRestored() {
  annotations.value = historyState(history.value);
  if (selectedId.value !== null && !annotations.value.some((a) => a.id === selectedId.value)) {
    selectedId.value = null;
  }
}

// --- annotation edits --------------------------------------------------------

function deleteSelected() {
  if (selectedId.value === null) return;
  annotations.value = annotations.value.filter((a) => a.id !== selectedId.value);
  selectedId.value = null;
  pushHistory();
}

function clearAll() {
  annotations.value = [];
  selectedId.value = null;
  activeTool.value = 'select';
  pushHistory();
}

// --- stage interactions ------------------------------------------------------

const stageRef = ref<KonvaComponentRef | null>(null);

function stageNode(): unknown {
  return stageRef.value?.getNode() ?? null;
}

/** A background click (target is the stage itself) clears the selection. */
function onStageClick(e: KonvaPointerEvent) {
  if (activeTool.value !== 'select') return;
  if (e.target === stageNode()) selectedId.value = null;
}

// --- keyboard ----------------------------------------------------------------

function isEditableTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element?.tagName) return false;
  const tag = element.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || element.isContentEditable;
}

function onKeydown(event: KeyboardEvent) {
  // Typing keeps the browser's own undo: only page-level shortcuts are taken.
  if (isEditableTarget(event.target)) return;
  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (selectedId.value === null) return;
    event.preventDefault();
    deleteSelected();
    return;
  }
  if (!event.ctrlKey && !event.metaKey) return;
  const key = event.key.toLowerCase();
  if (key === 'z' && !event.shiftKey) {
    event.preventDefault();
    undoAction();
  } else if ((key === 'z' && event.shiftKey) || key === 'y') {
    event.preventDefault();
    redoAction();
  }
}

// --- export ------------------------------------------------------------------

function createCanvas() {
  if (!imageEl.value) return null;
  const canvas = document.createElement('canvas');
  const imgW = imageEl.value.naturalWidth;
  const imgH = imageEl.value.naturalHeight;
  canvas.width = imgW;
  canvas.height = imgH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(imageEl.value, 0, 0);

  // Annotation rasterisation lands in Tasks 3–7 as each tool's renderer is
  // added; the base image at natural resolution is the export skeleton.
  return canvas;
}

function downloadImage() {
  const canvas = createCanvas();
  if (!canvas) return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

async function copy() {
  const canvas = createCanvas();
  if (!canvas) return;
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    await copyFileToClipboard(blob);
  }, 'image/png');
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  if (pendingCommit) clearTimeout(pendingCommit);
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
});
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NCard>
      <ToolFilePanel :columns="1" @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <!-- The upload control stays mounted for the paste listener, the accept
             filter and the programmatic picker; the canvas is the only thing
             the box shows. -->
        <div class="image-editor__hidden">
          <ToolFileUpload ref="fileUpload" accept="image/*" compact @change="onFileChange" />
        </div>
        <img v-if="imageUrl" :src="imageUrl" style="display:none" @load="onImageLoad" />
        <div v-if="imageUrl" class="canvas-wrapper">
          <v-stage
            ref="stageRef"
            :config="{ width: stageWidth, height: stageHeight }"
            @click="onStageClick"
          >
            <v-layer>
              <v-image
                :config="{
                  image: imageEl,
                  x: 0,
                  y: 0,
                  width: stageWidth,
                  height: stageHeight,
                }"
              />
              <!-- Per-type Konva renderers are added in Tasks 3–7; the shell
                   keeps `annotations` reactive and history-backed. -->
            </v-layer>
          </v-stage>
        </div>
        <button v-else type="button" class="image-editor__empty" @click="fileUpload?.triggerSelect()">
          <NIcon :size="26" :component="CloudUpload" class="image-editor__empty-icon" />
          <span class="image-editor__empty-label">{{ t('tool.importFile') }}</span>
          <span class="image-editor__empty-hint">{{ t('tool.fileUpload.accepted', { types: 'image/*' }) }}</span>
        </button>
        <template #actions-right>
          <NButton :disabled="!file" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!file" @click="downloadImage">{{ t('tool.exportFile') }}</NButton>
        </template>
        <template #params>
          <div class="image-editor__params">
            <div class="image-editor__toolbar" role="toolbar" :aria-label="t('tools.imageEditor.name')">
              <NTooltip v-for="button in toolButtons" :key="button.tool" placement="bottom">
                <template #trigger>
                  <button
                    type="button"
                    class="image-editor__tool"
                    :class="{ 'image-editor__tool--active': activeTool === button.tool }"
                    :aria-pressed="activeTool === button.tool"
                    @click="setTool(button.tool)"
                  >
                    <NIcon :size="18" :component="button.icon" />
                  </button>
                </template>
                {{ t(button.labelKey) }}
              </NTooltip>
            </div>

            <!-- Per-tool param rows are added in Tasks 3–7; the shell renders
                 only the shared footer. -->
            <div class="image-editor__rows" />

            <div class="image-editor__footer">
              <NTooltip placement="bottom">
                <template #trigger>
                  <button
                    type="button"
                    class="image-editor__tool"
                    :disabled="!canUndoNow"
                    :aria-label="t('tools.imageEditor.undo')"
                    @click="undoAction"
                  >
                    <NIcon :size="18" :component="ArrowBackUp" />
                  </button>
                </template>
                {{ t('tools.imageEditor.undo') }}
              </NTooltip>
              <NTooltip placement="bottom">
                <template #trigger>
                  <button
                    type="button"
                    class="image-editor__tool"
                    :disabled="!canRedoNow"
                    :aria-label="t('tools.imageEditor.redo')"
                    @click="redoAction"
                  >
                    <NIcon :size="18" :component="ArrowForwardUp" />
                  </button>
                </template>
                {{ t('tools.imageEditor.redo') }}
              </NTooltip>
              <NButton v-if="selectedId !== null" type="error" size="small" @click="deleteSelected">
                <NIcon :size="16" :component="Trash" style="margin-right: 4px;" />
                {{ t('tools.imageEditor.deleteSelected') }}
              </NButton>
              <NPopconfirm @positive-click="clearAll">
                <template #trigger>
                  <NButton type="error" size="small">{{ t('tools.imageEditor.clearAll') }}</NButton>
                </template>
                {{ t('tools.imageEditor.confirmClearAll') }}
              </NPopconfirm>
            </div>
          </div>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>

<style scoped>
/* The box is wider and taller than most images; centre the stage in it rather
   than leaving it pinned to the top-left corner. */
.canvas-wrapper {
  flex: 1;
  min-height: 0;
  max-width: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-editor__hidden {
  display: none;
}

.image-editor__empty {
  box-sizing: border-box;
  flex: 1;
  min-height: 128px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xxs);
  border: 2px dashed var(--color-hairline-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface-soft);
  cursor: pointer;
  font: inherit;
  color: inherit;
  transition: border-color var(--motion-fast) var(--motion-ease),
    background var(--motion-fast) var(--motion-ease);
}

.image-editor__empty:hover,
.image-editor__empty:focus-visible {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.image-editor__empty-icon {
  color: var(--color-primary);
}

.image-editor__empty-label {
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-ink);
}

.image-editor__empty-hint {
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
}

.image-editor__params {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.image-editor__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xxs);
}

.image-editor__tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-2);
  cursor: pointer;
  transition: background var(--motion-fast) var(--motion-ease),
    color var(--motion-fast) var(--motion-ease);
}

.image-editor__tool:hover:not(:disabled) {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.image-editor__tool--active {
  background: var(--color-primary);
  color: var(--color-primary-text, #fff);
}

.image-editor__tool:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.image-editor__rows {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

/* One parameter per row, description left of its control, so a row can never
   wrap its label above the control at a narrow width. */
.image-editor__row {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.image-editor__row-label {
  flex: 0 0 auto;
  white-space: nowrap;
  font-size: var(--font-size-body-sm);
  color: var(--color-text-2);
}

.image-editor__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
}
</style>
