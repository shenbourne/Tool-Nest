<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type Component } from 'vue';
import {
  NButton,
  NCard,
  NColorPicker,
  NIcon,
  NInput,
  NInputNumber,
  NPopconfirm,
  NSelect,
  NSwitch,
  NTooltip,
} from 'naive-ui';
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
import { usePreferencesStore } from '@/stores/preferences.store';
import { resolveCssColorToken } from '@/utils/css-tokens';
import {
  arrowPoints,
  canRedo,
  canUndo,
  commit,
  createHistory,
  formatNumber,
  historyState,
  rectFromPoints,
  redo,
  strokeDash,
  undo,
  type Annotation,
  type ArrowConfig,
  type ArrowStyle,
  type LineAnnotation,
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
let nextId = 1;

const canUndoNow = computed(() => canUndo(history.value));
const canRedoNow = computed(() => canRedo(history.value));

const selected = computed(() => annotations.value.find((a) => a.id === selectedId.value) ?? null);
const selectedShape = computed(() => (selected.value?.type === 'shape' ? selected.value : null));
const selectedLine = computed(() => (selected.value?.type === 'line' ? selected.value : null));
const selectedNumber = computed(() => (selected.value?.type === 'number' ? selected.value : null));
const selectedPen = computed(() => (selected.value?.type === 'pen' ? selected.value : null));
const selectedText = computed(() => (selected.value?.type === 'text' ? selected.value : null));

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

/** Property edits (panel controls, handle drags) coalesce through this timer. */
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
  nextNumber.value = 1;
  pushHistory();
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
  leaderEnabled: false,
  leaderStrokeWidth: 2,
  leaderStrokeStyle: 'solid' as StrokeStyle,
  leaderArrow: { style: 'triangle' as ArrowStyle, size: 10 },
});

// Auto-increment counter for the number tool: starts at 1, bumps per placement,
// resets on clear-all and on format change. Deleting a badge never renumbers.
const nextNumber = ref(1);

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

const shapeDraftRect = computed(() => {
  const d = shapeDraft.value;
  if (!d) return null;
  return rectFromPoints(d.x1, d.y1, d.x2, d.y2);
});

/** The annotation the params panel edits; drawing tools fall back to defaults. */
const editingShape = computed(() =>
  activeTool.value === 'shape' ? selectedShape.value : null);
const editingLine = computed(() =>
  activeTool.value === 'line' ? selectedLine.value : null);
const editingNumber = computed(() =>
  activeTool.value === 'number' ? selectedNumber.value : null);
const editingPen = computed(() =>
  activeTool.value === 'pen' ? selectedPen.value : null);
const editingText = computed(() =>
  activeTool.value === 'text' ? selectedText.value : null);

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

function onStageClick(e: KonvaPointerEvent) {
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
    if (e.target === stageNode()) selectedId.value = null;
    return;
  }
  if (activeTool.value === 'text') {
    // Annotation clicks stop bubbling (see onAnnotationClick), so reaching
    // here means the background — which is covered by the base image, not
    // the stage node itself.
    const pointer = pointerPosition(e);
    if (!pointer) return;
    const d = textDefaults.value;
    annotations.value = [
      ...annotations.value,
      {
        id: nextId++,
        type: 'text',
        x: pointer.x,
        y: pointer.y,
        text: d.text || t('tools.imageEditor.defaultText'),
        fontSize: d.fontSize,
        color: d.color,
        fontFamily: d.fontFamily,
        rotation: 0,
        stroke: { ...d.stroke },
        background: { ...d.background },
      },
    ];
    pushHistory();
  }
}

function finishPolyline() {
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
  if (d.leaderEnabled) {
    leaderDraft.value = [x, y, x, y];
  }
}

function onStageMouseDown(e: KonvaPointerEvent) {
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
}

function onStageMouseMove(e: KonvaPointerEvent) {
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
}

function onStageMouseUp() {
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
}

/** Clicks on an annotation must not reach the stage, which would draw a new one. */
function onAnnotationClick(annotation: Annotation, e: KonvaPointerEvent) {
  e.cancelBubble = true;
  if (activeTool.value !== 'select') return;
  selectedId.value = annotation.id;
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
    enabled: numberDefaults.value.leaderEnabled,
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
    numberDefaults.value.leaderEnabled = next.enabled;
    numberDefaults.value.leaderStrokeWidth = next.strokeWidth;
    numberDefaults.value.leaderStrokeStyle = next.strokeStyle;
    numberDefaults.value.leaderArrow = { ...next.arrow };
  }
}

function arrowStyleValue(cfg: ArrowConfig | null): ArrowStyle {
  return cfg?.style ?? 'none';
}

function updateStartArrow(style: ArrowStyle, size?: number) {
  const current = editingLine.value?.startArrow ?? lineDefaults.value.startArrow;
  const nextSize = size ?? current?.size ?? 12;
  const next: ArrowConfig | null = style === 'none' ? null : { style, size: nextSize };
  updateLine({ startArrow: next });
}

function updateEndArrow(style: ArrowStyle, size?: number) {
  const current = editingLine.value?.endArrow ?? lineDefaults.value.endArrow;
  const nextSize = size ?? current?.size ?? 12;
  const next: ArrowConfig | null = style === 'none' ? null : { style, size: nextSize };
  updateLine({ endArrow: next });
}

function updateStartArrowSize(size: number | null) {
  const current = editingLine.value?.startArrow ?? lineDefaults.value.startArrow;
  if (!current) return;
  updateLine({ startArrow: { ...current, size: size ?? 12 } });
}

function updateEndArrowSize(size: number | null) {
  const current = editingLine.value?.endArrow ?? lineDefaults.value.endArrow;
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
          <ToolFileUpload ref="fileUpload" accept="image/*" compact @change="onFileChange" />
        </div>
        <img v-if="imageUrl" :src="imageUrl" style="display:none" @load="onImageLoad" />
        <div v-if="imageUrl" class="canvas-wrapper">
          <v-stage
            ref="stageRef"
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

            <div class="image-editor__rows">
              <!-- Shape params -->
              <template v-if="activeTool === 'shape'">
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.toolShape') }}</span>
                  <NSelect
                    :value="editingShape?.kind ?? shapeDefaults.kind"
                    :options="shapeKindOptions"
                    style="width: 160px;"
                    @update:value="(v: string) => updateShape({ kind: v as ShapeAnnotation['kind'] })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.colour') }}</span>
                  <NColorPicker
                    :value="editingShape?.stroke ?? shapeDefaults.stroke"
                    style="width: 160px;"
                    @update:value="(v: string) => updateShape({ stroke: v })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.width') }}</span>
                  <NInputNumber
                    :value="editingShape?.strokeWidth ?? shapeDefaults.strokeWidth"
                    :min="1"
                    :max="50"
                    :step="1"
                    style="width: 160px;"
                    @update:value="(v: number | null) => updateShape({ strokeWidth: v ?? 1 })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.stroke') }}</span>
                  <NSelect
                    :value="editingShape?.strokeStyle ?? shapeDefaults.strokeStyle"
                    :options="strokeStyleOptions"
                    style="width: 160px;"
                    @update:value="(v: string) => updateShape({ strokeStyle: v as StrokeStyle })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.fill') }}</span>
                  <NSwitch
                    :value="editingShape?.fillEnabled ?? shapeDefaults.fillEnabled"
                    @update:value="(v: boolean) => updateShape({ fillEnabled: v })"
                  />
                  <NColorPicker
                    v-if="editingShape?.fillEnabled ?? shapeDefaults.fillEnabled"
                    :value="editingShape?.fill ?? shapeDefaults.fill"
                    style="width: 120px;"
                    @update:value="(v: string) => updateShape({ fill: v })"
                  />
                </div>
                <div v-if="(editingShape?.kind ?? shapeDefaults.kind) === 'rect'" class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.cornerRadius') }}</span>
                  <NInputNumber
                    :value="editingShape?.cornerRadius ?? shapeDefaults.cornerRadius"
                    :min="0"
                    :max="100"
                    :step="1"
                    style="width: 160px;"
                    @update:value="(v: number | null) => updateShape({ cornerRadius: v ?? 0 })"
                  />
                </div>
              </template>

              <!-- Line params -->
              <template v-if="activeTool === 'line'">
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.toolLine') }}</span>
                  <NSelect
                    :value="editingLine?.kind ?? lineDefaults.kind"
                    :options="lineKindOptions"
                    style="width: 160px;"
                    @update:value="(v: string) => updateLine({ kind: v as LineAnnotation['kind'] })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.colour') }}</span>
                  <NColorPicker
                    :value="editingLine?.stroke ?? lineDefaults.stroke"
                    style="width: 160px;"
                    @update:value="(v: string) => updateLine({ stroke: v })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.width') }}</span>
                  <NInputNumber
                    :value="editingLine?.strokeWidth ?? lineDefaults.strokeWidth"
                    :min="1"
                    :max="50"
                    :step="1"
                    style="width: 160px;"
                    @update:value="(v: number | null) => updateLine({ strokeWidth: v ?? 1 })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.stroke') }}</span>
                  <NSelect
                    :value="editingLine?.strokeStyle ?? lineDefaults.strokeStyle"
                    :options="strokeStyleOptions"
                    style="width: 160px;"
                    @update:value="(v: string) => updateLine({ strokeStyle: v as StrokeStyle })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.startArrow') }}</span>
                  <NSelect
                    :value="arrowStyleValue(editingLine?.startArrow ?? lineDefaults.startArrow)"
                    :options="arrowStyleOptions"
                    style="width: 160px;"
                    @update:value="(v: string) => updateStartArrow(v as ArrowStyle)"
                  />
                  <NInputNumber
                    v-if="arrowStyleValue(editingLine?.startArrow ?? lineDefaults.startArrow) !== 'none'"
                    :value="(editingLine?.startArrow ?? lineDefaults.startArrow)?.size ?? 12"
                    :min="4"
                    :max="40"
                    :step="1"
                    style="width: 100px;"
                    @update:value="updateStartArrowSize"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.endArrow') }}</span>
                  <NSelect
                    :value="arrowStyleValue(editingLine?.endArrow ?? lineDefaults.endArrow)"
                    :options="arrowStyleOptions"
                    style="width: 160px;"
                    @update:value="(v: string) => updateEndArrow(v as ArrowStyle)"
                  />
                  <NInputNumber
                    v-if="arrowStyleValue(editingLine?.endArrow ?? lineDefaults.endArrow) !== 'none'"
                    :value="(editingLine?.endArrow ?? lineDefaults.endArrow)?.size ?? 12"
                    :min="4"
                    :max="40"
                    :step="1"
                    style="width: 100px;"
                    @update:value="updateEndArrowSize"
                  />
                </div>
              </template>

              <!-- Pen params -->
              <template v-if="activeTool === 'pen'">
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.colour') }}</span>
                  <NColorPicker
                    :value="editingPen?.stroke ?? penDefaults.stroke"
                    style="width: 160px;"
                    @update:value="(v: string) => updatePen({ stroke: v })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.width') }}</span>
                  <NInputNumber
                    :value="editingPen?.strokeWidth ?? penDefaults.strokeWidth"
                    :min="1"
                    :max="30"
                    :step="1"
                    style="width: 160px;"
                    @update:value="(v: number | null) => updatePen({ strokeWidth: v ?? 1 })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.stroke') }}</span>
                  <NSelect
                    :value="editingPen?.strokeStyle ?? penDefaults.strokeStyle"
                    :options="strokeStyleOptions"
                    style="width: 160px;"
                    @update:value="(v: string) => updatePen({ strokeStyle: v as StrokeStyle })"
                  />
                </div>
              </template>

              <!-- Text params -->
              <template v-if="activeTool === 'text'">
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.content') }}</span>
                  <NInput
                    :value="editingText?.text ?? textDefaults.text"
                    :placeholder="t('tools.imageEditor.textPlaceholder')"
                    style="width: 160px;"
                    @update:value="(v: string) => updateText({ text: v })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.colour') }}</span>
                  <NColorPicker
                    :value="editingText?.color ?? textDefaults.color"
                    style="width: 160px;"
                    @update:value="(v: string) => updateText({ color: v })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.size') }}</span>
                  <NInputNumber
                    :value="editingText?.fontSize ?? textDefaults.fontSize"
                    :min="8"
                    :max="120"
                    :step="1"
                    style="width: 160px;"
                    @update:value="(v: number | null) => updateText({ fontSize: v ?? 24 })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.fontFamily') }}</span>
                  <NSelect
                    :value="editingText?.fontFamily ?? textDefaults.fontFamily"
                    :options="fontFamilyOptions"
                    style="width: 160px;"
                    @update:value="(v: string) => updateText({ fontFamily: v })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.stroke') }}</span>
                  <NSwitch
                    :value="textStrokeOf(editingText).enabled"
                    @update:value="(v: boolean) => updateTextStroke({ enabled: v })"
                  />
                  <template v-if="textStrokeOf(editingText).enabled">
                    <NColorPicker
                      :value="textStrokeOf(editingText).color"
                      style="width: 120px;"
                      @update:value="(v: string) => updateTextStroke({ color: v })"
                    />
                    <NInputNumber
                      :value="textStrokeOf(editingText).width"
                      :min="1"
                      :max="20"
                      :step="1"
                      style="width: 100px;"
                      @update:value="(v: number | null) => updateTextStroke({ width: v ?? 1 })"
                    />
                  </template>
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.background') }}</span>
                  <NSwitch
                    :value="textBackgroundOf(editingText).enabled"
                    @update:value="(v: boolean) => updateTextBackground({ enabled: v })"
                  />
                  <template v-if="textBackgroundOf(editingText).enabled">
                    <NColorPicker
                      :value="textBackgroundOf(editingText).color"
                      style="width: 120px;"
                      @update:value="(v: string) => updateTextBackground({ color: v })"
                    />
                    <NInputNumber
                      :value="textBackgroundOf(editingText).opacity"
                      :min="0"
                      :max="1"
                      :step="0.1"
                      style="width: 100px;"
                      @update:value="(v: number | null) => updateTextBackground({ opacity: v ?? 0.8 })"
                    />
                  </template>
                </div>
              </template>

              <!-- Number params -->
              <template v-if="activeTool === 'number'">
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.numberFormat') }}</span>
                  <NSelect
                    :value="editingNumber?.format ?? numberDefaults.format"
                    :options="numberFormatOptions"
                    style="width: 160px;"
                    @update:value="(v: string) => updateNumber({ format: v as NumberFormat })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.colour') }}</span>
                  <NColorPicker
                    :value="editingNumber?.color ?? numberDefaults.color"
                    style="width: 160px;"
                    @update:value="(v: string) => updateNumber({ color: v })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.size') }}</span>
                  <NInputNumber
                    :value="editingNumber?.size ?? numberDefaults.size"
                    :min="10"
                    :max="80"
                    :step="1"
                    style="width: 160px;"
                    @update:value="(v: number | null) => updateNumber({ size: v ?? 24 })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.fontFamily') }}</span>
                  <NSelect
                    :value="editingNumber?.fontFamily ?? numberDefaults.fontFamily"
                    :options="fontFamilyOptions"
                    style="width: 160px;"
                    @update:value="(v: string) => updateNumber({ fontFamily: v })"
                  />
                </div>
                <div class="image-editor__row">
                  <span class="image-editor__row-label">{{ t('tools.imageEditor.leaderLine') }}</span>
                  <NSwitch
                    :value="numberLeaderOf(editingNumber).enabled"
                    @update:value="(v: boolean) => updateNumberLeader({ enabled: v })"
                  />
                </div>
                <template v-if="numberLeaderOf(editingNumber).enabled">
                  <div class="image-editor__row">
                    <span class="image-editor__row-label">{{ t('tools.imageEditor.leaderWidth') }}</span>
                    <NInputNumber
                      :value="numberLeaderOf(editingNumber).strokeWidth"
                      :min="1"
                      :max="20"
                      :step="1"
                      style="width: 160px;"
                      @update:value="(v: number | null) => updateNumberLeader({ strokeWidth: v ?? 2 })"
                    />
                  </div>
                  <div class="image-editor__row">
                    <span class="image-editor__row-label">{{ t('tools.imageEditor.leaderStroke') }}</span>
                    <NSelect
                      :value="numberLeaderOf(editingNumber).strokeStyle"
                      :options="strokeStyleOptions"
                      style="width: 160px;"
                      @update:value="(v: string) => updateNumberLeader({ strokeStyle: v as StrokeStyle })"
                    />
                  </div>
                </template>
              </template>
            </div>

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
