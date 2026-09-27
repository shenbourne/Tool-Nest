<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NColorPicker, NInput, NPopconfirm } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const tool = useCurrentTool();

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

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  if (f) {
    file.value = f;
    if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
    imageUrl.value = URL.createObjectURL(f);
  }
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

function onTextType(annotation: Annotation, e: KeyboardEvent) {
  if (annotation.type === 'text' && e.key === 'Enter') {
    annotation.editing = false;
  }
}

const displayAnnotations = computed(() => annotations.value);
const tempLine = computed(() => currentLine.value);

function downloadImage() {
  if (!imageEl.value) return;
  const canvas = document.createElement('canvas');
  const imgW = imageEl.value.naturalWidth;
  const imgH = imageEl.value.naturalHeight;
  canvas.width = imgW;
  canvas.height = imgH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const scaleX = imgW / stageWidth.value;
  const scaleY = imgH / stageHeight.value;

  ctx.drawImage(imageEl.value, 0, 0);

  // Render annotations at original image scale
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
onUnmounted(() => { if (imageUrl.value) URL.revokeObjectURL(imageUrl.value); });
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.imageEditor.name')">
        <NSpace vertical :size="12">
          <div>
            <label for="editor-file-upload">{{ t('common.uploadFile', 'Upload an image') }}</label>
            <input id="editor-file-upload" type="file" accept="image/*" @change="onFileChange" style="display:block;margin-top:8px;" />
          </div>
          <div v-if="imageUrl">
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
          </div>
        </NSpace>
      </NCard>

      <NCard :title="t('common.settings', 'Settings')">
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
              <label>{{ t('tools.imageEditor.color') }}</label>
              <NColorPicker v-model:value="drawColor" style="width:160px;" />
            </div>
            <div>
              <label>{{ t('tools.imageEditor.lineWidth') }}</label>
              <NInputNumber v-model:value="lineWidth" :min="1" :max="50" :step="1" style="width:120px;" />
            </div>
            <div>
              <label>{{ t('tools.imageEditor.fontSize') }}</label>
              <NInputNumber v-model:value="fontSize" :min="8" :max="200" :step="1" style="width:120px;" />
            </div>
          </NSpace>
          <div v-if="activeTool === 'text'">
            <label>{{ t('tools.imageEditor.text') }}</label>
            <NInput v-model:value="textContent" :placeholder="t('tools.imageEditor.textPlaceholder')" style="width:250px;" />
          </div>
          <NButton type="success" :disabled="!file" @click="downloadImage">{{ t('tool.download') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
