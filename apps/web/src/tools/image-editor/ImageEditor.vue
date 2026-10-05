<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NColorPicker, NInput, NPopconfirm, NIcon } from 'naive-ui';
import { CloudUpload } from '@vicons/tabler';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useCopy } from '@/composables/useCopy';
import { usePreferencesStore } from '@/stores/preferences.store';
import { resolveCssColorToken } from '@/utils/css-tokens';
import {
  canRedo,
  canUndo,
  commit,
  createHistory,
  historyState,
  moveLine,
  moveLineEndpoint,
  paramsFor,
  redo,
  undo,
  type ActiveTool,
  type Annotation,
  type LineAnnotation,
  type TextAnnotation,
} from './image-editor.service';

/** The slice of a Konva node (or of an event's target) this component touches. */
interface KonvaNode {
  x(): number;
  y(): number;
  position(position: { x: number; y: number }): void;
  getStage(): { getPointerPosition(): { x: number; y: number } | null };
  getLayer(): { batchDraw(): void } | null;
}

interface KonvaPointerEvent {
  target: KonvaNode;
  /** Stops the event reaching the stage, which owns the background click. */
  cancelBubble?: boolean;
}

interface KonvaTransformer {
  nodes(nodes: KonvaNode[]): void;
  forceUpdate(): void;
  getLayer(): { batchDraw(): void } | null;
}

/** A `vue-konva` node component exposes its Konva node through `getNode`. */
interface KonvaComponentRef<N = KonvaNode> {
  getNode(): N;
}

const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const tool = useCurrentTool();
const preferences = usePreferencesStore();
const { copyFileToClipboard } = useCopy();

// Konva cannot resolve CSS `var()` expressions, so the selection chrome needs
// concrete token values, re-read whenever the theme class changes.
const primaryColor = ref('');
const canvasColor = ref('');
watch(
  [() => preferences.isDark, () => preferences.loaded],
  () => {
    primaryColor.value = resolveCssColorToken('--color-primary');
    canvasColor.value = resolveCssColorToken('--color-canvas');
  },
  { immediate: true, flush: 'post' },
);

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

const activeTool = ref<ActiveTool>('none');
const selectedId = ref<number | null>(null);

// Defaults for the next annotation. The panel falls back to these while a
// drawing tool is active.
const drawColor = ref('#ff0000');
const lineWidth = ref(3);
const fontSize = ref(24);
const textContent = ref(t('tools.imageEditor.defaultText'));

const annotations = ref<Annotation[]>([]);
const history = ref(createHistory<Annotation[]>([]));
let nextId = 1;

const isDrawing = ref(false);
const currentLine = ref<number[]>([]);
const tempLine = computed(() => currentLine.value);

const selected = computed(() => annotations.value.find((a) => a.id === selectedId.value) ?? null);
/** The annotation the panel edits; a drawing tool owns the panel while active. */
const editing = computed(() => (activeTool.value === 'none' ? selected.value : null));
const editingText = computed(() => (editing.value?.type === 'text' ? editing.value : null));
const editingLine = computed(() => (editing.value?.type === 'line' ? editing.value : null));

const visibleParams = computed(() => paramsFor(activeTool.value, selected.value));
/** Selecting and editing is the 选择 mode's job, so drawing modes stay inert. */
const canManipulate = computed(() => activeTool.value === 'none');

const endpointPositions = computed(() => {
  const line = editingLine.value;
  if (!line) return [];
  const [x1, y1, x2, y2] = line.points;
  return [
    { end: 0 as const, x: x1, y: y1 },
    { end: 1 as const, x: x2, y: y2 },
  ];
});

const transformerConfig = computed(() => ({
  resizeEnabled: false,
  rotateEnabled: false,
  enabledAnchors: [],
  borderStroke: primaryColor.value,
  borderDash: [4, 4],
  borderWidth: 1,
  padding: 4,
}));

const canUndoNow = computed(() => canUndo(history.value));
const canRedoNow = computed(() => canRedo(history.value));

const colorValue = computed(() => editing.value?.color ?? drawColor.value);
const lineWidthValue = computed(() => editingLine.value?.strokeWidth ?? lineWidth.value);
const fontSizeValue = computed(() => editingText.value?.fontSize ?? fontSize.value);
const textValue = computed(() => editingText.value?.text ?? textContent.value);

// --- history -----------------------------------------------------------------

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

function scheduleCommit() {
  if (pendingCommit) clearTimeout(pendingCommit);
  pendingCommit = setTimeout(() => {
    pendingCommit = null;
    pushHistory();
  }, 400);
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

function replaceAnnotation(id: number, next: Annotation) {
  annotations.value = annotations.value.map((a) => (a.id === id ? next : a));
}

function setColor(value: string | null) {
  const next = value ?? '#000000';
  const target = editing.value;
  if (target) {
    target.color = next;
    scheduleCommit();
  } else {
    drawColor.value = next;
  }
}

function setLineWidth(value: number | null) {
  const next = value ?? 1;
  const target = editingLine.value;
  if (target) {
    replaceAnnotation(target.id, { ...target, strokeWidth: next });
    scheduleCommit();
  } else {
    lineWidth.value = next;
  }
}

function setFontSize(value: number | null) {
  const next = value ?? 8;
  const target = editingText.value;
  if (target) {
    replaceAnnotation(target.id, { ...target, fontSize: next });
    scheduleCommit();
  } else {
    fontSize.value = next;
  }
}

function setText(value: string) {
  const target = editingText.value;
  if (target) {
    replaceAnnotation(target.id, { ...target, text: value });
    scheduleCommit();
  } else {
    textContent.value = value;
  }
}

function deleteSelected() {
  if (selectedId.value === null) return;
  annotations.value = annotations.value.filter((a) => a.id !== selectedId.value);
  selectedId.value = null;
  pushHistory();
}

function clearAll() {
  annotations.value = [];
  selectedId.value = null;
  activeTool.value = 'none';
  pushHistory();
}

function setTool(toolType: ActiveTool) {
  activeTool.value = toolType;
}

// --- stage interactions ------------------------------------------------------

function onStageClick(e: KonvaPointerEvent) {
  if (activeTool.value === 'text') {
    const pointer = e.target.getStage().getPointerPosition();
    if (!pointer) return;
    annotations.value = [
      ...annotations.value,
      {
        id: nextId++,
        type: 'text',
        x: pointer.x,
        y: pointer.y,
        text: textContent.value,
        fontSize: fontSize.value,
        color: drawColor.value,
      },
    ];
    pushHistory();
    return;
  }
  if (activeTool.value === 'none') selectedId.value = null;
}

/** Clicks on an annotation must not reach the stage, which would draw a new one. */
function onAnnotationClick(annotation: Annotation, e: KonvaPointerEvent) {
  e.cancelBubble = true;
  if (activeTool.value !== 'none') return;
  selectedId.value = annotation.id;
}

function onStageMouseDown(e: KonvaPointerEvent) {
  if (activeTool.value !== 'line') return;
  const pointer = e.target.getStage().getPointerPosition();
  if (!pointer) return;
  isDrawing.value = true;
  currentLine.value = [pointer.x, pointer.y, pointer.x, pointer.y];
}

function onStageMouseMove(e: KonvaPointerEvent) {
  if (!isDrawing.value) return;
  const pointer = e.target.getStage().getPointerPosition();
  if (!pointer) return;
  currentLine.value = [currentLine.value[0], currentLine.value[1], pointer.x, pointer.y];
}

function onStageMouseUp() {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  if (currentLine.value.length >= 4) {
    const [x1, y1, x2, y2] = currentLine.value;
    annotations.value = [
      ...annotations.value,
      { id: nextId++, type: 'line', points: [x1, y1, x2, y2], color: drawColor.value, strokeWidth: lineWidth.value },
    ];
    pushHistory();
  }
  currentLine.value = [];
}

function onTextDragEnd(annotation: TextAnnotation, e: KonvaPointerEvent) {
  replaceAnnotation(annotation.id, { ...annotation, x: e.target.x(), y: e.target.y() });
  pushHistory();
}

// Konva reports a dragged shape as a translation on the node; the annotation
// stores absolute points, so the travel is folded in and the node reset.
function onLineDragEnd(annotation: LineAnnotation, e: KonvaPointerEvent) {
  const dx = e.target.x();
  const dy = e.target.y();
  if (dx === 0 && dy === 0) return;
  e.target.position({ x: 0, y: 0 });
  replaceAnnotation(annotation.id, moveLine(annotation, dx, dy));
  pushHistory();
}

function onEndpointDrag(e: KonvaPointerEvent, end: 0 | 1) {
  const line = editingLine.value;
  if (!line) return;
  replaceAnnotation(line.id, moveLineEndpoint(line, end, e.target.x(), e.target.y()));
}

// --- selection outline -------------------------------------------------------

const nodeRefs = new Map<number, KonvaComponentRef | null>();
const transformerRef = ref<unknown>(null);

function setNodeRef(id: number, instance: unknown) {
  nodeRefs.set(id, (instance as KonvaComponentRef | null) ?? null);
}

function shapeNode(id: number): KonvaNode | null {
  return nodeRefs.get(id)?.getNode() ?? null;
}

function transformerNode(): KonvaTransformer | null {
  const instance = transformerRef.value as KonvaComponentRef<KonvaTransformer> | null;
  return instance?.getNode() ?? null;
}

function syncTransformer() {
  const transformer = transformerNode();
  if (!transformer) return;
  const target = selectedId.value === null ? null : shapeNode(selectedId.value);
  transformer.nodes(target ? [target] : []);
  transformer.forceUpdate();
  transformer.getLayer()?.batchDraw();
}

watch([selectedId, annotations], syncTransformer, { deep: true, flush: 'post' });

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

  const scaleX = imgW / stageWidth.value;
  const scaleY = imgH / stageHeight.value;

  ctx.drawImage(imageEl.value, 0, 0);

  for (const ann of annotations.value) {
    if (ann.type === 'text') {
      ctx.font = `${ann.fontSize * scaleY}px sans-serif`;
      ctx.fillStyle = ann.color;
      ctx.fillText(ann.text, ann.x * scaleX, ann.y * scaleY + ann.fontSize * scaleY);
    } else {
      ctx.strokeStyle = ann.color;
      ctx.lineWidth = ann.strokeWidth * scaleX;
      ctx.beginPath();
      ctx.moveTo(ann.points[0] * scaleX, ann.points[1] * scaleY);
      ctx.lineTo(ann.points[2] * scaleX, ann.points[3] * scaleY);
      ctx.stroke();
    }
  }
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
            :config="{ width: stageWidth, height: stageHeight }"
            @click="onStageClick"
            @mousedown="onStageMouseDown"
            @mousemove="onStageMouseMove"
            @mouseup="onStageMouseUp"
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
              <template v-for="ann in annotations" :key="ann.id">
                <v-text
                  v-if="ann.type === 'text'"
                  :ref="(el: unknown) => setNodeRef(ann.id, el)"
                  :config="{
                    x: ann.x,
                    y: ann.y,
                    text: ann.text,
                    fontSize: ann.fontSize,
                    fill: ann.color,
                    draggable: canManipulate,
                  }"
                  @click="onAnnotationClick(ann, $event)"
                  @dragend="onTextDragEnd(ann, $event)"
                />
                <v-line
                  v-else
                  :ref="(el: unknown) => setNodeRef(ann.id, el)"
                  :config="{
                    points: ann.points,
                    stroke: ann.color,
                    strokeWidth: ann.strokeWidth,
                    lineCap: 'round',
                    hitStrokeWidth: 12,
                    draggable: canManipulate,
                  }"
                  @click="onAnnotationClick(ann, $event)"
                  @dragend="onLineDragEnd(ann, $event)"
                />
              </template>
              <v-line
                v-if="tempLine.length >= 4"
                :config="{
                  points: tempLine,
                  stroke: drawColor,
                  strokeWidth: lineWidth,
                  lineCap: 'round',
                  dash: [5, 5],
                }"
              />
              <v-transformer v-if="selected" ref="transformerRef" :config="transformerConfig" />
              <v-circle
                v-for="endpoint in endpointPositions"
                :key="`endpoint-${endpoint.end}`"
                :config="{
                  x: endpoint.x,
                  y: endpoint.y,
                  radius: 6,
                  fill: primaryColor,
                  stroke: canvasColor,
                  strokeWidth: 2,
                  draggable: true,
                }"
                @dragmove="onEndpointDrag($event, endpoint.end)"
                @dragend="pushHistory()"
              />
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
            <div class="image-editor__actions">
              <NSpace :size="8">
                <NButton :type="activeTool === 'text' ? 'primary' : 'default'" @click="setTool('text')">{{ t('tools.imageEditor.addText') }}</NButton>
                <NButton :type="activeTool === 'line' ? 'primary' : 'default'" @click="setTool('line')">{{ t('tools.imageEditor.drawLine') }}</NButton>
                <NButton :type="activeTool === 'none' ? 'primary' : 'default'" @click="setTool('none')">{{ t('common.select') }}</NButton>
                <NPopconfirm @positive-click="clearAll">
                  <template #trigger>
                    <NButton type="error">{{ t('tools.imageEditor.clearAll') }}</NButton>
                  </template>
                  {{ t('tools.imageEditor.confirmClearAll') }}
                </NPopconfirm>
              </NSpace>
              <NSpace :size="8">
                <NButton :disabled="!canUndoNow" @click="undoAction">{{ t('tools.imageEditor.undo') }}</NButton>
                <NButton :disabled="!canRedoNow" @click="redoAction">{{ t('tools.imageEditor.redo') }}</NButton>
              </NSpace>
            </div>

            <div v-if="visibleParams.length" class="image-editor__rows">
              <div v-if="visibleParams.includes('color')" class="image-editor__row">
                <span class="image-editor__row-label">{{ t('tools.imageEditor.color') }}</span>
                <NColorPicker :value="colorValue" style="width:160px;" @update:value="setColor" />
              </div>
              <div v-if="visibleParams.includes('lineWidth')" class="image-editor__row">
                <label class="image-editor__row-label" for="imageEditorLineWidth">{{ t('tools.imageEditor.lineWidth') }}</label>
                <NInputNumber :value="lineWidthValue" :min="1" :max="50" :step="1" style="width:140px;" :input-props="{ id: 'imageEditorLineWidth' }" @update:value="setLineWidth" />
              </div>
              <div v-if="visibleParams.includes('fontSize')" class="image-editor__row">
                <label class="image-editor__row-label" for="imageEditorFontSize">{{ t('tools.imageEditor.fontSize') }}</label>
                <NInputNumber :value="fontSizeValue" :min="8" :max="200" :step="1" style="width:140px;" :input-props="{ id: 'imageEditorFontSize' }" @update:value="setFontSize" />
              </div>
              <div v-if="visibleParams.includes('text')" class="image-editor__row">
                <label class="image-editor__row-label" for="imageEditorText">{{ t('tools.imageEditor.text') }}</label>
                <NInput :value="textValue" :placeholder="t('tools.imageEditor.textPlaceholder')" style="width:280px;" :input-props="{ id: 'imageEditorText' }" @update:value="setText" />
              </div>
              <div v-if="editing" class="image-editor__row">
                <NButton type="error" size="small" @click="deleteSelected">{{ t('tools.imageEditor.deleteSelected') }}</NButton>
              </div>
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

.image-editor__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
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
</style>
