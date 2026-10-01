<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NColorPicker, NInput, NPopconfirm } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useCopy } from '@/composables/useCopy';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const tool = useCurrentTool();
const { copyFileToClipboard } = useCopy();

type Annotation =
  | { id: number; type: 'text'; x: number; y: number; text: string; fontSize: number; color: string; editing: boolean }
  | { id: number; type: 'line'; points: number[]; color: string; strokeWidth: number };

const file = ref<File | null>(null);
const imageUrl = ref<string>('');
const imageEl = ref<HTMLImageElement | null>(null);
const stageWidth = ref(800);
const stageHeight = ref(600);

const drawColor = ref('#ff0000');
const lineWidth = ref(3);
const fontSize = ref(24);
const textContent = ref(t('tools.imageEditor.defaultText'));

// Active tool: 'none' | 'text' | 'line'
const activeTool = ref<'none' | 'text' | 'line'>('none');

const annotations = ref<Annotation[]>([]);
let nextId = 1;

// Drawing state for line tool
const isDrawing = ref(false);
const currentLine = ref<number[]>([]);

function onFileChange(files: File[]) {
  const f = files[0] ?? null;
  file.value = f;
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  imageUrl.value = f ? URL.createObjectURL(f) : '';
}

function onImageLoad(e: Event) {
  const img = (e.target as HTMLImageElement);
  imageEl.value = img;
  const maxW = 800;
  const maxH = 600;
  const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
  stageWidth.value = Math.round(img.naturalWidth * scale);
  stageHeight.value = Math.round(img.naturalHeight * scale);
}

function setTool(toolType: 'none' | 'text' | 'line') {
  activeTool.value = toolType;
}

function clearAll() {
  annotations.value = [];
  activeTool.value = 'none';
}

function onStageClick(e: any) {
  if (activeTool.value === 'text') {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    annotations.value.push({
      id: nextId++,
      type: 'text',
      x: pointer.x,
      y: pointer.y,
      text: textContent.value,
      fontSize: fontSize.value,
      color: drawColor.value,
      editing: false,
    });
  }
}

function onStageMouseDown(e: any) {
  if (activeTool.value !== 'line') return;
  const stage = e.target.getStage();
  const pointer = stage.getPointerPosition();
  if (!pointer) return;
  isDrawing.value = true;
  currentLine.value = [pointer.x, pointer.y, pointer.x, pointer.y];
}

function onStageMouseMove(e: any) {
  if (!isDrawing.value) return;
  const stage = e.target.getStage();
  const pointer = stage.getPointerPosition();
  if (!pointer) return;
  currentLine.value = [currentLine.value[0], currentLine.value[1], pointer.x, pointer.y];
}

function onStageMouseUp() {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  if (currentLine.value.length >= 4) {
    annotations.value.push({
      id: nextId++,
      type: 'line',
      points: [...currentLine.value],
      color: drawColor.value,
      strokeWidth: lineWidth.value,
    });
  }
  currentLine.value = [];
}

function onTextDblClick(annotation: Annotation) {
  if (annotation.type === 'text') {
    annotation.editing = true;
  }
}

// Write the dragged position back into the annotation so the export matches
// what is on screen.
function onTextDragEnd(annotation: Annotation, e: { target: { x(): number; y(): number } }) {
  if (annotation.type === 'text') {
    annotation.x = e.target.x();
    annotation.y = e.target.y();
  }
}

const editingAnnotation = computed(() =>
  annotations.value.find(a => a.type === 'text' && a.editing),
);

const displayAnnotations = computed(() => annotations.value);
const tempLine = computed(() => currentLine.value);

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
    } else if (ann.type === 'line') {
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
onUnmounted(() => { if (imageUrl.value) URL.revokeObjectURL(imageUrl.value); });
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept="image/*" compact @change="onFileChange" />
        </template>
        <template #output-files>
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
                  @load="onImageLoad"
                />
                <template v-for="ann in displayAnnotations" :key="ann.id">
                  <v-text
                    v-if="ann.type === 'text'"
                    :config="{
                      x: ann.x,
                      y: ann.y,
                      text: ann.text,
                      fontSize: ann.fontSize,
                      fill: ann.color,
                      draggable: true,
                    }"
                    @dblclick="onTextDblClick(ann)"
                    @dragend="onTextDragEnd(ann, $event)"
                  />
                  <v-line
                    v-if="ann.type === 'line'"
                    :config="{
                      points: ann.points,
                      stroke: ann.color,
                      strokeWidth: ann.strokeWidth,
                      lineCap: 'round',
                    }"
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
              </v-layer>
            </v-stage>
            <NInput
              v-if="editingAnnotation && editingAnnotation.type === 'text'"
              v-model:value="editingAnnotation.text"
              :placeholder="t('tools.imageEditor.textPlaceholder')"
              style="max-width: 260px; margin-top: 8px;"
              @keyup.enter="editingAnnotation.editing = false"
              @blur="editingAnnotation.editing = false"
              :input-props="{ id: 'imageEditorField0' }"
            />
          </div>
        </template>
        <template #actions-right>
          <NButton :disabled="!file" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!file" @click="downloadImage">{{ t('tool.exportFile') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NSpace :size="8">
              <NButton :type="activeTool === 'text' ? 'primary' : 'default'" @click="setTool('text')">{{ t('tools.imageEditor.addText') }}</NButton>
              <NButton :type="activeTool === 'line' ? 'primary' : 'default'" @click="setTool('line')">{{ t('tools.imageEditor.drawLine') }}</NButton>
              <NButton @click="setTool('none')">{{ t('common.select') }}</NButton>
              <NPopconfirm @positive-click="clearAll">
                <template #trigger>
                  <NButton type="error">{{ t('tools.imageEditor.clearAll') }}</NButton>
                </template>
                {{ t('tools.imageEditor.confirmClearAll') }}
              </NPopconfirm>
            </NSpace>
            <NSpace :size="16">
              <div>
                <span>{{ t('tools.imageEditor.color') }}</span>
                <NColorPicker v-model:value="drawColor" style="width:160px;" />
              </div>
              <div>
                <label :for="'imageEditorField1'">{{ t('tools.imageEditor.lineWidth') }}</label>
                <NInputNumber v-model:value="lineWidth" :min="1" :max="50" :step="1" style="width:120px;" :input-props="{ id: 'imageEditorField1' }" />
              </div>
              <div>
                <label :for="'imageEditorField2'">{{ t('tools.imageEditor.fontSize') }}</label>
                <NInputNumber v-model:value="fontSize" :min="8" :max="200" :step="1" style="width:120px;" :input-props="{ id: 'imageEditorField2' }" />
              </div>
            </NSpace>
            <div v-if="activeTool === 'text'">
              <label :for="'imageEditorField3'">{{ t('tools.imageEditor.text') }}</label>
              <NInput v-model:value="textContent" :placeholder="t('tools.imageEditor.textPlaceholder')" style="width:250px;" :input-props="{ id: 'imageEditorField3' }" />
            </div>
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>

<style scoped>
.canvas-wrapper {
  max-width: 100%;
  overflow: auto;
}
</style>
