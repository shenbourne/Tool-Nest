<script setup lang="ts">
import { computed, provide, onMounted, onUnmounted, ref, watch, type Component, type VNodeChild } from 'vue';
import {
  NButton,
  NCard,
  NIcon,
  NPopconfirm,
  NSelect,
  NTooltip,
  useMessage,
} from 'naive-ui';
import {
  ArrowBackUp,
  ArrowForwardUp,
  ArrowLeft,
  ArrowRight,
  BorderStyle,
  Blur,
  Brush,
  Circle as CircleIcon,
  Click as SelectIcon,
  CloudUpload,
  Eraser,
  GridDots,
  Highlight,
  Line,
  ListNumbers,
  Paint,
  Pencil,
  RadiusBottomLeft,
  Rectangle,
  Trash,
  Typography,
  LetterT,
  Vector,
} from '@vicons/tabler';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { TOOL_TAB_NAVIGATION, projectToolTabs, resolveToolTab, type TabName } from '@/utils/tool-tab-navigation';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import ToolTabs from '@/components/ToolTabs.vue';
import SizeField from './SizeField.vue';
import ImageOperations from './ImageOperations.vue';
import CanvasColorPicker from './CanvasColorPicker.vue';
import AnnotationColorControl from './AnnotationColorControl.vue';
import { imageColorPickingKey } from './image-color-picking';
import { createImageEditorLifecycle } from './image-editor-lifecycle';
import { hasImageOperationChanges, cropFromDrag, resizeCrop, transformCanvas, type CropHandle, type CropRectangle, type ImageOperation } from './image-transforms';
import {
  arrowStylePreview,
  lineWeightIcon,
  numberFormatPreview,
  strokeStylePreview,
} from './params-previews';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useCopy } from '@/composables/useCopy';
import { usePreferencesStore } from '@/stores/preferences.store';
import { resolveCssColorToken } from '@/utils/css-tokens';
import {
  arrowPoints,
  applyMosaic,
  distToSegment,
  formatNumber,
  rectFromPoints,
  strokeDash,
  type Annotation,
  type ArrowConfig,
  type ArrowStyle,
  type LineAnnotation,
  type MosaicAnnotation,
  type NumberAnnotation,
  type NumberFormat,
  type PenAnnotation,
  type ShapeAnnotation,
  type StrokeStyle,
  type TextAnnotation,
  type Tool,
} from './image-editor.service';

/** The slice of a Konva node (or of an event's target) this component touches. */
interface KonvaNode {
  name(): string;
  x(): number;
  y(): number;
  position(position: { x: number; y: number }): void;
  width(): number;
  height(): number;
  rotation(): number;
  rotation(degrees: number): void;
  getStage(): { getPointerPosition(): { x: number; y: number } | null };
  getLayer(): { batchDraw(): void } | null;
}

/** The Konva stage node, used to tell background clicks from annotation clicks. */
interface KonvaPointerEvent {
  /** The node that received the click; the stage itself means empty background. */
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
const message = useMessage();
const editorTabs = computed(() => projectToolTabs('/image-editor', t));
const editorTab = ref<TabName<'/image-editor'>>(TOOL_TAB_NAVIGATION['/image-editor'].defaultTab);
const route = useRoute();
watch(() => route.query.tab, value => {
  const selected = resolveToolTab('/image-editor', value);
  if (selected !== undefined) editorTab.value = selected;
}, { immediate: true });
const watermarkMode = ref(false);
const operationBusy = ref(false);
const colorPicking = ref(false);
let receivePickedColor: ((color:string) => void) | null = null;
const operationsRef = ref<InstanceType<typeof ImageOperations> | null>(null);
const cropSelection = ref<CropRectangle | null>(null);
const cropEnabled = ref(false);
const cropRatio = ref(0);
const hoveredCropHandle = ref<CropHandle | null>(null);
const resizingCropHandle = ref<CropHandle | null>(null);
const cropCursor = computed(() => {
  const handle = resizingCropHandle.value ?? hoveredCropHandle.value;
  if (!cropEnabled.value) return undefined;
  if (handle === 'nw' || handle === 'se') return 'nwse-resize';
  if (handle === 'ne' || handle === 'sw') return 'nesw-resize';
  if (handle === 'n' || handle === 's') return 'ns-resize';
  if (handle === 'e' || handle === 'w') return 'ew-resize';
  return 'crosshair';
});
let cropStart: {x: number; y: number} | null = null;
let cropResize: { handle: CropHandle; rect: CropRectangle } | null = null;
const previewOperation = ref<ImageOperation | null>(null);
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
provide(imageColorPickingKey, {
  available: computed(() => !!imageEl.value && !operationBusy.value),
  request(receive) {
    if (!imageEl.value || operationBusy.value) return;
    cropStart = null; cropResize = null;
    receivePickedColor = receive;
    colorPicking.value = true;
    message.info(t('tools.imageEditor.pickColorHint'));
  },
});
const canvasWrapper = ref<HTMLElement | null>(null);
const availableWidth = ref(800);
const displayScale = computed(() => Math.min(1, availableWidth.value / renderWidth.value));
let canvasObserver: ResizeObserver | null = null;
watch(canvasWrapper, wrapper => {
  canvasObserver?.disconnect();
  if (!wrapper) return;
  canvasObserver = new ResizeObserver(entries => {
    availableWidth.value = Math.max(1, entries[0].contentRect.width);
  });
  canvasObserver.observe(wrapper);
}, { flush: 'post' });

/** Image decoding is an adapter; the lifecycle decides whether its result is current. */
async function decodeImage(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = url;
  await img.decode();
  return img;
}

function onFileChange(files: File[]) {
  const f = files[0] ?? null;
  cancelColorPicking();
  previewOperation.value = null;
  operationsRef.value?.resetAll();
  watermarkMode.value = false;
  cropSelection.value = null;
  cropStart = null;
  cropResize = null;
  resizingCropHandle.value = null;
  hoveredCropHandle.value = null;
  cancelTextEdit();
  selectedId.value = null;
  if (pendingCommit) { clearTimeout(pendingCommit); pendingCommit = null; }
  file.value = f;
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  const url = f ? URL.createObjectURL(f) : '';
  imageUrl.value = url;
  if (!f) { lifecycle.clear(); return; }
  void lifecycle.importImage(() => decodeImage(url)).catch(() => {
    message.error(t('tools.imageEditor.operationFailed'));
  });
}

function fitImage(img: HTMLImageElement) {
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
  { tool: 'text', icon: LetterT, labelKey: 'tools.imageEditor.toolText' },
  { tool: 'eraser', icon: Eraser, labelKey: 'tools.imageEditor.toolEraser' },
  { tool: 'mosaic', icon: GridDots, labelKey: 'tools.imageEditor.toolMosaic' },
];

function setTool(next: Tool) {
  if (operationBusy.value) return;
  activeTool.value = next;
}

// --- annotations + history ---------------------------------------------------

const annotations = ref<Annotation[]>([]);
const historyCanUndo = ref(false);
const historyCanRedo = ref(false);
const lifecycle = createImageEditorLifecycle<HTMLImageElement>({
  onChange(state) {
    operationBusy.value = state.busy;
    historyCanUndo.value = state.canUndo;
    historyCanRedo.value = state.canRedo;
    if (imageEl.value !== state.image) {
      imageEl.value = state.image;
      if (state.image) fitImage(state.image);
    }
    annotations.value = state.annotations;
    if (selectedId.value !== null && !state.annotations.some(a => a.id === selectedId.value)) {
      selectedId.value = null;
    }
  },
});
let nextId = 1;

const canUndoNow = computed(() => !operationBusy.value && (hasImageOperationChanges(previewOperation.value) || historyCanUndo.value));
const canRedoNow = computed(() => historyCanRedo.value);

const selected = computed(() => annotations.value.find((a) => a.id === selectedId.value) ?? null);
const selectedShape = computed(() => (selected.value?.type === 'shape' ? selected.value : null));
const selectedLine = computed(() => (selected.value?.type === 'line' ? selected.value : null));
const selectedNumber = computed(() => (selected.value?.type === 'number' ? selected.value : null));
const selectedPen = computed(() => (selected.value?.type === 'pen' ? selected.value : null));
const selectedText = computed(() => (selected.value?.type === 'text' ? selected.value : null));
const selectedMosaic = computed(() => (selected.value?.type === 'mosaic' ? selected.value : null));

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
  lifecycle.commitAnnotations(annotations.value);
}

/** Property edits (panel controls, handle drags) coalesce through this timer. */
function scheduleCommit() {
  if (operationBusy.value) return;
  if (pendingCommit) clearTimeout(pendingCommit);
  pendingCommit = setTimeout(() => {
    pendingCommit = null;
    pushHistory();
  }, 400);
}

function undoAction() {
  if (operationBusy.value) return;
  if (hasImageOperationChanges(previewOperation.value)) {
    previewOperation.value = null;
    operationsRef.value?.resetPreview();
    return;
  }
  operationsRef.value?.resetPreview();
  cropSelection.value = null;
  cropStart = null;
  cropResize = null;
  resizingCropHandle.value = null;
  hoveredCropHandle.value = null;
  previewOperation.value = null;
  pushHistory();
  lifecycle.undo();
}

function redoAction() {
  if (operationBusy.value) return;
  operationsRef.value?.resetPreview();
  cropSelection.value = null;
  cropStart = null;
  cropResize = null;
  resizingCropHandle.value = null;
  hoveredCropHandle.value = null;
  previewOperation.value = null;
  pushHistory();
  lifecycle.redo();
}

// --- annotation edits --------------------------------------------------------

function replaceAnnotation(id: number, next: Annotation) {
  if (operationBusy.value) return;
  annotations.value = annotations.value.map((a) => (a.id === id ? next : a));
}

function deleteSelected() {
  if (operationBusy.value) return;
  if (selectedId.value === null) return;
  annotations.value = annotations.value.filter((a) => a.id !== selectedId.value);
  selectedId.value = null;
  pushHistory();
}

function clearAll() {
  if (operationBusy.value) return;
  annotations.value = [];
  selectedId.value = null;
  activeTool.value = 'select';
  nextNumber.value = 1;
  pushHistory();
}

// --- eraser -------------------------------------------------------------------

/**
 * Deletes every annotation whose bounding region intersects the marquee.
 * One pushHistory per application so undo restores them all at once.
 */
function applyEraserRect(rect: BBox) {
  const before = annotations.value.length;
  annotations.value = annotations.value.filter((ann) => !bboxIntersects(annotationBBox(ann), rect));
  if (annotations.value.length !== before) {
    if (selectedId.value !== null && !annotations.value.some((a) => a.id === selectedId.value)) {
      selectedId.value = null;
    }
    pushHistory();
  }
}

/**
 * Deletes every annotation within `brushSize` of any trail segment.
 * One pushHistory per application so undo restores them all at once.
 */
function applyEraserBrush(trail: number[]) {
  const radius = eraserDefaults.value.brushSize;
  const before = annotations.value.length;
  annotations.value = annotations.value.filter((ann) => !brushHitsAnnotation(trail, radius, ann));
  if (annotations.value.length !== before) {
    if (selectedId.value !== null && !annotations.value.some((a) => a.id === selectedId.value)) {
      selectedId.value = null;
    }
    pushHistory();
  }
}

// --- draw defaults (params panel edits these while a drawing tool is active) ---

const shapeDefaults = ref({
  kind: 'rect' as ShapeAnnotation['kind'],
  stroke: '#ff0000',
  strokeWidth: 3,
  strokeStyle: 'solid' as StrokeStyle,
  fillEnabled: false,
  fill: '#ff0000',
  cornerRadius: 0,
});

const lineDefaults = ref({
  kind: 'straight' as LineAnnotation['kind'],
  stroke: '#ff0000',
  strokeWidth: 3,
  strokeStyle: 'solid' as StrokeStyle,
  startArrow: null as ArrowConfig | null,
  endArrow: null as ArrowConfig | null,
});

const penDefaults = ref({
  stroke: '#ff0000',
  strokeWidth: 3,
  strokeStyle: 'solid' as StrokeStyle,
});

const textDefaults = ref({
  text: '',
  color: '#ff0000',
  fontSize: 24,
  fontFamily: 'sans-serif',
  stroke: { enabled: false, color: '#000000', width: 1 },
  background: { enabled: false, color: '#ffffff', opacity: 0.8 },
});

const numberDefaults = ref({
  format: 'number' as NumberFormat,
  color: '#ff0000',
  size: 24,
  fontFamily: 'sans-serif',
  leaderStrokeWidth: 2,
  leaderStrokeStyle: 'solid' as StrokeStyle,
  leaderArrow: { style: 'triangle' as ArrowStyle, size: 10 },
});

const eraserDefaults = ref({ mode: 'rect' as 'rect' | 'brush', brushSize: 20 });

const mosaicDefaults = ref({ mode: 'rect' as 'rect' | 'brush', effect: 'mosaic' as 'mosaic' | 'blur', strength: 8, brushSize: 30 });

// Auto-increment counter for the number tool: starts at 1, bumps per placement,
// resets on clear-all and on format change. Deleting a badge never renumbers.
const nextNumber = ref(1);

// --- mosaic cache ---------------------------------------------------------------

/**
 * Offscreen source canvas at stage resolution, rebuilt when the image element
 * or stage size changes. `applyMosaic` draws from this canvas.
 */
const mosaicSourceCanvas = ref<HTMLCanvasElement | null>(null);

/** Per-annotation cache canvases, keyed by annotation id. */
const mosaicCache = new Map<number, HTMLCanvasElement>();

/** Rebuild the offscreen source canvas from the current image at stage resolution. */
function rebuildMosaicSource() {
  const img = imageEl.value;
  if (!img) {
    mosaicSourceCanvas.value = null;
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = stageWidth.value;
  canvas.height = stageHeight.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(img, 0, 0, stageWidth.value, stageHeight.value);
  mosaicSourceCanvas.value = canvas;
  // Source changed — every per-annotation cache is stale.
  mosaicCache.clear();
}

/** Rebuild (or invalidate) the cache for one mosaic annotation. */
function rebuildMosaicCache(ann: MosaicAnnotation) {
  const src = mosaicSourceCanvas.value;
  if (!src) return;
  mosaicCache.set(ann.id, applyMosaic(
    src, ann.region, ann.effect, ann.strength, stageWidth.value, stageHeight.value,
  ));
}

/** Cache canvas for a mosaic annotation (null when the source is not ready). */
function mosaicCanvasFor(ann: MosaicAnnotation): HTMLCanvasElement | null {
  return mosaicCache.get(ann.id) ?? null;
}

// Rebuild the source canvas when the image or stage size changes.
watch([imageEl, stageWidth, stageHeight], rebuildMosaicSource, { flush: 'post' });

// Rebuild a mosaic annotation's cache when its region/effect/strength changes.
watch(
  annotations,
  () => {
    for (const ann of annotations.value) {
      if (ann.type !== 'mosaic') continue;
      const cached = mosaicCache.get(ann.id);
      if (!cached) {
        rebuildMosaicCache(ann);
      }
    }
  },
  { deep: true, flush: 'post' },
);

// --- stage interactions ------------------------------------------------------

const stageRef = ref<KonvaComponentRef | null>(null);

function stageNode(): unknown {
  return stageRef.value?.getNode() ?? null;
}

/** In-progress shape drag (normalised on mouseup via `rectFromPoints`). */
const shapeDraft = ref<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
/** In-progress straight-line drag. */
const lineDraft = ref<number[] | null>(null);
/** In-progress polyline vertices (absolute stage coordinates). */
const polylineDraft = ref<number[]>([]);
/** In-progress freehand pen trail (absolute stage coordinates). */
const penDraft = ref<number[] | null>(null);
/** In-progress leader-line drag: badge centre plus current pointer position. */
const leaderDraft = ref<number[] | null>(null);
/** In-progress eraser marquee drag (normalised on mouseup via `rectFromPoints`). */
const eraserDraft = ref<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
/** In-progress eraser brush trail (absolute stage coordinates). */
const eraserTrail = ref<number[] | null>(null);
/** Pointer position for the brush-mode cursor preview. */
const eraserPointer = ref<{ x: number; y: number } | null>(null);
/** In-progress mosaic marquee drag (normalised on mouseup via `rectFromPoints`). */
const mosaicDraft = ref<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
/** In-progress mosaic brush trail (absolute stage coordinates). */
const mosaicTrail = ref<number[] | null>(null);
/** Pointer position for the mosaic brush-mode cursor preview. */
const mosaicPointer = ref<{ x: number; y: number } | null>(null);

const shapeDraftRect = computed(() => {
  const d = shapeDraft.value;
  if (!d) return null;
  return rectFromPoints(d.x1, d.y1, d.x2, d.y2);
});

const eraserDraftRect = computed(() => {
  const d = eraserDraft.value;
  if (!d) return null;
  return rectFromPoints(d.x1, d.y1, d.x2, d.y2);
});

const mosaicDraftRect = computed(() => {
  const d = mosaicDraft.value;
  if (!d) return null;
  return rectFromPoints(d.x1, d.y1, d.x2, d.y2);
});

// --- eraser hit-testing ------------------------------------------------------

interface BBox { x: number; y: number; width: number; height: number }

function pointsBBox(points: number[]): BBox {
  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  for (let i = 0; i < points.length; i += 2) {
    minX = Math.min(minX, points[i]);
    minY = Math.min(minY, points[i + 1]);
    maxX = Math.max(maxX, points[i]);
    maxY = Math.max(maxY, points[i + 1]);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Approximate bounding box of an annotation, padded by its visual extent. */
function annotationBBox(ann: Annotation): BBox {
  if (ann.type === 'shape') {
    return { x: ann.x, y: ann.y, width: ann.width, height: ann.height };
  }
  if (ann.type === 'line' || ann.type === 'pen') {
    const box = pointsBBox(ann.points);
    const pad = ann.strokeWidth / 2;
    return { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 };
  }
  if (ann.type === 'number') {
    const r = numberBadgeRadius(ann);
    const box: BBox = { x: ann.x - r, y: ann.y - r, width: r * 2, height: r * 2 };
    if (ann.leaderLine?.enabled) {
      const [, , tx, ty] = ann.leaderLine.points;
      const x2 = Math.max(ann.x + r, tx);
      const y2 = Math.max(ann.y + r, ty);
      box.x = Math.min(box.x, tx);
      box.y = Math.min(box.y, ty);
      box.width = x2 - box.x;
      box.height = y2 - box.y;
    }
    return box;
  }
  if (ann.type === 'text') {
    const size = textSize(ann);
    return {
      x: ann.x - size.width / 2,
      y: ann.y - size.height / 2,
      width: size.width,
      height: size.height,
    };
  }
  // mosaic
  if (ann.region.kind === 'rect') {
    return { x: ann.region.x, y: ann.region.y, width: ann.region.width, height: ann.region.height };
  }
  const box = pointsBBox(ann.region.points);
  const pad = ann.region.brushSize / 2;
  return { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 };
}

function bboxIntersects(a: BBox, b: BBox): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x
    && a.y < b.y + b.height && a.y + a.height > b.y;
}

/** Sample points along an annotation's outline for brush distance checks. */
function annotationSamplePoints(ann: Annotation): number[] {
  if (ann.type === 'shape') {
    if (ann.kind === 'rect') {
      const { x, y, width, height } = ann;
      return [x, y, x + width, y, x + width, y + height, x, y + height,
        x + width / 2, y, x + width / 2, y + height,
        x, y + height / 2, x + width, y + height / 2];
    }
    const cx = ann.x + ann.width / 2;
    const cy = ann.y + ann.height / 2;
    const rx = ann.width / 2;
    const ry = ann.height / 2;
    const pts: number[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      pts.push(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
    }
    return pts;
  }
  if (ann.type === 'line' || ann.type === 'pen') return ann.points;
  if (ann.type === 'number') {
    const pts = [ann.x, ann.y];
    if (ann.leaderLine?.enabled) {
      pts.push(ann.leaderLine.points[2], ann.leaderLine.points[3]);
    }
    return pts;
  }
  if (ann.type === 'text') return [ann.x, ann.y];
  // mosaic
  if (ann.region.kind === 'rect') {
    const { x, y, width, height } = ann.region;
    return [x, y, x + width, y + height, x + width / 2, y + height / 2];
  }
  return ann.region.points;
}

/**
 * Whether a brush trail (polyline) passes within `radius` of an annotation.
 * Tests each trail segment against the annotation's sample points and its
 * bounding-box corners, so both thin strokes and filled regions are caught.
 */
function brushHitsAnnotation(trail: number[], radius: number, ann: Annotation): boolean {
  const samples = annotationSamplePoints(ann);
  const box = annotationBBox(ann);
  const allPts = [...samples,
    box.x, box.y, box.x + box.width, box.y,
    box.x + box.width, box.y + box.height, box.x, box.y + box.height];
  for (let i = 0; i < trail.length - 2; i += 2) {
    const x1 = trail[i]; const y1 = trail[i + 1];
    const x2 = trail[i + 2]; const y2 = trail[i + 3];
    for (let j = 0; j < allPts.length; j += 2) {
      if (distToSegment(allPts[j], allPts[j + 1], x1, y1, x2, y2) <= radius) return true;
    }
  }
  return false;
}

/** Wheel over the stage adjusts the active brush size (eraser or mosaic, brush mode only). */
function onStageWheel(e: WheelEvent) {
  const delta = e.deltaY < 0 ? 2 : -2;
  if (activeTool.value === 'eraser' && eraserDefaults.value.mode === 'brush') {
    e.preventDefault();
    eraserDefaults.value.brushSize = Math.min(100, Math.max(4, eraserDefaults.value.brushSize + delta));
    return;
  }
  if (activeTool.value === 'mosaic' && mosaicDefaults.value.mode === 'brush') {
    e.preventDefault();
    mosaicDefaults.value.brushSize = Math.min(100, Math.max(4, mosaicDefaults.value.brushSize + delta));
  }
}

const parameterTool = computed(() => activeTool.value === 'select' ? selected.value?.type ?? null : activeTool.value);

/** The annotation the params panel edits; drawing tools fall back to defaults. */
const editingShape = computed(() =>
  parameterTool.value === 'shape' ? selectedShape.value : null);
const editingLine = computed(() =>
  parameterTool.value === 'line' ? selectedLine.value : null);
const editingNumber = computed(() =>
  parameterTool.value === 'number' ? selectedNumber.value : null);
const editingPen = computed(() =>
  parameterTool.value === 'pen' ? selectedPen.value : null);
const editingText = computed(() =>
  parameterTool.value === 'text' ? selectedText.value : null);

function pointerPosition(e: KonvaPointerEvent): { x: number; y: number } | null {
  return e.target.getStage().getPointerPosition();
}

/**
 * Konva synthesises dblclick from two rapid mousedown/mouseup pairs at the
 * same position. During polyline drawing a single click adds a vertex; a
 * double-click (two clicks at the same spot) finishes. Clicks at different
 * positions always count as separate vertices, no matter how fast they come.
 */
const DBLCLICK_MS = 300;
const DBLCLICK_DIST = 5;
let lastClick: { x: number; y: number; time: number } | null = null;

// --- inline text editing -----------------------------------------------------
// Text is typed straight onto the canvas: a click in text mode (or a double
// click on an existing text) opens a floating textarea at that point, and the
// annotation is created/updated only when the user commits with Enter or blur.
// Esc discards. The box lives in stage coordinates inside a relative wrapper.

interface TextEditState {
  x: number;
  y: number;
  text: string;
  /** Null when creating a new annotation; otherwise the id being re-edited. */
  annotationId: number | null;
}

const textEdit = ref<TextEditState | null>(null);
const textEditInput = ref<HTMLTextAreaElement | null>(null);

watch(textEdit, (state) => {
  if (state) {
    requestAnimationFrame(() => textEditInput.value?.focus());
  }
});

function openTextEdit(x: number, y: number, annotationId: number | null, initial = '') {
  textEdit.value = { x, y, text: initial, annotationId };
}

function commitTextEdit() {
  if (operationBusy.value) return;
  const edit = textEdit.value;
  if (!edit) return;
  textEdit.value = null;
  const content = edit.text.trim();
  if (!content) return;
  if (edit.annotationId === null) {
    const d = textDefaults.value;
    const annotation: TextAnnotation = {
      id: nextId++,
      type: 'text',
      x: edit.x,
      y: edit.y,
      text: content,
      fontSize: d.fontSize,
      color: d.color,
      fontFamily: d.fontFamily,
      rotation: 0,
      stroke: { ...d.stroke },
      background: { ...d.background },
    };
    annotations.value = [...annotations.value, annotation];
    pushHistory();
    // Select the new text and switch to the select tool so it can be dragged
    // or rotated immediately without a second click.
    selectedId.value = annotation.id;
    activeTool.value = 'select';
  } else {
    const target = annotations.value.find((a) => a.id === edit.annotationId);
    if (target && target.type === 'text' && target.text !== content) {
      replaceAnnotation(target.id, { ...target, text: content });
      scheduleCommit();
    }
  }
}

function cancelTextEdit() {
  textEdit.value = null;
}

function onTextDblClick(annotation: TextAnnotation) {
  if (operationBusy.value) return;
  if (activeTool.value !== 'select') return;
  openTextEdit(annotation.x, annotation.y, annotation.id, annotation.text);
}

function onStageClick(e: KonvaPointerEvent) {
  if (operationBusy.value) return;
  if (colorPicking.value) { onPickCanvasClick(e); return; }
  if (editorTab.value !== 'annotate' || watermarkMode.value) return;
  if (activeTool.value === 'line' && lineDefaults.value.kind === 'polyline') {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    const now = Date.now();
    if (lastClick
      && now - lastClick.time < DBLCLICK_MS
      && Math.hypot(pointer.x - lastClick.x, pointer.y - lastClick.y) < DBLCLICK_DIST) {
      // Second half of a double-click: finish without adding a vertex.
      lastClick = null;
      finishPolyline();
      return;
    }
    lastClick = { x: pointer.x, y: pointer.y, time: now };
    polylineDraft.value = [...polylineDraft.value, pointer.x, pointer.y];
    return;
  }
  if (activeTool.value === 'select') {
    if (e.target === stageNode() || e.target.name() === 'image-editor-background') selectedId.value = null;
    return;
  }
  if (activeTool.value === 'text') {
    // Annotation clicks stop bubbling (see onAnnotationClick), so reaching
    // here means the background — which is covered by the base image, not
    // the stage node itself. Open an inline editor at the click point; the
    // annotation is only created once the user commits (Enter/blur).
    const pointer = pointerPosition(e);
    if (!pointer) return;
    openTextEdit(pointer.x, pointer.y, null);
    return;
  }
}

function finishPolyline() {
  if (operationBusy.value) return;
  lastClick = null;
  const pts = polylineDraft.value;
  polylineDraft.value = [];
  if (pts.length >= 6) {
    annotations.value = [
      ...annotations.value,
      {
        id: nextId++,
        type: 'line',
        kind: 'polyline',
        points: pts,
        stroke: lineDefaults.value.stroke,
        strokeWidth: lineDefaults.value.strokeWidth,
        strokeStyle: lineDefaults.value.strokeStyle,
        startArrow: lineDefaults.value.startArrow,
        endArrow: lineDefaults.value.endArrow,
      },
    ];
    pushHistory();
  } else if (pts.length === 4) {
    // Two clicks make a straight line, not a polyline.
    annotations.value = [
      ...annotations.value,
      {
        id: nextId++,
        type: 'line',
        kind: 'straight',
        points: pts,
        stroke: lineDefaults.value.stroke,
        strokeWidth: lineDefaults.value.strokeWidth,
        strokeStyle: lineDefaults.value.strokeStyle,
        startArrow: lineDefaults.value.startArrow,
        endArrow: lineDefaults.value.endArrow,
      },
    ];
    pushHistory();
  }
}

/**
 * Places a numbered badge at the pointer. When the leader line is enabled the
 * same press-drag-release gesture aims the leader from the badge to the arrow
 * tip, so the badge is created immediately and the drag only fills the leader.
 */
function placeNumber(x: number, y: number) {
  const d = numberDefaults.value;
  const annotation: NumberAnnotation = {
    id: nextId++,
    type: 'number',
    x,
    y,
    value: nextNumber.value,
    format: d.format,
    color: d.color,
    size: d.size,
    fontFamily: d.fontFamily,
    leaderLine: null,
  };
  annotations.value = [...annotations.value, annotation];
  nextNumber.value += 1;
  selectedId.value = annotation.id;
  pushHistory();
  leaderDraft.value = [x, y, x, y];
}

function onStageMouseDown(e: KonvaPointerEvent) {
  if (operationBusy.value) return;
  if (colorPicking.value) return;
  if (cropEnabled.value && imageEl.value && !operationBusy.value) {
    const pointer = cropImagePointer(e);
    if (!pointer) return;
    cropStart = pointer;
    cropSelection.value = null;
    return;
  }
  if (editorTab.value !== 'annotate' || watermarkMode.value) return;
  if (activeTool.value === 'shape') {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    shapeDraft.value = { x1: pointer.x, y1: pointer.y, x2: pointer.x, y2: pointer.y };
    return;
  }
  if (activeTool.value === 'line' && lineDefaults.value.kind === 'straight') {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    lineDraft.value = [pointer.x, pointer.y, pointer.x, pointer.y];
    return;
  }
  if (activeTool.value === 'pen') {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    penDraft.value = [pointer.x, pointer.y];
  }
  if (activeTool.value === 'number') {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    placeNumber(pointer.x, pointer.y);
  }
  if (activeTool.value === 'eraser') {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    if (eraserDefaults.value.mode === 'rect') {
      eraserDraft.value = { x1: pointer.x, y1: pointer.y, x2: pointer.x, y2: pointer.y };
    } else {
      eraserTrail.value = [pointer.x, pointer.y];
    }
  }
  if (activeTool.value === 'mosaic') {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    if (mosaicDefaults.value.mode === 'rect') {
      mosaicDraft.value = { x1: pointer.x, y1: pointer.y, x2: pointer.x, y2: pointer.y };
    } else {
      mosaicTrail.value = [pointer.x, pointer.y];
    }
  }
}

function onStageMouseMove(e: KonvaPointerEvent) {
  if (operationBusy.value) return;
  if (colorPicking.value) return;
  if (cropResize && cropEnabled.value && imageEl.value) {
    const pointer = cropImagePointer(e);
    if (pointer) cropSelection.value = resizeCrop(cropResize.rect, cropResize.handle, pointer, { width: imageEl.value.naturalWidth, height: imageEl.value.naturalHeight }, cropRatio.value);
    return;
  }
  if (cropStart && cropEnabled.value && imageEl.value) {
    const pointer = cropImagePointer(e);
    if (pointer) cropSelection.value = cropFromDrag(cropStart, pointer, { width: imageEl.value.naturalWidth, height: imageEl.value.naturalHeight }, cropRatio.value);
    return;
  }
  if (editorTab.value !== 'annotate' || watermarkMode.value) return;
  if (shapeDraft.value) {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    shapeDraft.value = { ...shapeDraft.value, x2: pointer.x, y2: pointer.y };
    return;
  }
  if (lineDraft.value) {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    lineDraft.value = [lineDraft.value[0], lineDraft.value[1], pointer.x, pointer.y];
    return;
  }
  if (penDraft.value) {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    const pts = penDraft.value;
    const lx = pts[pts.length - 2];
    const ly = pts[pts.length - 1];
    // Skip sub-pixel jitter so the trail stays dense but not bloated.
    if (Math.hypot(pointer.x - lx, pointer.y - ly) >= 1) {
      penDraft.value = [...pts, pointer.x, pointer.y];
    }
    return;
  }
  if (leaderDraft.value) {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    leaderDraft.value = [leaderDraft.value[0], leaderDraft.value[1], pointer.x, pointer.y];
  }
  if (activeTool.value === 'eraser' && eraserDefaults.value.mode === 'brush') {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    eraserPointer.value = { x: pointer.x, y: pointer.y };
    if (eraserTrail.value) {
      const pts = eraserTrail.value;
      const lx = pts[pts.length - 2];
      const ly = pts[pts.length - 1];
      if (Math.hypot(pointer.x - lx, pointer.y - ly) >= 1) {
        eraserTrail.value = [...pts, pointer.x, pointer.y];
      }
    }
  }
  if (mosaicDraft.value) {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    mosaicDraft.value = { ...mosaicDraft.value, x2: pointer.x, y2: pointer.y };
    return;
  }
  if (activeTool.value === 'mosaic' && mosaicDefaults.value.mode === 'brush') {
    const pointer = pointerPosition(e);
    if (!pointer) return;
    mosaicPointer.value = { x: pointer.x, y: pointer.y };
    if (mosaicTrail.value) {
      const pts = mosaicTrail.value;
      const lx = pts[pts.length - 2];
      const ly = pts[pts.length - 1];
      if (Math.hypot(pointer.x - lx, pointer.y - ly) >= 1) {
        mosaicTrail.value = [...pts, pointer.x, pointer.y];
      }
    }
  }
}

function onStageMouseUp() {
  if (operationBusy.value) return;
  if (cropResize) { cropResize = null;
  resizingCropHandle.value = null;
  hoveredCropHandle.value = null; return; }
  if (cropStart) {
    cropStart = null;
  cropResize = null;
  resizingCropHandle.value = null;
  hoveredCropHandle.value = null;
    if (cropSelection.value && (cropSelection.value.width < 1 || cropSelection.value.height < 1)) cropSelection.value = null;
    return;
  }
  if (shapeDraft.value) {
    const rect = shapeDraftRect.value;
    shapeDraft.value = null;
    if (rect && rect.width >= 2 && rect.height >= 2) {
      annotations.value = [
        ...annotations.value,
        {
          id: nextId++,
          type: 'shape',
          kind: shapeDefaults.value.kind,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          rotation: 0,
          stroke: shapeDefaults.value.stroke,
          strokeWidth: shapeDefaults.value.strokeWidth,
          strokeStyle: shapeDefaults.value.strokeStyle,
          fillEnabled: shapeDefaults.value.fillEnabled,
          fill: shapeDefaults.value.fill,
          cornerRadius: shapeDefaults.value.kind === 'rect' ? shapeDefaults.value.cornerRadius : 0,
        },
      ];
      pushHistory();
    }
    return;
  }
  if (lineDraft.value) {
    const pts = lineDraft.value;
    lineDraft.value = null;
    if (Math.hypot(pts[2] - pts[0], pts[3] - pts[1]) >= 2) {
      annotations.value = [
        ...annotations.value,
        {
          id: nextId++,
          type: 'line',
          kind: 'straight',
          points: pts,
          stroke: lineDefaults.value.stroke,
          strokeWidth: lineDefaults.value.strokeWidth,
          strokeStyle: lineDefaults.value.strokeStyle,
          startArrow: lineDefaults.value.startArrow,
          endArrow: lineDefaults.value.endArrow,
        },
      ];
      pushHistory();
    }
    return;
  }
  if (penDraft.value) {
    const pts = penDraft.value;
    penDraft.value = null;
    // A pen click without travel is a dot, not a stroke.
    if (pts.length >= 4) {
      annotations.value = [
        ...annotations.value,
        {
          id: nextId++,
          type: 'pen',
          points: pts,
          stroke: penDefaults.value.stroke,
          strokeWidth: penDefaults.value.strokeWidth,
          strokeStyle: penDefaults.value.strokeStyle,
        },
      ];
      pushHistory();
    }
    return;
  }
  if (leaderDraft.value) {
    const pts = leaderDraft.value;
    leaderDraft.value = null;
    // A leader shorter than the badge radius is a plain badge, not a leader.
    if (Math.hypot(pts[2] - pts[0], pts[3] - pts[1]) >= 8) {
      const badge = annotations.value.find((a) => a.id === selectedId.value);
      if (badge && badge.type === 'number') {
        replaceAnnotation(badge.id, {
          ...badge,
          leaderLine: {
            enabled: true,
            points: [pts[0], pts[1], pts[2], pts[3]],
            strokeWidth: numberDefaults.value.leaderStrokeWidth,
            strokeStyle: numberDefaults.value.leaderStrokeStyle,
            arrow: { ...numberDefaults.value.leaderArrow },
          },
        });
        pushHistory();
      }
    }
  }
  if (eraserDraft.value) {
    const rect = eraserDraftRect.value;
    eraserDraft.value = null;
    if (rect && rect.width >= 2 && rect.height >= 2) {
      applyEraserRect(rect);
    }
    return;
  }
  if (eraserTrail.value) {
    const trail = eraserTrail.value;
    eraserTrail.value = null;
    applyEraserBrush(trail);
    return;
  }
  if (mosaicDraft.value) {
    const rect = mosaicDraftRect.value;
    mosaicDraft.value = null;
    if (rect && rect.width >= 2 && rect.height >= 2) {
      const ann: MosaicAnnotation = {
        id: nextId++,
        type: 'mosaic',
        region: {
          kind: 'rect',
          x: rect.x / stageWidth.value,
          y: rect.y / stageHeight.value,
          width: rect.width / stageWidth.value,
          height: rect.height / stageHeight.value,
        },
        effect: mosaicDefaults.value.effect,
        strength: mosaicDefaults.value.strength,
      };
      annotations.value = [...annotations.value, ann];
      rebuildMosaicCache(ann);
      pushHistory();
    }
    return;
  }
  if (mosaicTrail.value) {
    const trail = mosaicTrail.value;
    mosaicTrail.value = null;
    if (trail.length >= 4) {
      const ann: MosaicAnnotation = {
        id: nextId++,
        type: 'mosaic',
        region: {
          kind: 'path',
          points: trail.flatMap((v, i) => (i % 2 === 0 ? v / stageWidth.value : v / stageHeight.value)),
          brushSize: mosaicDefaults.value.brushSize,
        },
        effect: mosaicDefaults.value.effect,
        strength: mosaicDefaults.value.strength,
      };
      annotations.value = [...annotations.value, ann];
      rebuildMosaicCache(ann);
      pushHistory();
    }
    return;
  }
}

/**
 * Clicks on an annotation must not reach the stage, which would draw a new one.
 * Every tool mode selects the clicked annotation and hops to the select tool,
 * so an existing annotation can be adjusted without first switching manually.
 */
function onAnnotationClick(annotation: Annotation, e: KonvaPointerEvent) {
  e.cancelBubble = true;
  selectedId.value = annotation.id;
  activeTool.value = 'select';
}

/** Selection and dragging are the select tool's job, so drawing modes stay inert. */
const canManipulate = computed(() => activeTool.value === 'select');

// Konva reports a dragged shape as the node's absolute position (model
// position plus travel); the delta is recovered by subtracting the model
// position, then the node is reset so the re-render starts from (0, 0).
function onShapeDragEnd(annotation: ShapeAnnotation, e: KonvaPointerEvent) {
  const dx = e.target.x() - annotation.x;
  const dy = e.target.y() - annotation.y;
  if (dx === 0 && dy === 0) return;
  e.target.position({ x: 0, y: 0 });
  replaceAnnotation(annotation.id, {
    ...annotation,
    x: annotation.x + dx,
    y: annotation.y + dy,
  });
  pushHistory();
}

// Same fold-in for lines: the annotation stores absolute points, so the
// travel is folded into the points and the node reset.
function onLineDragEnd(annotation: LineAnnotation, e: KonvaPointerEvent) {
  const dx = e.target.x();
  const dy = e.target.y();
  if (dx === 0 && dy === 0) return;
  e.target.position({ x: 0, y: 0 });
  replaceAnnotation(annotation.id, {
    ...annotation,
    points: annotation.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy)),
  });
  pushHistory();
}

// Pens store absolute points too, so a drag folds travel into the trail.
function onPenDragEnd(annotation: PenAnnotation, e: KonvaPointerEvent) {
  const dx = e.target.x();
  const dy = e.target.y();
  if (dx === 0 && dy === 0) return;
  e.target.position({ x: 0, y: 0 });
  replaceAnnotation(annotation.id, {
    ...annotation,
    points: annotation.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy)),
  });
  pushHistory();
}

// Text stores its anchor position; a drag shifts the anchor by the travel.
function onTextDragEnd(annotation: TextAnnotation, e: KonvaPointerEvent) {
  const dx = e.target.x() - annotation.x;
  const dy = e.target.y() - annotation.y;
  if (dx === 0 && dy === 0) return;
  e.target.position({ x: annotation.x, y: annotation.y });
  replaceAnnotation(annotation.id, { ...annotation, x: annotation.x + dx, y: annotation.y + dy });
  pushHistory();
}

// A number badge anchors at its centre; dragging shifts the badge and the
// leader line's start point follows so the arrow keeps pointing where aimed.
function onNumberDragEnd(annotation: NumberAnnotation, e: KonvaPointerEvent) {
  const dx = e.target.x() - annotation.x;
  const dy = e.target.y() - annotation.y;
  if (dx === 0 && dy === 0) return;
  e.target.position({ x: annotation.x, y: annotation.y });
  const leaderLine = annotation.leaderLine
    ? {
        ...annotation.leaderLine,
        points: [
          annotation.leaderLine.points[0] + dx,
          annotation.leaderLine.points[1] + dy,
          annotation.leaderLine.points[2],
          annotation.leaderLine.points[3],
        ] as [number, number, number, number],
      }
    : null;
  replaceAnnotation(annotation.id, {
    ...annotation,
    x: annotation.x + dx,
    y: annotation.y + dy,
    leaderLine,
  });
  pushHistory();
}

/**
 * Mosaic regions store normalised coordinates; a drag folds the pixel travel
 * into the region and the cache is rebuilt from the moved region.
 */
function onMosaicDragEnd(annotation: MosaicAnnotation, e: KonvaPointerEvent) {
  const dx = e.target.x();
  const dy = e.target.y();
  if (dx === 0 && dy === 0) return;
  e.target.position({ x: 0, y: 0 });
  const sx = dx / stageWidth.value;
  const sy = dy / stageHeight.value;
  let region: MosaicAnnotation['region'];
  if (annotation.region.kind === 'rect') {
    region = {
      ...annotation.region,
      x: annotation.region.x + sx,
      y: annotation.region.y + sy,
    };
  } else {
    region = {
      ...annotation.region,
      points: annotation.region.points.map((v, i) => (i % 2 === 0 ? v + sx : v + sy)),
    };
  }
  const next = { ...annotation, region };
  replaceAnnotation(annotation.id, next);
  mosaicCache.delete(annotation.id);
  rebuildMosaicCache(next);
  pushHistory();
}

// --- text rotation handle ----------------------------------------------------

const TEXT_BG_PADDING = 4;

/**
 * Measured size of a text annotation's Konva node, so the background rect
 * can sit exactly behind the glyphs. Falls back to a canvas-2d measurement
 * before the node has been rendered (e.g. first placement).
 */
function textSize(annotation: TextAnnotation): { width: number; height: number } {
  const node = shapeNode(annotation.id);
  if (node) {
    const w = node.width();
    const h = node.height();
    if (w > 0 && h > 0) return { width: w, height: h };
  }
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return { width: annotation.text.length * annotation.fontSize * 0.6, height: annotation.fontSize };
  ctx.font = `${annotation.fontSize}px ${annotation.fontFamily}`;
  return { width: ctx.measureText(annotation.text).width, height: annotation.fontSize * 1.2 };
}

/** Background rect config for a text annotation (null when disabled). */
function textBackgroundRect(annotation: TextAnnotation) {
  if (!annotation.background?.enabled) return null;
  const size = textSize(annotation);
  const pad = TEXT_BG_PADDING;
  return {
    x: annotation.x - pad,
    y: annotation.y - pad,
    width: size.width + pad * 2,
    height: size.height + pad * 2,
    rotation: annotation.rotation,
    offsetX: size.width / 2,
    offsetY: size.height / 2,
    fill: annotation.background.color,
    opacity: annotation.background.opacity,
    listening: false,
  };
}

/** Centre of the rendered text, in stage coordinates (rotation pivot). */
function textCentre(annotation: TextAnnotation): { x: number; y: number } {
  // The node anchors at (x, y) with its centre as offset, so the centre in
  // stage space is the anchor itself.
  return { x: annotation.x, y: annotation.y };
}

/**
 * The rotation handle sits above the text's bounding box, on the line from
 * the text centre through its top edge (i.e. unrotated "up"), so it tracks
 * the current rotation.
 */
const textRotationHandle = computed(() => {
  const text = selectedText.value;
  if (!text || activeTool.value !== 'select') return null;
  const centre = textCentre(text);
  const size = textSize(text);
  const distance = size.height / 2 + 28;
  const rad = (text.rotation - 90) * (Math.PI / 180);
  return {
    x: centre.x + distance * Math.cos(rad),
    y: centre.y + distance * Math.sin(rad),
  };
});

function onRotationHandleDrag(e: KonvaPointerEvent) {
  const text = selectedText.value;
  if (!text) return;
  const centre = textCentre(text);
  // atan2 with the -90° bias: handle directly "above" an unrotated text is
  // angle -90°, which maps to rotation 0.
  const degrees = Math.atan2(e.target.y() - centre.y, e.target.x() - centre.x) * 180 / Math.PI + 90;
  const normalised = ((degrees % 360) + 360) % 360;
  replaceAnnotation(text.id, { ...text, rotation: Math.round(normalised) });
}

function onRotationHandleDragEnd() {
  pushHistory();
}

/** Endpoint (straight) / vertex (polyline) handles for the selected line. */
const lineHandlePositions = computed(() => {
  const line = selectedLine.value;
  if (!line || activeTool.value !== 'select') return [];
  const out: Array<{ index: number; x: number; y: number }> = [];
  for (let i = 0; i < line.points.length; i += 2) {
    out.push({ index: i / 2, x: line.points[i], y: line.points[i + 1] });
  }
  return out;
});

function onLineHandleDrag(line: LineAnnotation, index: number, e: KonvaPointerEvent) {
  const points = [...line.points];
  points[index * 2] = e.target.x();
  points[index * 2 + 1] = e.target.y();
  replaceAnnotation(line.id, { ...line, points });
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

const transformerConfig = computed(() => ({
  resizeEnabled: false,
  rotateEnabled: false,
  enabledAnchors: [],
  borderStroke: primaryColor.value,
  borderDash: [4, 4],
  borderWidth: 1,
  padding: 4,
}));

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
  if (operationBusy.value) return;
  if (colorPicking.value && event.key === 'Escape') { cancelColorPicking(); event.preventDefault(); return; }
  // Typing keeps the browser's own undo: only page-level shortcuts are taken.
  if (isEditableTarget(event.target)) return;
  if (event.key === 'Escape') {
    if (polylineDraft.value.length > 0) {
      event.preventDefault();
      lastClick = null;
      polylineDraft.value = [];
    }
    return;
  }
  if (event.key === 'Enter') {
    if (activeTool.value === 'line' && lineDefaults.value.kind === 'polyline'
      && polylineDraft.value.length > 0) {
      event.preventDefault();
      finishPolyline();
    }
    return;
  }
  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (selectedId.value === null) return;
    event.preventDefault();
    deleteSelected();
    return;
  }
  if (!event.ctrlKey && !event.metaKey) return;
  if (operationBusy.value) return;
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

function traceLinePath(ctx: CanvasRenderingContext2D, points: number[],
  scaleX: number, scaleY: number) {
  ctx.beginPath();
  ctx.moveTo(points[0] * scaleX, points[1] * scaleY);
  for (let i = 2; i < points.length; i += 2) {
    ctx.lineTo(points[i] * scaleX, points[i + 1] * scaleY);
  }
}

/**
 * Smooth trail through the pen points (quadratic curves across segment
 * midpoints), approximating Konva's tension spline on the export canvas.
 */
function tracePenPath(ctx: CanvasRenderingContext2D, points: number[],
  scaleX: number, scaleY: number) {
  const pts = points.map((v, i) => (i % 2 === 0 ? v * scaleX : v * scaleY));
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  if (pts.length === 4) {
    ctx.lineTo(pts[2], pts[3]);
    return;
  }
  for (let i = 2; i < pts.length - 2; i += 2) {
    const mx = (pts[i] + pts[i + 2]) / 2;
    const my = (pts[i + 1] + pts[i + 3]) / 2;
    ctx.quadraticCurveTo(pts[i], pts[i + 1], mx, my);
  }
  const n = pts.length;
  ctx.lineTo(pts[n - 2], pts[n - 1]);
}

function drawArrowHeads(ctx: CanvasRenderingContext2D, line: LineAnnotation,
  scaleX: number, scaleY: number) {
  const pts = line.points;
  const [sx, sy] = [pts[0], pts[1]];
  const [ex, ey] = [pts[pts.length - 2], pts[pts.length - 1]];
  const ends: Array<[ArrowConfig | null, number, number, number, number]> = [
    [line.startArrow, ex, ey, sx, sy],
    [line.endArrow, sx, sy, ex, ey],
  ];
  for (const [cfg, x1, y1, x2, y2] of ends) {
    if (!cfg || cfg.style === 'none') continue;
    const head = arrowPoints(x1 * scaleX, y1 * scaleY, x2 * scaleX, y2 * scaleY, cfg);
    if (head.length < 4) continue;
    ctx.beginPath();
    ctx.moveTo(head[0], head[1]);
    for (let i = 2; i < head.length; i += 2) ctx.lineTo(head[i], head[i + 1]);
    if (cfg.style === 'open') {
      ctx.stroke();
    } else {
      ctx.closePath();
      ctx.fill();
    }
  }
}

function createCanvas(includePreview = true): HTMLCanvasElement | null {
  if (includePreview && previewOperation.value) {
    const source = createCanvas(false);
    return source ? transformCanvas(source, previewOperation.value) : null;
  }
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
    if (ann.type === 'shape') {
      ctx.save();
      ctx.strokeStyle = ann.stroke;
      ctx.lineWidth = ann.strokeWidth * scaleX;
      ctx.setLineDash(strokeDash(ann.strokeStyle, ann.strokeWidth * scaleX));
      if (ann.fillEnabled) ctx.fillStyle = ann.fill;
      const x = ann.x * scaleX;
      const y = ann.y * scaleY;
      const w = ann.width * scaleX;
      const h = ann.height * scaleY;
      ctx.beginPath();
      if (ann.kind === 'rect') {
        const r = Math.min(ann.cornerRadius * scaleX, w / 2, h / 2);
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      }
      if (ann.fillEnabled) ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (ann.type === 'line') {
      ctx.save();
      ctx.strokeStyle = ann.stroke;
      ctx.lineWidth = ann.strokeWidth * scaleX;
      ctx.setLineDash(strokeDash(ann.strokeStyle, ann.strokeWidth * scaleX));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      traceLinePath(ctx, ann.points, scaleX, scaleY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = ann.stroke;
      ctx.strokeStyle = ann.stroke;
      drawArrowHeads(ctx, ann, scaleX, scaleY);
      ctx.restore();
    } else if (ann.type === 'pen') {
      ctx.save();
      ctx.strokeStyle = ann.stroke;
      ctx.lineWidth = ann.strokeWidth * scaleX;
      ctx.setLineDash(strokeDash(ann.strokeStyle, ann.strokeWidth * scaleX));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      tracePenPath(ctx, ann.points, scaleX, scaleY);
      ctx.stroke();
      ctx.restore();
    } else if (ann.type === 'text') {
      const size = textSize(ann);
      ctx.save();
      ctx.translate(ann.x * scaleX, ann.y * scaleY);
      ctx.rotate((ann.rotation * Math.PI) / 180);
      if (ann.background?.enabled) {
        const pad = TEXT_BG_PADDING * scaleX;
        ctx.globalAlpha = ann.background.opacity;
        ctx.fillStyle = ann.background.color;
        ctx.fillRect(-size.width * scaleX / 2 - pad, -size.height * scaleY / 2 - pad,
          size.width * scaleX + pad * 2, size.height * scaleY + pad * 2);
        ctx.globalAlpha = 1;
      }
      ctx.font = `${ann.fontSize * scaleX}px ${ann.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (ann.stroke?.enabled && ann.stroke.width > 0) {
        ctx.strokeStyle = ann.stroke.color;
        ctx.lineWidth = ann.stroke.width * scaleX;
        ctx.strokeText(ann.text, 0, 0);
      }
      ctx.fillStyle = ann.color;
      ctx.fillText(ann.text, 0, 0);
      ctx.restore();
    } else if (ann.type === 'number') {
      const label = formatNumber(ann.value, ann.format);
      const r = numberBadgeRadius(ann) * scaleX;
      const cx = ann.x * scaleX;
      const cy = ann.y * scaleY;
      ctx.save();
      if (ann.leaderLine?.enabled) {
        const [lx1, ly1, lx2, ly2] = numberLeaderSegment(ann);
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.leaderLine.strokeWidth * scaleX;
        ctx.setLineDash(strokeDash(ann.leaderLine.strokeStyle, ann.leaderLine.strokeWidth * scaleX));
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lx1 * scaleX, ly1 * scaleY);
        ctx.lineTo(lx2 * scaleX, ly2 * scaleY);
        ctx.stroke();
        ctx.setLineDash([]);
        if (ann.leaderLine.arrow.style !== 'none') {
          const head = arrowPoints(lx1 * scaleX, ly1 * scaleY, lx2 * scaleX, ly2 * scaleY,
            { ...ann.leaderLine.arrow, size: ann.leaderLine.arrow.size * scaleX });
          if (head.length >= 4) {
            ctx.beginPath();
            ctx.moveTo(head[0], head[1]);
            for (let i = 2; i < head.length; i += 2) ctx.lineTo(head[i], head[i + 1]);
            if (ann.leaderLine.arrow.style === 'open') {
              ctx.stroke();
            } else {
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = ann.color;
      ctx.lineWidth = 2 * scaleX;
      ctx.fillStyle = canvasColor.value || '#ffffff';
      ctx.fill();
      ctx.stroke();
      ctx.font = `${ann.size * scaleX}px ${ann.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = ann.color;
      ctx.fillText(label, cx, cy);
      ctx.restore();
    } else if (ann.type === 'mosaic') {
      const cache = mosaicCanvasFor(ann);
      if (cache) {
        ctx.drawImage(cache, 0, 0, cache.width * scaleX, cache.height * scaleY);
      }
    }
  }
  return canvas;
}


function cancelColorPicking() {
  colorPicking.value = false;
  receivePickedColor = null;
}
function onPickCanvasClick(event: KonvaPointerEvent) {
  event.cancelBubble = true;
  const pointer = pointerPosition(event);
  if (!pointer || !receivePickedColor) return;
  let canvas = createCanvas();
  if (!canvas) return;
  const x = Math.max(0,Math.min(canvas.width - 1,Math.floor(pointer.x * canvas.width / renderWidth.value)));
  const y = Math.max(0,Math.min(canvas.height - 1,Math.floor(pointer.y * canvas.height / renderHeight.value)));
  let pixel = canvas.getContext('2d')?.getImageData(x,y,1,1).data;
  // Sampling a removed background must still recover the source color being removed.
  if (pixel && pixel[3] === 0) {
    const source = createCanvas(false);
    if (source) {
      const op = previewOperation.value;
      canvas = op?.kind === 'adjust' ? transformCanvas(source,{...op,transparent:false,opacity:100}) : source;
      pixel = canvas.getContext('2d')?.getImageData(Math.min(x,canvas.width - 1),Math.min(y,canvas.height - 1),1,1).data;
    }
  }
  if (!pixel) return;
  const color = '#' + [...pixel.slice(0,3)].map(channel => channel.toString(16).padStart(2,'0')).join('');
  const receive = receivePickedColor;
  cancelColorPicking();
  receive(color);
}

const cropHandles = computed(() => {
  const rect = cropSelection.value;
  const img = imageEl.value;
  if (!cropEnabled.value || !rect || !img) return [];
  const x = rect.x * stageWidth.value / img.naturalWidth;
  const y = rect.y * stageHeight.value / img.naturalHeight;
  const width = rect.width * stageWidth.value / img.naturalWidth;
  const height = rect.height * stageHeight.value / img.naturalHeight;
  return ([
    ['nw', x, y], ['n', x + width / 2, y], ['ne', x + width, y],
    ['e', x + width, y + height / 2], ['se', x + width, y + height],
    ['s', x + width / 2, y + height], ['sw', x, y + height], ['w', x, y + height / 2],
  ] as [CropHandle, number, number][]).map(([handle, hx, hy]) => ({handle, x:hx, y:hy}));
});
function onCropHandlePointerDown(handle: CropHandle, event: KonvaPointerEvent) {
  event.cancelBubble = true;
  if (!cropSelection.value || operationBusy.value) return;
  cropStart = null;
  cropResize = { handle, rect: { ...cropSelection.value } };
  resizingCropHandle.value = handle;
}

function cropImagePointer(event: KonvaPointerEvent) {
  const pointer = pointerPosition(event);
  if (!pointer || !imageEl.value) return null;
  return { x: pointer.x * imageEl.value.naturalWidth / stageWidth.value, y: pointer.y * imageEl.value.naturalHeight / stageHeight.value };
}
function onCropSettings(settings: {enabled: boolean; ratio: number}) {
  if (cropEnabled.value !== settings.enabled || cropRatio.value !== settings.ratio) {
    cropSelection.value = null;
    cropStart = null;
  cropResize = null;
  resizingCropHandle.value = null;
  hoveredCropHandle.value = null;
  }
  cropEnabled.value = settings.enabled;
  cropRatio.value = settings.ratio;
}
function onCropPointerLeave(event: KonvaPointerEvent) {
  if (!cropStart && !cropResize) return;
  onStageMouseMove(event);
  onStageMouseUp();
}

const previewCanvas = computed(() => {
  if (!previewOperation.value || previewOperation.value.kind === 'crop' || !imageEl.value) return null;
  const source = createCanvas(false);
  return source ? transformCanvas(source, previewOperation.value) : null;
});

const renderSize = computed(() => {
  const preview = previewCanvas.value;
  if (!preview) return {width:stageWidth.value, height:stageHeight.value};
  const scale = Math.min(800 / preview.width, 600 / preview.height, 1);
  return {width:Math.round(preview.width * scale), height:Math.round(preview.height * scale)};
});
const renderWidth = computed(() => renderSize.value.width);
const renderHeight = computed(() => renderSize.value.height);

watch(editorTab, (_next, previous) => {
  cancelColorPicking();
  if (previous === 'adjust' && previewOperation.value?.kind === 'adjust') {
    void applyOperation(previewOperation.value);
  }
  cropEnabled.value = false;
  cropSelection.value = null;
  cropStart = null;
  cropResize = null;
  resizingCropHandle.value = null;
  hoveredCropHandle.value = null;
  previewOperation.value = null;
  selectedId.value = null;
  activeTool.value = 'select';
  commitTextEdit();
});
watch(watermarkMode, () => {
  previewOperation.value = null;
  selectedId.value = null;
  commitTextEdit();
});

async function applyOperation(operation: ImageOperation) {
  if (operationBusy.value || !hasImageOperationChanges(operation)) return;
  commitTextEdit();
  pushHistory();
  const source = createCanvas(false);
  if (!source) return;
  try {
    const applied = await lifecycle.apply(async () => {
      const canvas = transformCanvas(source, operation);
      return decodeImage(canvas.toDataURL('image/png'));
    }, annotations.value);
    if (!applied) return;
    selectedId.value = null;
    previewOperation.value = null;
    cropSelection.value = null;
    operationsRef.value?.finishOperation(operation.kind);
  } catch {
    message.error(t('tools.imageEditor.operationFailed'));
  }
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
  canvasObserver?.disconnect();
  document.removeEventListener('keydown', onKeydown);
  if (pendingCommit) clearTimeout(pendingCommit);
  lifecycle.dispose();
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
});

// --- param rows ---------------------------------------------------------------

const strokeStyleOptions = computed(() => [
  { label: t('tools.imageEditor.strokeSolid'), value: 'solid' },
  { label: t('tools.imageEditor.strokeDashLong'), value: 'dash-long' },
  { label: t('tools.imageEditor.strokeDashShort'), value: 'dash-short' },
  { label: t('tools.imageEditor.strokeDashDot'), value: 'dash-dot' },
  { label: t('tools.imageEditor.strokeDashDotDot'), value: 'dash-dot-dot' },
]);

const arrowStyleOptions = computed(() => [
  { label: t('tools.imageEditor.arrowNone'), value: 'none' },
  { label: t('tools.imageEditor.arrowTriangle'), value: 'triangle' },
  { label: t('tools.imageEditor.arrowOpen'), value: 'open' },
  { label: t('tools.imageEditor.arrowCircle'), value: 'circle' },
]);

const shapeKindOptions = computed(() => [
  { label: t('tools.imageEditor.shapeRect'), value: 'rect' },
  { label: t('tools.imageEditor.shapeEllipse'), value: 'ellipse' },
]);

const lineKindOptions = computed(() => [
  { label: t('tools.imageEditor.lineStraight'), value: 'straight' },
  { label: t('tools.imageEditor.linePolyline'), value: 'polyline' },
]);

const fontFamilyOptions = computed(() => [
  { label: 'Sans Serif', value: 'sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
  { label: 'Cursive', value: 'cursive' },
]);

const numberFormatOptions = computed(() => [
  { label: t('tools.imageEditor.formatNumber'), value: 'number' },
  { label: t('tools.imageEditor.formatLowerAlpha'), value: 'lower-alpha' },
  { label: t('tools.imageEditor.formatUpperAlpha'), value: 'upper-alpha' },
  { label: t('tools.imageEditor.formatLowerRoman'), value: 'lower-roman' },
  { label: t('tools.imageEditor.formatUpperRoman'), value: 'upper-roman' },
]);

const eraserModeOptions = computed(() => [
  { label: t('tools.imageEditor.modeRect'), value: 'rect' },
  { label: t('tools.imageEditor.modeBrush'), value: 'brush' },
]);

const mosaicEffectOptions = computed(() => [
  { label: t('tools.imageEditor.mosaicEffect'), value: 'mosaic' },
  { label: t('tools.imageEditor.blurEffect'), value: 'blur' },
]);

// --- params toolbar previews -------------------------------------------------
// NSelect options render as SVG samples (not names) via render-label, and the
// selected tag shows the same sample via render-tag. Each picker picks its
// preview fn; the label stays on the option for accessibility/tooltip.

type PreviewFn = (value: never) => VNodeChild;
type SelectOptionLike = { value?: string | number };

function previewRenderLabel(preview: PreviewFn) {
  return (option: SelectOptionLike) => preview(option.value as never);
}

function previewRenderTag(preview: PreviewFn) {
  return ({ option }: { option: SelectOptionLike }) => preview(option.value as never);
}

const strokeRender = { label: previewRenderLabel(strokeStylePreview as PreviewFn), tag: previewRenderTag(strokeStylePreview as PreviewFn) };
// The start and end arrow samples face opposite ways, so they need separate
// render pairs rather than one shared arrowRender.
const startArrowRender = {
  label: previewRenderLabel(((v: ArrowStyle) => arrowStylePreview(v, 'start')) as PreviewFn),
  tag: previewRenderTag(((v: ArrowStyle) => arrowStylePreview(v, 'start')) as PreviewFn),
};
const endArrowRender = {
  label: previewRenderLabel(((v: ArrowStyle) => arrowStylePreview(v, 'end')) as PreviewFn),
  tag: previewRenderTag(((v: ArrowStyle) => arrowStylePreview(v, 'end')) as PreviewFn),
};
const numberFormatRender = { label: previewRenderLabel(numberFormatPreview as PreviewFn), tag: previewRenderTag(numberFormatPreview as PreviewFn) };

function updateShape(patch: Partial<ShapeAnnotation>) {
  const target = editingShape.value;
  if (target) {
    replaceAnnotation(target.id, { ...target, ...patch });
    scheduleCommit();
  } else {
    Object.assign(shapeDefaults.value, patch);
  }
}

function updateLine(patch: Partial<LineAnnotation>) {
  const target = editingLine.value;
  if (target) {
    replaceAnnotation(target.id, { ...target, ...patch });
    scheduleCommit();
  } else {
    Object.assign(lineDefaults.value, patch);
  }
}

function updatePen(patch: Partial<PenAnnotation>) {
  const target = editingPen.value;
  if (target) {
    replaceAnnotation(target.id, { ...target, ...patch });
    scheduleCommit();
  } else {
    Object.assign(penDefaults.value, patch);
  }
}

/** The text stroke model the params row edits (never null while toggling). */
function textStrokeOf(source: TextAnnotation | null): NonNullable<TextAnnotation['stroke']> {
  return source?.stroke ?? textDefaults.value.stroke;
}

/** The text background model the params row edits. */
function textBackgroundOf(source: TextAnnotation | null): NonNullable<TextAnnotation['background']> {
  return source?.background ?? textDefaults.value.background;
}

function updateText(patch: Partial<TextAnnotation>) {
  const target = editingText.value;
  if (target) {
    replaceAnnotation(target.id, { ...target, ...patch });
    scheduleCommit();
  } else {
    Object.assign(textDefaults.value, patch);
  }
}

function updateTextStroke(patch: Partial<NonNullable<TextAnnotation['stroke']>>) {
  const target = editingText.value;
  const current = textStrokeOf(target);
  const next = { ...current, ...patch };
  if (target) {
    replaceAnnotation(target.id, { ...target, stroke: next });
    scheduleCommit();
  } else {
    textDefaults.value.stroke = next;
  }
}

function updateTextBackground(patch: Partial<NonNullable<TextAnnotation['background']>>) {
  const target = editingText.value;
  const current = textBackgroundOf(target);
  const next = { ...current, ...patch };
  if (target) {
    replaceAnnotation(target.id, { ...target, background: next });
    scheduleCommit();
  } else {
    textDefaults.value.background = next;
  }
}

function updateNumber(patch: Partial<NumberAnnotation>) {
  const target = editingNumber.value;
  if (target) {
    replaceAnnotation(target.id, { ...target, ...patch });
    scheduleCommit();
  } else {
    const prevFormat = numberDefaults.value.format;
    Object.assign(numberDefaults.value, patch);
    // Changing the format restarts the auto-increment sequence.
    if (patch.format && patch.format !== prevFormat) {
      nextNumber.value = 1;
    }
  }
}

/** The leader-line model the params row edits (never null while toggling). */
function numberLeaderOf(source: NumberAnnotation | null): NonNullable<NumberAnnotation['leaderLine']> {
  return source?.leaderLine ?? {
    enabled: true,
    points: [0, 0, 0, 0],
    strokeWidth: numberDefaults.value.leaderStrokeWidth,
    strokeStyle: numberDefaults.value.leaderStrokeStyle,
    arrow: { ...numberDefaults.value.leaderArrow },
  };
}

function updateNumberLeader(patch: Partial<NonNullable<NumberAnnotation['leaderLine']>>) {
  const target = editingNumber.value;
  const current = numberLeaderOf(target);
  const next = { ...current, ...patch };
  if (target) {
    replaceAnnotation(target.id, { ...target, leaderLine: next });
    scheduleCommit();
  } else {
    numberDefaults.value.leaderStrokeWidth = next.strokeWidth;
    numberDefaults.value.leaderStrokeStyle = next.strokeStyle;
    numberDefaults.value.leaderArrow = { ...next.arrow };
  }
}

/** The annotation the params panel edits for the mosaic tool. */
const editingMosaic = computed(() =>
  parameterTool.value === 'mosaic' ? selectedMosaic.value : null);
const mosaicMode = computed(() => editingMosaic.value ? (editingMosaic.value.region.kind === 'path' ? 'brush' : 'rect') : mosaicDefaults.value.mode);
const mosaicBrushSize = computed(() => editingMosaic.value?.region.kind === 'path' ? editingMosaic.value.region.brushSize : mosaicDefaults.value.brushSize);
function updateMosaicMode(mode: 'rect' | 'brush') {
  const target = editingMosaic.value;
  if (!target) { mosaicDefaults.value.mode = mode; return; }
  if (mode === mosaicMode.value) return;
  const box = annotationBBox(target);
  updateMosaic({ region: mode === 'rect'
    ? {kind:'rect', ...box}
    : {kind:'path',points:[box.x,box.y + box.height / 2,box.x + box.width,box.y + box.height / 2],brushSize:Math.max(4,box.height / 2)} });
}
function updateMosaicBrushSize(brushSize: number) {
  const target = editingMosaic.value;
  if (target?.region.kind === 'path') updateMosaic({region:{...target.region,brushSize}});
  else mosaicDefaults.value.brushSize = brushSize;
}

function updateMosaic(patch: Partial<MosaicAnnotation>) {
  const target = editingMosaic.value;
  if (target) {
    const next = { ...target, ...patch };
    replaceAnnotation(target.id, next);
    mosaicCache.delete(target.id);
    rebuildMosaicCache(next);
    scheduleCommit();
  } else {
    if (patch.effect !== undefined) mosaicDefaults.value.effect = patch.effect;
    if (patch.strength !== undefined) mosaicDefaults.value.strength = patch.strength;
  }
}

function arrowStyleValue(cfg: ArrowConfig | null): ArrowStyle {
  return cfg?.style ?? 'none';
}

const startArrowSize = ref(12);
const endArrowSize = ref(12);

function updateStartArrow(style: ArrowStyle, size?: number) {
  const current = editingLine.value?.startArrow ?? lineDefaults.value.startArrow;
  const nextSize = size ?? current?.size ?? startArrowSize.value;
  startArrowSize.value = nextSize;
  const next: ArrowConfig | null = style === 'none' ? null : { style, size: nextSize };
  updateLine({ startArrow: next });
}

function updateEndArrow(style: ArrowStyle, size?: number) {
  const current = editingLine.value?.endArrow ?? lineDefaults.value.endArrow;
  const nextSize = size ?? current?.size ?? endArrowSize.value;
  endArrowSize.value = nextSize;
  const next: ArrowConfig | null = style === 'none' ? null : { style, size: nextSize };
  updateLine({ endArrow: next });
}

function updateStartArrowSize(size: number | null) {
  const current = editingLine.value?.startArrow ?? lineDefaults.value.startArrow;
  startArrowSize.value = size ?? 12;
  if (!current) return;
  updateLine({ startArrow: { ...current, size: size ?? 12 } });
}

function updateEndArrowSize(size: number | null) {
  const current = editingLine.value?.endArrow ?? lineDefaults.value.endArrow;
  endArrowSize.value = size ?? 12;
  if (!current) return;
  updateLine({ endArrow: { ...current, size: size ?? 12 } });
}

/** Arrowhead polygons for one end of a rendered line (null = no arrowhead). */
function arrowHeadPoints(line: LineAnnotation, end: 'start' | 'end'): number[] | null {
  const cfg = end === 'start' ? line.startArrow : line.endArrow;
  if (!cfg || cfg.style === 'none') return null;
  const pts = line.points;
  const [sx, sy] = [pts[0], pts[1]];
  const [ex, ey] = [pts[pts.length - 2], pts[pts.length - 1]];
  if (end === 'start') return arrowPoints(ex, ey, sx, sy, cfg);
  return arrowPoints(sx, sy, ex, ey, cfg);
}

/** Arrowheads to render for a line: only the ends with a non-null, non-'none' config. */
function lineArrowHeads(line: LineAnnotation): Array<{ key: string; pts: number[]; cfg: ArrowConfig }> {
  const out: Array<{ key: string; pts: number[]; cfg: ArrowConfig }> = [];
  for (const end of ['start', 'end'] as const) {
    const cfg = end === 'start' ? line.startArrow : line.endArrow;
    if (!cfg || cfg.style === 'none') continue;
    const pts = arrowHeadPoints(line, end);
    if (pts && pts.length >= 4) out.push({ key: end, pts, cfg });
  }
  return out;
}

// --- number badge geometry ---------------------------------------------------

/** Circle radius that fits the formatted label at the given font size. */
function numberBadgeRadius(annotation: NumberAnnotation): number {
  const label = formatNumber(annotation.value, annotation.format);
  const ctx = document.createElement('canvas').getContext('2d');
  let textWidth = label.length * annotation.size * 0.6;
  if (ctx) {
    ctx.font = `${annotation.size}px ${annotation.fontFamily}`;
    textWidth = ctx.measureText(label).width;
  }
  return Math.max(annotation.size * 0.75, textWidth / 2 + annotation.size * 0.35);
}

/**
 * Leader line segment trimmed to the badge edge: the model stores badge centre
 * to arrow tip, but the visible line starts where it exits the circle.
 */
function numberLeaderSegment(annotation: NumberAnnotation): [number, number, number, number] {
  const leader = annotation.leaderLine!;
  const [cx, cy, tx, ty] = leader.points;
  const r = numberBadgeRadius(annotation);
  const len = Math.hypot(tx - cx, ty - cy);
  if (len <= r || len === 0) return [cx, cy, tx, ty];
  const ux = (tx - cx) / len;
  const uy = (ty - cy) / len;
  return [cx + ux * r, cy + uy * r, tx, ty];
}

/** Arrowhead polygon for a number leader line (null when no arrow or degenerate). */
function numberLeaderArrow(annotation: NumberAnnotation): number[] | null {
  const leader = annotation.leaderLine;
  if (!leader || !leader.arrow || leader.arrow.style === 'none') return null;
  const [, , ex, ey] = numberLeaderSegment(annotation);
  const [cx, cy] = [leader.points[0], leader.points[1]];
  const pts = arrowPoints(cx, cy, ex, ey, leader.arrow);
  return pts.length >= 4 ? pts : null;
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NCard>
      <ToolFilePanel :columns="1" @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <!-- The upload control stays mounted for the paste listener, the accept
             filter and the programmatic picker; the canvas is the only thing
             the box shows. -->
        <div class="image-editor__hidden">
          <ToolFileUpload ref="fileUpload" accept="image/*" @change="onFileChange" />
        </div>
        <div v-if="imageUrl" ref="canvasWrapper" class="canvas-wrapper" :class="{ 'canvas-wrapper--crop': cropEnabled }" :style="{ cursor: colorPicking ? 'crosshair' : cropCursor }" @wheel="onStageWheel">
          <div :style="{ width: `${renderWidth * displayScale}px`, height: `${renderHeight * displayScale}px` }">
          <div class="image-editor__stage-wrap" :style="{ width: `${renderWidth}px`, height: `${renderHeight}px`, transform: `scale(${displayScale})`, transformOrigin: 'top left' }">
          <v-stage
            ref="stageRef"
            :config="{ width: renderWidth, height: renderHeight, listening: (colorPicking || editorTab === 'crop' || editorTab === 'annotate' && !watermarkMode) && !operationBusy }"
            @click="onStageClick"
            @pointerdown="onStageMouseDown"
            @pointermove="onStageMouseMove"
            @pointerup="onStageMouseUp"
            @pointerleave="onCropPointerLeave"
            @pointercancel="onStageMouseUp"
          >
            <v-layer>
              <v-image
                :config="{
                  name: 'image-editor-background',
                  image: previewCanvas ?? imageEl,
                  x: 0,
                  y: 0,
                  width: renderWidth,
                  height: renderHeight,
                }"
              />
              <template v-for="ann in (previewCanvas ? [] : annotations)" :key="ann.id">
                <v-rect
                  v-if="ann.type === 'shape' && ann.kind === 'rect'"
                  :ref="(el: unknown) => setNodeRef(ann.id, el)"
                  :config="{
                    x: ann.x,
                    y: ann.y,
                    width: ann.width,
                    height: ann.height,
                    stroke: ann.stroke,
                    strokeWidth: ann.strokeWidth,
                    dash: strokeDash(ann.strokeStyle, ann.strokeWidth),
                    fill: ann.fillEnabled ? ann.fill : undefined,
                    cornerRadius: ann.cornerRadius,
                    draggable: canManipulate,
                  }"
                  @click="onAnnotationClick(ann, $event)"
                  @dragend="onShapeDragEnd(ann, $event)"
                />
                <v-ellipse
                  v-else-if="ann.type === 'shape'"
                  :ref="(el: unknown) => setNodeRef(ann.id, el)"
                  :config="{
                    x: ann.x + ann.width / 2,
                    y: ann.y + ann.height / 2,
                    radiusX: ann.width / 2,
                    radiusY: ann.height / 2,
                    stroke: ann.stroke,
                    strokeWidth: ann.strokeWidth,
                    dash: strokeDash(ann.strokeStyle, ann.strokeWidth),
                    fill: ann.fillEnabled ? ann.fill : undefined,
                    draggable: canManipulate,
                  }"
                  @click="onAnnotationClick(ann, $event)"
                  @dragend="onShapeDragEnd(ann, $event)"
                />
                <v-line
                  v-else-if="ann.type === 'line'"
                  :ref="(el: unknown) => setNodeRef(ann.id, el)"
                  :config="{
                    points: ann.points,
                    stroke: ann.stroke,
                    strokeWidth: ann.strokeWidth,
                    dash: strokeDash(ann.strokeStyle, ann.strokeWidth),
                    lineCap: 'round',
                    lineJoin: 'round',
                    hitStrokeWidth: 12,
                    draggable: canManipulate,
                  }"
                  @click="onAnnotationClick(ann, $event)"
                  @dragend="onLineDragEnd(ann, $event)"
                />
                <template v-if="ann.type === 'line'">
                  <v-line
                    v-for="head in lineArrowHeads(ann)"
                    :key="`${ann.id}-${head.key}`"
                    :config="{
                      points: head.pts,
                      closed: head.cfg?.style !== 'open',
                      fill: head.cfg?.style === 'open' ? undefined : ann.stroke,
                      stroke: ann.stroke,
                      strokeWidth: 1,
                      listening: false,
                    }"
                  />
                </template>
                <v-line
                  v-else-if="ann.type === 'pen'"
                  :ref="(el: unknown) => setNodeRef(ann.id, el)"
                  :config="{
                    points: ann.points,
                    stroke: ann.stroke,
                    strokeWidth: ann.strokeWidth,
                    dash: strokeDash(ann.strokeStyle, ann.strokeWidth),
                    tension: 0.5,
                    lineCap: 'round',
                    lineJoin: 'round',
                    hitStrokeWidth: 12,
                    draggable: canManipulate,
                  }"
                  @click="onAnnotationClick(ann, $event)"
                  @dragend="onPenDragEnd(ann, $event)"
                />
                <template v-else-if="ann.type === 'text'">
                  <v-rect
                    v-if="textBackgroundRect(ann)"
                    :config="textBackgroundRect(ann)!"
                  />
                  <v-text
                    :ref="(el: unknown) => setNodeRef(ann.id, el)"
                    :config="{
                      x: ann.x,
                      y: ann.y,
                      text: ann.text,
                      fontSize: ann.fontSize,
                      fontFamily: ann.fontFamily,
                      fill: ann.color,
                      stroke: ann.stroke?.enabled ? ann.stroke.color : undefined,
                      strokeWidth: ann.stroke?.enabled ? ann.stroke.width : undefined,
                      rotation: ann.rotation,
                      offsetX: textSize(ann).width / 2,
                      offsetY: textSize(ann).height / 2,
                      draggable: canManipulate,
                    }"
                    @click="onAnnotationClick(ann, $event)"
                    @dragend="onTextDragEnd(ann, $event)"
                    @dblclick="onTextDblClick(ann)"
                  />
                </template>
                <template v-else-if="ann.type === 'number'">
                  <v-line
                    v-if="ann.leaderLine?.enabled"
                    :config="{
                      points: numberLeaderSegment(ann),
                      stroke: ann.color,
                      strokeWidth: ann.leaderLine.strokeWidth,
                      dash: strokeDash(ann.leaderLine.strokeStyle, ann.leaderLine.strokeWidth),
                      lineCap: 'round',
                      listening: false,
                    }"
                  />
                  <v-line
                    v-if="ann.leaderLine?.enabled && numberLeaderArrow(ann)"
                    :config="{
                      points: numberLeaderArrow(ann)!,
                      closed: ann.leaderLine.arrow.style !== 'open',
                      fill: ann.leaderLine.arrow.style === 'open' ? undefined : ann.color,
                      stroke: ann.color,
                      strokeWidth: 1,
                      listening: false,
                    }"
                  />
                  <v-circle
                    :ref="(el: unknown) => setNodeRef(ann.id, el)"
                    :config="{
                      x: ann.x,
                      y: ann.y,
                      radius: numberBadgeRadius(ann),
                      stroke: ann.color,
                      strokeWidth: 2,
                      fill: canvasColor,
                      draggable: canManipulate,
                    }"
                    @click="onAnnotationClick(ann, $event)"
                    @dragend="onNumberDragEnd(ann, $event)"
                  />
                  <v-text
                    :config="{
                      x: ann.x,
                      y: ann.y,
                      text: formatNumber(ann.value, ann.format),
                      fontSize: ann.size,
                      fontFamily: ann.fontFamily,
                      fill: ann.color,
                      offsetX: formatNumber(ann.value, ann.format).length * ann.size * 0.3,
                      offsetY: ann.size * 0.4,
                      listening: false,
                    }"
                  />
                </template>
                <template v-else-if="ann.type === 'mosaic'">
                  <v-image
                    :ref="(el: unknown) => setNodeRef(ann.id, el)"
                    :config="{
                      image: mosaicCanvasFor(ann),
                      x: 0,
                      y: 0,
                      width: stageWidth,
                      height: stageHeight,
                      draggable: canManipulate,
                    }"
                    @click="onAnnotationClick(ann, $event)"
                    @dragend="onMosaicDragEnd(ann, $event)"
                  />
                </template>
              </template>
              <!-- In-progress drafts -->
              <v-rect
                v-if="shapeDraftRect"
                :config="{
                  x: shapeDraftRect.x,
                  y: shapeDraftRect.y,
                  width: shapeDraftRect.width,
                  height: shapeDraftRect.height,
                  stroke: shapeDefaults.stroke,
                  strokeWidth: shapeDefaults.strokeWidth,
                  dash: [5, 5],
                }"
              />
              <v-line
                v-if="lineDraft"
                :config="{
                  points: lineDraft,
                  stroke: lineDefaults.stroke,
                  strokeWidth: lineDefaults.strokeWidth,
                  lineCap: 'round',
                  dash: [5, 5],
                }"
              />
              <v-line
                v-if="polylineDraft.length >= 2"
                :config="{
                  points: polylineDraft,
                  stroke: lineDefaults.stroke,
                  strokeWidth: lineDefaults.strokeWidth,
                  lineCap: 'round',
                  lineJoin: 'round',
                  dash: [5, 5],
                }"
              />
              <v-line
                v-if="penDraft"
                :config="{
                  points: penDraft,
                  stroke: penDefaults.stroke,
                  strokeWidth: penDefaults.strokeWidth,
                  tension: 0.5,
                  lineCap: 'round',
                  lineJoin: 'round',
                  dash: [5, 5],
                }"
              />
              <v-line
                v-if="leaderDraft"
                :config="{
                  points: leaderDraft,
                  stroke: numberDefaults.color,
                  strokeWidth: numberDefaults.leaderStrokeWidth,
                  dash: strokeDash(numberDefaults.leaderStrokeStyle, numberDefaults.leaderStrokeWidth),
                  lineCap: 'round',
                }"
              />
              <!-- Eraser drafts -->
              <v-rect
                v-if="eraserDraftRect"
                :config="{
                  x: eraserDraftRect.x,
                  y: eraserDraftRect.y,
                  width: eraserDraftRect.width,
                  height: eraserDraftRect.height,
                  stroke: primaryColor,
                  strokeWidth: 1,
                  dash: [5, 5],
                }"
              />
              <v-line
                v-if="eraserTrail"
                :config="{
                  points: eraserTrail,
                  stroke: primaryColor,
                  strokeWidth: eraserDefaults.brushSize * 2,
                  opacity: 0.3,
                  lineCap: 'round',
                  lineJoin: 'round',
                }"
              />
              <v-circle
                v-if="activeTool === 'eraser' && eraserDefaults.mode === 'brush' && eraserPointer"
                :config="{
                  x: eraserPointer.x,
                  y: eraserPointer.y,
                  radius: eraserDefaults.brushSize,
                  stroke: primaryColor,
                  strokeWidth: 1,
                  opacity: 0.5,
                  listening: false,
                }"
              />
              <!-- Mosaic drafts -->
              <v-rect
                v-if="mosaicDraftRect"
                :config="{
                  x: mosaicDraftRect.x,
                  y: mosaicDraftRect.y,
                  width: mosaicDraftRect.width,
                  height: mosaicDraftRect.height,
                  stroke: primaryColor,
                  strokeWidth: 1,
                  dash: [5, 5],
                }"
              />
              <v-line
                v-if="mosaicTrail"
                :config="{
                  points: mosaicTrail,
                  stroke: primaryColor,
                  strokeWidth: mosaicDefaults.brushSize * 2,
                  opacity: 0.3,
                  lineCap: 'round',
                  lineJoin: 'round',
                }"
              />
              <v-circle
                v-if="activeTool === 'mosaic' && mosaicDefaults.mode === 'brush' && mosaicPointer"
                :config="{
                  x: mosaicPointer.x,
                  y: mosaicPointer.y,
                  radius: mosaicDefaults.brushSize,
                  stroke: primaryColor,
                  strokeWidth: 1,
                  opacity: 0.5,
                  listening: false,
                }"
              />
              <v-rect v-if="cropEnabled" :config="{ x:0, y:0, width:stageWidth, height:stageHeight, fill:'rgba(0,0,0,0)' }" />
              <v-rect v-if="cropEnabled && cropSelection && imageEl" :config="{
                x: cropSelection.x * stageWidth / imageEl.naturalWidth,
                y: cropSelection.y * stageHeight / imageEl.naturalHeight,
                width: cropSelection.width * stageWidth / imageEl.naturalWidth,
                height: cropSelection.height * stageHeight / imageEl.naturalHeight,
                stroke: primaryColor, strokeWidth: 2, dash: [6,4], fill: 'rgba(255,255,255,0.15)', listening:false,
              }" />
              <v-rect v-for="handle in cropHandles" :key="`crop-${handle.handle}`" :config="{
                x: handle.x - 5 / displayScale, y: handle.y - 5 / displayScale,
                width: 10 / displayScale, height: 10 / displayScale,
                fill: canvasColor || '#ffffff', stroke: primaryColor, strokeWidth: 1.5 / displayScale,
                hitStrokeWidth: 12 / displayScale,
              }" @pointerdown="onCropHandlePointerDown(handle.handle, $event)"
                @pointerenter="hoveredCropHandle = handle.handle"
                @pointerleave="hoveredCropHandle = null" />
              <v-transformer
                v-if="selected && canManipulate"
                ref="transformerRef"
                :config="transformerConfig"
              />
              <v-circle
                v-for="handle in lineHandlePositions"
                :key="`handle-${selectedLine?.id}-${handle.index}`"
                :config="{
                  x: handle.x,
                  y: handle.y,
                  radius: 6,
                  fill: primaryColor,
                  stroke: canvasColor,
                  strokeWidth: 2,
                  draggable: true,
                }"
                @dragmove="onLineHandleDrag(selectedLine!, handle.index, $event)"
                @dragend="pushHistory()"
              />
              <v-circle
                v-if="textRotationHandle"
                :config="{
                  x: textRotationHandle.x,
                  y: textRotationHandle.y,
                  radius: 7,
                  fill: primaryColor,
                  stroke: canvasColor,
                  strokeWidth: 2,
                  draggable: true,
                }"
                @dragmove="onRotationHandleDrag"
                @dragend="onRotationHandleDragEnd"
              />
              <v-rect v-if="colorPicking" :config="{x:0,y:0,width:renderWidth,height:renderHeight,fill:'rgba(0,0,0,0)'}" @click="onPickCanvasClick" />
            </v-layer>
          </v-stage>
          <div
            v-if="textEdit"
            class="image-editor__text-edit"
            :style="{ left: `${textEdit.x}px`, top: `${textEdit.y}px` }"
          >
            <textarea
              ref="textEditInput"
              v-model="textEdit.text"
              class="image-editor__text-input"
              rows="1"
              :placeholder="t('tools.imageEditor.textPlaceholder')"
              @keydown.enter.prevent="commitTextEdit"
              @keydown.esc.prevent="cancelTextEdit"
              @blur="commitTextEdit"
            />
          </div>
          </div>
          </div>
        </div>
        <button v-else type="button" class="image-editor__empty" @click="fileUpload?.triggerSelect()">
          <NIcon :size="26" :component="CloudUpload" class="image-editor__empty-icon" />
          <span class="image-editor__empty-label">{{ t('tool.importFile') }}</span>
          <span class="image-editor__empty-hint">{{ t('tool.fileUpload.accepted', { types: 'image/*' }) }}</span>
        </button>
        <template #actions-right>
          <NButton :disabled="!imageEl || operationBusy" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!imageEl || operationBusy" @click="downloadImage">{{ t('tool.exportFile') }}</NButton>
        </template>

      </ToolFilePanel>
    </NCard>
          <div class="image-editor__params" :inert="operationBusy || undefined" :aria-busy="operationBusy">
            <ToolTabs :value="editorTab"
              :tabs="editorTabs"
              :aria-label="t('tools.imageEditor.name')"
              @update:value="editorTab = $event as typeof editorTab">

            <div v-if="editorTab === 'annotate'" class="image-editor__toolbar" role="toolbar" :aria-label="t('tools.imageEditor.name')">
              <button
                v-for="button in toolButtons"
                :key="button.tool"
                type="button"
                class="image-editor__tool editor-function"
                :class="{ 'image-editor__tool--active': !watermarkMode && activeTool === button.tool }"
                :aria-pressed="!watermarkMode && activeTool === button.tool"
                :aria-label="t(button.labelKey)"
                @click="watermarkMode = false; setTool(button.tool)"
              >
                <NIcon :size="24" :component="button.icon" />
                <span>{{ t(button.labelKey) }}</span>
              </button>
              <button class="image-editor__tool image-editor__watermark editor-function" :class="{ 'image-editor__tool--active': watermarkMode }" :aria-pressed="watermarkMode" :aria-label="t('tools.imageEditor.operationwatermark')" @click="watermarkMode = true"><NIcon :size="24" :component="Typography" /><span>{{ t('tools.imageEditor.operationwatermark') }}</span></button>
            </div>
            <ImageOperations ref="operationsRef" v-if="editorTab !== 'annotate' || watermarkMode" :tab="editorTab" :width="imageEl?.naturalWidth ?? 0" :height="imageEl?.naturalHeight ?? 0" :disabled="!imageEl" :busy="operationBusy" :crop-selection="cropSelection" @crop-settings="onCropSettings" @apply="applyOperation" @preview="previewOperation = $event" />
            <div v-if="editorTab === 'annotate' && !watermarkMode && parameterTool !== null" class="image-editor__params-row">

              <!-- Shape params -->
              <template v-if="parameterTool === 'shape'">
                <div class="param-mode-start">
                <div class="param-group" role="radiogroup" :aria-label="t('tools.imageEditor.toolShape')">
                  <NTooltip v-for="opt in shapeKindOptions" :key="opt.value" placement="bottom">
                    <template #trigger>
                  <button
                    type="button"
                    class="param-chip"
                    :class="{ 'param-chip--active': (editingShape?.kind ?? shapeDefaults.kind) === opt.value }"
                    :aria-pressed="(editingShape?.kind ?? shapeDefaults.kind) === opt.value"
                    :aria-label="opt.label"
                    @click="updateShape({ kind: opt.value as ShapeAnnotation['kind'] })"
                  >
                    <NIcon :size="22" :component="opt.value === 'rect' ? Rectangle : CircleIcon" />
                  </button>
                    </template>
                    {{ opt.label }}
                  </NTooltip>
                </div>
                  <span class="param-divider" aria-hidden="true"></span>
                </div>
                <div class="param-main">

                <NTooltip placement="bottom">
                  <template #trigger>
                    <AnnotationColorControl
                      :value="editingShape?.stroke ?? shapeDefaults.stroke"
                      :swatches="['#e03131', '#1971c2', '#2f9e44', '#f08c00', '#343a40']"
                      @update:value="(v: string) => updateShape({ stroke: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.shapeStrokeColor') }}
                </NTooltip>
                  <div class="param-tools">
                <NTooltip placement="bottom">
                  <template #trigger>
                    <SizeField
                      :value="editingShape?.strokeWidth ?? shapeDefaults.strokeWidth"
                      :min="1" :max="50" :step="1"
                      :label-key="t('tools.imageEditor.strokeWidth')"
                      :icon="lineWeightIcon"
                      @update:value="(v: number) => updateShape({ strokeWidth: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.strokeWidth') }}
                </NTooltip>
                <NTooltip placement="bottom">
                  <template #trigger>
                    <NSelect
                      class="param-select"
                      :value="editingShape?.strokeStyle ?? shapeDefaults.strokeStyle"
                      :options="strokeStyleOptions"
                      :render-label="strokeRender.label"
                      :render-tag="strokeRender.tag"
                      @update:value="(v: string) => updateShape({ strokeStyle: v as StrokeStyle })"
                    />
                  </template>
                  {{ t('tools.imageEditor.stroke') }}
                </NTooltip>
                <span class="param-divider" aria-hidden="true"></span>
                <div class="param-group param-group--fill" :class="{ 'param-group--inactive': !(editingShape?.fillEnabled ?? shapeDefaults.fillEnabled) }">
                  <NTooltip placement="bottom">
                    <template #trigger>
                      <button
                        type="button"
                        class="param-chip param-chip--toggle"
                        :class="{ 'param-chip--active': editingShape?.fillEnabled ?? shapeDefaults.fillEnabled }"
                        :aria-pressed="editingShape?.fillEnabled ?? shapeDefaults.fillEnabled"
                        :aria-label="t('tools.imageEditor.fill')"
                        @click="updateShape({ fillEnabled: !(editingShape?.fillEnabled ?? shapeDefaults.fillEnabled) })"
                      >
                        <NIcon :size="22" :component="Paint" />
                      </button>
                    </template>
                    {{ t('tools.imageEditor.fill') }}
                  </NTooltip>
                  <CanvasColorPicker
                    class="param-color"
                    :value="editingShape?.fill ?? shapeDefaults.fill"
                    @update:value="(v: string) => updateShape({ fill: v })"
                  />
                </div>
                <span v-if="(editingShape?.kind ?? shapeDefaults.kind) === 'rect'" class="param-divider" aria-hidden="true"></span>
                <NTooltip v-if="(editingShape?.kind ?? shapeDefaults.kind) === 'rect'" placement="bottom">
                  <template #trigger>
                    <SizeField
                      :value="editingShape?.cornerRadius ?? shapeDefaults.cornerRadius"
                      :min="0" :max="100" :step="1"
                      :label-key="t('tools.imageEditor.cornerRadius')"
                      :icon="RadiusBottomLeft"
                      @update:value="(v: number) => updateShape({ cornerRadius: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.cornerRadius') }}
                </NTooltip>
                  </div>
                </div>
              </template>

              <!-- Line params -->
              <template v-if="parameterTool === 'line'">
                <div class="param-mode-start">
                <div class="param-group" role="radiogroup" :aria-label="t('tools.imageEditor.toolLine')">
                  <NTooltip v-for="opt in lineKindOptions" :key="opt.value" placement="bottom">
                    <template #trigger>
                  <button
                    type="button"
                    class="param-chip"
                    :class="{ 'param-chip--active': (editingLine?.kind ?? lineDefaults.kind) === opt.value }"
                    :aria-pressed="(editingLine?.kind ?? lineDefaults.kind) === opt.value"
                    :aria-label="opt.label"
                    @click="updateLine({ kind: opt.value as LineAnnotation['kind'] })"
                  >
                    <NIcon :size="22" :component="opt.value === 'straight' ? Line : Vector" />
                  </button>
                    </template>
                    {{ opt.label }}
                  </NTooltip>
                </div>
                  <span class="param-divider" aria-hidden="true"></span>
                </div>
                <div class="param-main">

                <NTooltip placement="bottom">
                  <template #trigger>
                    <AnnotationColorControl :show-swatches="false"
                      :value="editingLine?.stroke ?? lineDefaults.stroke"
                      :swatches="['#e03131', '#1971c2', '#2f9e44', '#f08c00', '#343a40']"
                      @update:value="(v: string) => updateLine({ stroke: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.lineColor') }}
                </NTooltip>
                  <div class="param-tools">
                <NTooltip placement="bottom">
                  <template #trigger>
                    <SizeField
                      :value="editingLine?.strokeWidth ?? lineDefaults.strokeWidth"
                      :min="1" :max="50" :step="1"
                      :label-key="t('tools.imageEditor.lineWidth')"
                      :icon="lineWeightIcon"
                      @update:value="(v: number) => updateLine({ strokeWidth: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.lineWidth') }}
                </NTooltip>
                <NTooltip placement="bottom">
                  <template #trigger>
                    <NSelect
                      class="param-select"
                      :value="editingLine?.strokeStyle ?? lineDefaults.strokeStyle"
                      :options="strokeStyleOptions"
                      :render-label="strokeRender.label"
                      :render-tag="strokeRender.tag"
                      @update:value="(v: string) => updateLine({ strokeStyle: v as StrokeStyle })"
                    />
                  </template>
                  {{ t('tools.imageEditor.stroke') }}
                </NTooltip>
                <span class="param-divider param-arrow-divider" aria-hidden="true"></span>
                <div class="param-group param-arrow-group">
                  <SizeField
                    :value="(editingLine?.startArrow ?? lineDefaults.startArrow)?.size ?? startArrowSize"
                    :min="4" :max="40" :step="1"
                    :label-key="t('tools.imageEditor.startArrowSize')"
                    :icon="ArrowLeft"
                    @update:value="updateStartArrowSize"
                  />
                  <NTooltip placement="bottom">
                    <template #trigger>
                      <NSelect
                        class="param-select"
                        :value="arrowStyleValue(editingLine?.startArrow ?? lineDefaults.startArrow)"
                        :options="arrowStyleOptions"
                        :render-label="startArrowRender.label"
                        :render-tag="startArrowRender.tag"
                        @update:value="(v: string) => updateStartArrow(v as ArrowStyle)"
                      />
                    </template>
                    {{ t('tools.imageEditor.startArrowStyle') }}
                  </NTooltip>

                </div>
                <span class="param-divider param-arrow-divider" aria-hidden="true"></span>
                <div class="param-group param-arrow-group">
                  <SizeField
                    :value="(editingLine?.endArrow ?? lineDefaults.endArrow)?.size ?? endArrowSize"
                    :min="4" :max="40" :step="1"
                    :label-key="t('tools.imageEditor.endArrowSize')"
                    :icon="ArrowRight"
                    @update:value="updateEndArrowSize"
                  />
                  <NTooltip placement="bottom">
                    <template #trigger>
                      <NSelect
                        class="param-select"
                        :value="arrowStyleValue(editingLine?.endArrow ?? lineDefaults.endArrow)"
                        :options="arrowStyleOptions"
                        :render-label="endArrowRender.label"
                        :render-tag="endArrowRender.tag"
                        @update:value="(v: string) => updateEndArrow(v as ArrowStyle)"
                      />
                    </template>
                    {{ t('tools.imageEditor.endArrowStyle') }}
                  </NTooltip>

                </div>
                  </div>
                </div>
              </template>

              <!-- Pen params -->
              <template v-if="parameterTool === 'pen'">
                <div class="param-mode-start"></div>
                <div class="param-main">
                <NTooltip placement="bottom">
                  <template #trigger>
                    <AnnotationColorControl
                      :value="editingPen?.stroke ?? penDefaults.stroke"
                      :swatches="['#e03131', '#1971c2', '#2f9e44', '#f08c00', '#343a40']"
                      @update:value="(v: string) => updatePen({ stroke: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.penColor') }}
                </NTooltip>
                  <div class="param-tools">
                <NTooltip placement="bottom">
                  <template #trigger>
                    <SizeField
                      :value="editingPen?.strokeWidth ?? penDefaults.strokeWidth"
                      :min="1" :max="30" :step="1"
                      :label-key="t('tools.imageEditor.lineWidth')"
                      :icon="lineWeightIcon"
                      @update:value="(v: number) => updatePen({ strokeWidth: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.lineWidth') }}
                </NTooltip>
                <NTooltip placement="bottom">
                  <template #trigger>
                    <NSelect
                      class="param-select"
                      :value="editingPen?.strokeStyle ?? penDefaults.strokeStyle"
                      :options="strokeStyleOptions"
                      :render-label="strokeRender.label"
                      :render-tag="strokeRender.tag"
                      @update:value="(v: string) => updatePen({ strokeStyle: v as StrokeStyle })"
                    />
                  </template>
                  {{ t('tools.imageEditor.stroke') }}
                </NTooltip>
                  </div>
                </div>
              </template>

              <!-- Text params -->
              <template v-if="parameterTool === 'text'">
                <div class="param-mode-start"></div>
                <div class="param-main">
                <NTooltip placement="bottom">
                  <template #trigger>
                    <AnnotationColorControl :show-swatches="false"
                      :value="editingText?.color ?? textDefaults.color"
                      :swatches="['#e03131', '#1971c2', '#2f9e44', '#f08c00', '#343a40']"
                      @update:value="(v: string) => updateText({ color: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.textColor') }}
                </NTooltip>
                  <div class="param-tools">
                <NTooltip placement="bottom">
                  <template #trigger>
                    <SizeField
                      :value="editingText?.fontSize ?? textDefaults.fontSize"
                      :min="8" :max="120" :step="1"
                      :label-key="t('tools.imageEditor.fontSize')"
                      :icon="Typography"
                      @update:value="(v: number) => updateText({ fontSize: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.fontSize') }}
                </NTooltip>
                <NTooltip placement="bottom">
                  <template #trigger>
                    <NSelect
                      class="param-select param-select--text"
                      :value="editingText?.fontFamily ?? textDefaults.fontFamily"
                      :options="fontFamilyOptions"
                      @update:value="(v: string) => updateText({ fontFamily: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.fontFamily') }}
                </NTooltip>
                <span class="param-divider" aria-hidden="true"></span>
                <div class="param-group param-group--text-stroke" :class="{ 'param-group--inactive': !textStrokeOf(editingText).enabled }">
                  <NTooltip placement="bottom">
                    <template #trigger>
                      <button
                        type="button"
                        class="param-chip param-chip--toggle"
                        :class="{ 'param-chip--active': textStrokeOf(editingText).enabled }"
                        :aria-pressed="textStrokeOf(editingText).enabled"
                        :aria-label="t('tools.imageEditor.textStroke')"
                        @click="updateTextStroke({ enabled: !textStrokeOf(editingText).enabled })"
                      >
                        <NIcon :size="22" :component="BorderStyle" />
                      </button>
                    </template>
                    {{ t('tools.imageEditor.textStroke') }}
                  </NTooltip>
                    <CanvasColorPicker
                      class="param-color"
                      :value="textStrokeOf(editingText).color"
                      @update:value="(v: string) => updateTextStroke({ color: v })"
                    />
                    <SizeField
                      :value="textStrokeOf(editingText).width"
                      :min="1" :max="20" :step="1"
                      :label-key="t('tools.imageEditor.strokeWidth')"
                      @update:value="(v: number) => updateTextStroke({ width: v })"
                    />

                </div>
                <span class="param-divider" aria-hidden="true"></span>
                <div class="param-group" :class="{ 'param-group--inactive': !textBackgroundOf(editingText).enabled }">
                  <NTooltip placement="bottom">
                    <template #trigger>
                      <button
                        type="button"
                        class="param-chip param-chip--toggle"
                        :class="{ 'param-chip--active': textBackgroundOf(editingText).enabled }"
                        :aria-pressed="textBackgroundOf(editingText).enabled"
                        :aria-label="t('tools.imageEditor.textBackground')"
                        @click="updateTextBackground({ enabled: !textBackgroundOf(editingText).enabled })"
                      >
                        <NIcon :size="22" :component="Highlight" />
                      </button>
                    </template>
                    {{ t('tools.imageEditor.textBackground') }}
                  </NTooltip>
                    <CanvasColorPicker
                      class="param-color"
                      :value="textBackgroundOf(editingText).color"
                      @update:value="(v: string) => updateTextBackground({ color: v })"
                    />
                    <SizeField
                      :value="textBackgroundOf(editingText).opacity"
                      :min="0" :max="1" :step="0.1"
                      :label-key="t('tools.imageEditor.operationopacity')"
                      @update:value="(v: number) => updateTextBackground({ opacity: v })"
                    />

                </div>
                  </div>
                </div>
              </template>

              <!-- Number params -->
              <template v-if="parameterTool === 'number'">
                <div class="param-mode-start">
                <NTooltip placement="bottom">
                  <template #trigger>
                    <NSelect
                      class="param-select param-select--text"
                      :value="editingNumber?.format ?? numberDefaults.format"
                      :options="numberFormatOptions"
                      :render-label="numberFormatRender.label"
                      :render-tag="numberFormatRender.tag"
                      @update:value="(v: string) => updateNumber({ format: v as NumberFormat })"
                    />
                  </template>
                  {{ t('tools.imageEditor.numberFormat') }}
                </NTooltip>
                  <span class="param-divider" aria-hidden="true"></span>
                </div>
                <div class="param-main">

                <NTooltip placement="bottom">
                  <template #trigger>
                    <AnnotationColorControl
                      :value="editingNumber?.color ?? numberDefaults.color"
                      :swatches="['#e03131', '#1971c2', '#2f9e44', '#f08c00', '#343a40']"
                      @update:value="(v: string) => updateNumber({ color: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.numberColor') }}
                </NTooltip>
                  <div class="param-tools">
                <NTooltip placement="bottom">
                  <template #trigger>
                    <SizeField
                      :value="editingNumber?.size ?? numberDefaults.size"
                      :min="10" :max="80" :step="1"
                      :label-key="t('tools.imageEditor.numberSize')"
                      :icon="Typography"
                      @update:value="(v: number) => updateNumber({ size: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.numberSize') }}
                </NTooltip>
                <NTooltip placement="bottom">
                  <template #trigger>
                    <NSelect
                      class="param-select param-select--text"
                      :value="editingNumber?.fontFamily ?? numberDefaults.fontFamily"
                      :options="fontFamilyOptions"
                      @update:value="(v: string) => updateNumber({ fontFamily: v })"
                    />
                  </template>
                  {{ t('tools.imageEditor.fontFamily') }}
                </NTooltip>
                <div class="param-group">
                  <span class="param-divider"></span>
                  <span class="param-label">{{ t('tools.imageEditor.leaderLine') }}</span>
                  <SizeField
                    :value="numberLeaderOf(editingNumber).strokeWidth"
                    :min="1" :max="20" :step="1"
                    :label-key="t('tools.imageEditor.leaderWidth')"
                    :icon="lineWeightIcon"
                    @update:value="(v: number) => updateNumberLeader({ strokeWidth: v })"
                  />
                  <NSelect
                    class="param-select"
                    :value="numberLeaderOf(editingNumber).strokeStyle"
                    :options="strokeStyleOptions"
                    :render-label="strokeRender.label"
                    :render-tag="strokeRender.tag"
                    @update:value="(v: string) => updateNumberLeader({ strokeStyle: v as StrokeStyle })"
                  />
                </div>
                  </div>
                </div>
              </template>

              <!-- Eraser params -->
              <template v-if="parameterTool === 'eraser'">
                <div class="param-mode-start param-mode-start--centered">
                <div class="param-group" role="radiogroup" :aria-label="t('tools.imageEditor.mode')">
                  <NTooltip v-for="opt in eraserModeOptions" :key="opt.value" placement="bottom">
                    <template #trigger>
                      <button type="button" class="param-chip"
                        :class="{ 'param-chip--active': eraserDefaults.mode === opt.value }"
                        :aria-pressed="eraserDefaults.mode === opt.value"
                        :aria-label="opt.label"
                        @click="eraserDefaults.mode = opt.value as 'rect' | 'brush'">
                        <NIcon :size="22" :component="opt.value === 'rect' ? Rectangle : Brush" />
                      </button>
                    </template>
                    {{ opt.label }}
                  </NTooltip>
                </div>
                </div>
                <div class="param-main param-main--centered">

                <span v-if="eraserDefaults.mode === 'brush'" class="param-divider" aria-hidden="true"></span>
                <NTooltip v-if="eraserDefaults.mode === 'brush'" placement="bottom">
                  <template #trigger>
                    <SizeField
                      :value="eraserDefaults.brushSize"
                      :min="4" :max="100" :step="1"
                      :label-key="t('tools.imageEditor.brushSize')"
                      :icon="lineWeightIcon"
                      @update:value="(v: number) => { eraserDefaults.brushSize = v; }"
                    />
                  </template>
                  {{ t('tools.imageEditor.brushSize') }}
                </NTooltip>
                </div>
              </template>

              <!-- Mosaic params -->
              <template v-if="parameterTool === 'mosaic'">
                <div class="param-mode-start param-mode-start--centered">
                <div class="param-group" role="radiogroup" :aria-label="t('tools.imageEditor.mode')">
                  <NTooltip v-for="opt in eraserModeOptions" :key="opt.value" placement="bottom">
                    <template #trigger>
                      <button type="button" class="param-chip"
                        :class="{ 'param-chip--active': mosaicMode === opt.value }"
                        :aria-pressed="mosaicMode === opt.value"
                        :aria-label="opt.label"
                        @click="updateMosaicMode(opt.value as 'rect' | 'brush')">
                        <NIcon :size="22" :component="opt.value === 'rect' ? Rectangle : Brush" />
                      </button>
                    </template>
                    {{ opt.label }}
                  </NTooltip>
                </div>
                  <span class="param-divider" aria-hidden="true"></span>
                </div>
                <div class="param-main param-main--centered">

                <div class="param-group" role="group" :aria-label="t('tools.imageEditor.effect')">
                  <NTooltip v-for="opt in mosaicEffectOptions" :key="opt.value" placement="bottom">
                    <template #trigger>
                      <button type="button" class="param-chip"
                        :class="{ 'param-chip--active': (editingMosaic?.effect ?? mosaicDefaults.effect) === opt.value }"
                        :aria-pressed="(editingMosaic?.effect ?? mosaicDefaults.effect) === opt.value"
                        :aria-label="opt.label"
                        @click="updateMosaic({ effect: opt.value as 'mosaic' | 'blur' })">
                        <NIcon :size="22" :component="opt.value === 'mosaic' ? GridDots : Blur" />
                      </button>
                    </template>
                    {{ opt.label }}
                  </NTooltip>
                </div>
                <span class="param-divider" aria-hidden="true"></span>
                <NTooltip placement="bottom">
                  <template #trigger>
                    <SizeField
                      :value="editingMosaic?.strength ?? mosaicDefaults.strength"
                      :min="1" :max="50" :step="1"
                      :label-key="t((editingMosaic?.effect ?? mosaicDefaults.effect) === 'blur' ? 'tools.imageEditor.blurStrength' : 'tools.imageEditor.mosaicStrength')"
                      :icon="GridDots"
                      @update:value="(v: number) => updateMosaic({ strength: v })"
                    />
                  </template>
                  {{ t((editingMosaic?.effect ?? mosaicDefaults.effect) === 'blur' ? 'tools.imageEditor.blurStrength' : 'tools.imageEditor.mosaicStrength') }}
                </NTooltip>
                <span v-if="mosaicMode === 'brush'" class="param-divider" aria-hidden="true"></span>
                <NTooltip v-if="mosaicMode === 'brush'" placement="bottom">
                  <template #trigger>
                    <SizeField
                      :value="mosaicBrushSize"
                      :min="4" :max="100" :step="1"
                      :label-key="t('tools.imageEditor.brushSize')"
                      :icon="lineWeightIcon"
                      @update:value="updateMosaicBrushSize"
                    />
                  </template>
                  {{ t('tools.imageEditor.brushSize') }}
                </NTooltip>
                </div>
              </template>
            </div>

            <div class="image-editor__footer">
              <NTooltip placement="bottom">
                <template #trigger>
                  <button
                    type="button"
                    class="image-editor__tool"
                    :disabled="!canUndoNow || operationBusy"
                    :aria-label="t('tools.imageEditor.undo')"
                    @click="undoAction"
                  >
                    <NIcon :size="22" :component="ArrowBackUp" />
                  </button>
                </template>
                {{ t('tools.imageEditor.undo') }}
              </NTooltip>
              <NTooltip placement="bottom">
                <template #trigger>
                  <button
                    type="button"
                    class="image-editor__tool"
                    :disabled="!canRedoNow || operationBusy"
                    :aria-label="t('tools.imageEditor.redo')"
                    @click="redoAction"
                  >
                    <NIcon :size="22" :component="ArrowForwardUp" />
                  </button>
                </template>
                {{ t('tools.imageEditor.redo') }}
              </NTooltip>
              <NButton v-if="selectedId !== null" type="error" size="small" @click="deleteSelected">
                <NIcon :size="20" :component="Trash" style="margin-right: 4px;" />
                {{ t('tools.imageEditor.deleteSelected') }}
              </NButton>
              <NPopconfirm @positive-click="clearAll">
                <template #trigger>
                  <NButton type="error" size="small">{{ t('tools.imageEditor.clearAll') }}</NButton>
                </template>
                {{ t('tools.imageEditor.confirmClearAll') }}
              </NPopconfirm>
            </div>
            </ToolTabs>
          </div>
  </ToolLayout>
</template>

<style scoped>
:deep(.tool-file-panel__params) { display: none; }
:deep(.tool-file-panel__actions) { flex-wrap:wrap; gap:8px; }
.image-editor__params :deep(.editor-function) {
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 72px;
  height: 68px;
  padding: 6px 4px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-2);
  font: inherit;
  font-size: var(--font-size-caption);
  line-height: 1.2;
  cursor: pointer;
}
.image-editor__params :deep(.editor-function:hover) {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
.image-editor__params :deep(.editor-function[aria-pressed="true"]) {
  background: var(--color-primary);
  color: var(--color-primary-text, #fff);
}
.image-editor__params :deep(.editor-function span) { text-align: center; }

/* The box is wider and taller than most images; centre the stage in it rather
   than leaving it pinned to the top-left corner. */
.canvas-wrapper--crop { cursor:crosshair; touch-action:none; }
.canvas-wrapper {
  flex: 1;
  min-height: 0;
  max-width: 100%;
  min-width: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* The stage and the inline text editor share this coordinate space, so the
   editor positions a textarea at stage coordinates with a plain absolute offset. */
.image-editor__stage-wrap {
  position: relative;
  background-color: var(--color-surface);
  background-image: conic-gradient(var(--color-hairline) 25%, transparent 0 50%, var(--color-hairline) 0 75%, transparent 0);
  background-size: 16px 16px;
}

.image-editor__text-edit {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.image-editor__text-input {
  min-width: 120px;
  max-width: 320px;
  padding: 4px 6px;
  border: 1px dashed var(--color-primary);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-ink);
  font-size: var(--font-size-body-md);
  resize: none;
  outline: none;
  box-shadow: var(--shadow-pop);
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
  margin-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.image-editor__toolbar {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.image-editor__tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
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

/* The params strip lays its controls out horizontally and wraps, replacing the
   old one-parameter-per-row stack. Each control is an icon chip, a colour
   swatch, a preview select, or a SizeField; a param-group clusters a toggle
   with its dependent controls. */
.image-editor__params-row :deep(.n-button), .image-editor__params-row :deep(.n-input), .image-editor__params-row :deep(.n-base-selection) { --n-height:42px !important; min-height:42px; }
.image-editor__params-row :deep(.param-chip) { min-width:42px; min-height:42px; }
.image-editor__footer :deep(.n-button) { --n-height:42px !important; height:42px; }
.image-editor__params-row {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
}

.param-mode-start { display:flex; align-items:center; justify-content:flex-end; gap:var(--spacing-sm); flex:0 0 140px; width:140px; box-sizing:border-box; }
.param-mode-start.param-mode-start--centered { flex:0 0 auto; width:auto; }
.param-main.param-main--centered { flex:0 0 auto; justify-content:center; }
.param-main { display:flex; align-items:center; justify-content:flex-start; flex-wrap:wrap; flex:1; min-width:0; gap:var(--spacing-sm); }
.image-editor__params-row :deep(.size-field__group) { margin-inline:0; }
.param-tools { display:flex; flex:1; min-width:0; align-items:center; justify-content:center; flex-wrap:wrap; column-gap:12px; row-gap:12px; }
.param-chip--toggle[aria-pressed="false"] { border:1px solid var(--color-hairline-strong); }
.param-group.param-group--text-stroke,.param-group.param-group--fill { gap:12px; }
.param-group--inactive > :not(.param-chip--toggle) {
  filter: grayscale(1);
  opacity: 0.4;
}
.param-group {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.param-label {
  color: var(--color-text-2);
  font-size: var(--font-size-caption);
  white-space: nowrap;
  user-select: none;
}

.param-divider {
  display: inline-block;
  width: 1px;
  height: 42px;
  background: var(--color-hairline-strong);
  flex-shrink: 0;
  align-self: center;
  margin: 0;
}

.param-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-2);
  cursor: pointer;
  transition: background var(--motion-fast) var(--motion-ease),
    color var(--motion-fast) var(--motion-ease);
}

.param-chip:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.param-chip--active {
  background: var(--color-primary);
  color: var(--color-primary-text, #fff);
}

/* NColorPicker sits inside NTooltip's trigger slot, so the scoped data-v attr
   never reaches its root element; only a :deep() selector can size it. Without
   this the root is width:100% and the two colour blocks blow up the strip.
   Fixed 32×32 square, and the hex label inside the fill is hidden — a 32 px
   block cannot show "#rrggbb", so the block stays a pure colour swatch. */
:deep(.param-color) {
  position: relative;
  overflow: hidden;
  width: 42px;
  height: 42px;
  --n-height: 42px;
  padding: 0;
  border: 3px solid transparent;
  border-radius: 6px;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #ff6b6b, #4dabf7, #51cf66, #ffd43b, #cc5de8) border-box;
  box-shadow: 0 0 0 2px white inset;
}

:deep(.param-color .n-color-picker__fill) {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  border-radius: 3px;
}

:deep(.param-color .n-color-picker__value) {
  display: none;
}

/* Match NSelect to the default action height (42px) to match other controls. */
.param-select {
  width: 96px;
  height: 42px !important;
}

.param-select--text {
  width: 110px;
  height: 42px !important;
}

:deep(.param-select),
:deep(.param-select--text) {
  height: 42px !important;
}

:deep(.param-select .n-base-selection),
:deep(.param-select--text .n-base-selection) {
  height: 42px !important;
  min-height: 42px !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.param-select .n-base-selection-input),
:deep(.param-select--text .n-base-selection-input) {
  height: 42px !important;
  min-height: 42px !important;
  padding: 0 8px !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.param-select .n-base-selection-label),
:deep(.param-select--text .n-base-selection-label) {
  height: 42px !important;
  line-height: 42px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.param-select .n-base-selection__arrow),
:deep(.param-select--text .n-base-selection__arrow) {
  height: 42px !important;
  display: flex !important;
  align-items: center !important;
}

@media (max-width:640px) {
  .param-mode-start, .param-mode-start.param-mode-start--centered { flex:0 0 100%; width:100%; justify-content:center; }
  .param-main, .param-main.param-main--centered, .param-tools { flex:0 0 100%; width:100%; justify-content:center; flex-wrap:wrap; }
  .param-group { flex-wrap:wrap; justify-content:center; max-width:100%; }
}

.image-editor__footer {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
}
</style>

<!-- NSelect teleports its options and tag to <body>, outside this component's
     scoped-attribute reach, so the SVG sample styles must live in a global block. -->
<style>
/* SVG samples inside dropdown options and the selected tag. Width fills the
   container so the closed tag shows the whole sample (no clipped arrowhead). */
.param-preview {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 64 / 20;
  color: var(--color-ink);
}

.param-preview--text {
  font-size: var(--font-size-body-sm);
  line-height: 20px;
  padding: 0 var(--spacing-xxs);
}
</style>
