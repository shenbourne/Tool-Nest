<script setup lang="ts">
import { ref, watch, computed, type Component } from 'vue';
import { NButton, NIcon, NInput, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { Crop, FlipHorizontal, FlipVertical, RotateClockwise, ArrowsDiagonal, Palette, Droplet, ColorPicker, Sun, Contrast, AdjustmentsHorizontal } from '@vicons/tabler';
import SizeField from './SizeField.vue';
import CropRatioWheel from './CropRatioWheel.vue';
import RotationRuler from './RotationRuler.vue';
import AdjustmentSlider from './AdjustmentSlider.vue';
import CanvasColorPicker from './CanvasColorPicker.vue';
import { type CropRectangle, type ImageOperation } from './image-transforms';
const props = defineProps<{ tab: 'crop' | 'adjust' | 'annotate'; width: number; height: number; disabled: boolean; busy: boolean; cropSelection: CropRectangle | null }>();
const emit = defineEmits<{ apply: [operation: ImageOperation]; preview: [operation: ImageOperation | null]; cropSettings: [settings: { enabled: boolean; ratio: number }] }>();
const { t } = useI18n();
const operationIcons: Record<string, Component> = { crop: Crop, flip: FlipHorizontal, rotate: RotateClockwise, resize: ArrowsDiagonal, hue: Palette, saturation: AdjustmentsHorizontal, brightness: Sun, contrast: Contrast, opacity: Droplet, transparent: ColorPicker };
const cropTool = ref('crop'); const adjustTool = ref('hue');
const ratio = ref(0);
const resizeWidth = ref(1); const resizeHeight = ref(1); const lockAspect = ref(true);
const angle = ref(0); const hue = ref(100); const saturation = ref(100); const brightness = ref(100); const contrast = ref(100);
const softenEdges = ref(false);
const transparencyEnabled = ref(false);
const opacity = ref(100); const color = ref('#ffffff'); const tolerance = ref(0);
const text = ref('Watermark'); const watermarkColor = ref('#ffffff'); const watermarkSize = ref(32); const watermarkOpacity = ref(50);
watch(adjustTool, value => { if (value === 'transparent') transparencyEnabled.value = true; });
const adjustmentValue = computed({
  get: () => ({hue:hue.value,saturation:saturation.value,brightness:brightness.value,contrast:contrast.value,opacity:opacity.value,transparent:tolerance.value}[adjustTool.value] ?? 100),
  set: (value:number) => {
    if (adjustTool.value === 'hue') hue.value = value;
    else if (adjustTool.value === 'saturation') saturation.value = value;
    else if (adjustTool.value === 'brightness') brightness.value = value;
    else if (adjustTool.value === 'contrast') contrast.value = value;
    else if (adjustTool.value === 'opacity') opacity.value = value;
    else { tolerance.value = value; transparencyEnabled.value = true; }
  },
});
function finishOperation(kind: ImageOperation['kind']) {
  if (kind === 'colors' || kind === 'adjust') { hue.value = 100; saturation.value = 100; brightness.value = 100; contrast.value = 100; }
  if (kind === 'opacity' || kind === 'adjust') opacity.value = 100;
  if (kind === 'adjust') transparencyEnabled.value = false;
  if (kind === 'rotate') angle.value = 0;
}
function resetPreview() {
  finishOperation('adjust');
  angle.value = 0;
  tolerance.value = 0;
  softenEdges.value = false;
}
function resetAll() {
  resetPreview();
  cropTool.value = 'crop';
  adjustTool.value = 'hue';
  color.value = '#ffffff';
  text.value = 'Watermark'; watermarkColor.value = '#ffffff'; watermarkSize.value = 32; watermarkOpacity.value = 50;
  ratio.value = 0;
  resizeWidth.value = props.width || 1; resizeHeight.value = props.height || 1;
  lockAspect.value = true;
}
defineExpose({ finishOperation, resetPreview, resetAll });
const ratioOptions = computed(() => [{label:t('tools.imageEditor.freeRatio'),value:0}, {label:t('tools.imageEditor.originalRatio'),value:-1}, ...[[1,1],[2,3],[3,2],[3,4],[4,3],[9,16],[16,9]].map(([a,b]) => ({label:`${a}:${b}`,value:a/b}))]);
watch([() => props.width, () => props.height], () => {
  ratio.value = 0;
  resizeWidth.value = props.width || 1; resizeHeight.value = props.height || 1;
}, { immediate: true });
watch([() => props.tab, cropTool, ratio, () => props.width, () => props.height], () => {
  emit('cropSettings', { enabled: props.tab === 'crop' && cropTool.value === 'crop', ratio: ratio.value === -1 ? props.width / Math.max(1, props.height) : ratio.value });
}, { immediate: true });
function rotateBy(delta: number) {
  const next = angle.value + delta;
  emit('preview', {kind:'rotate', angle:next});
  emit('apply', {kind:'rotate', angle:next});
}
function commitRotation(value: number) {
  if (value !== 0) emit('apply', {kind:'rotate',angle:value});
}
function resize(v: number, axis: 'width' | 'height') {
  if (axis === 'width') { resizeWidth.value = v; if (lockAspect.value) resizeHeight.value = Math.max(1, Math.round(v * Math.max(1, props.height) / Math.max(1, props.width))); }
  else { resizeHeight.value = v; if (lockAspect.value) resizeWidth.value = Math.max(1, Math.round(v * Math.max(1, props.width) / Math.max(1, props.height))); }
}
const operation = computed<ImageOperation>(() => {
  if (props.tab === 'crop') {
    if (cropTool.value === 'resize') return {kind:'resize',width:resizeWidth.value,height:resizeHeight.value};
    if (cropTool.value === 'rotate') return {kind:'rotate',angle:angle.value};
    return {kind:'crop', ...(props.cropSelection ?? {x:0,y:0,width:0,height:0})};
  }
  if (props.tab === 'annotate') return {kind:'watermark',text:text.value,color:watermarkColor.value,size:watermarkSize.value,opacity:watermarkOpacity.value};
  return {kind:'adjust',hue:(hue.value - 100) * 1.8,saturation:saturation.value,brightness:brightness.value,contrast:contrast.value,opacity:opacity.value,color:color.value,tolerance:tolerance.value,transparent:transparencyEnabled.value,feather:softenEdges.value};
});
watch(operation, op => emit('preview', props.tab === 'adjust' || props.tab === 'annotate' || props.tab === 'crop' && cropTool.value === 'rotate' ? op : null), { immediate: true });
</script>

<template>
  <div class="operation-panel">
    <div v-if="tab !== 'annotate'" class="operation-toolbar" role="toolbar">
      <button v-for="key in (tab === 'crop' ? ['crop','flip','rotate','resize'] : ['hue','saturation','brightness','contrast','opacity','transparent'])" :key="key" class="operation-chip editor-function" :class="{ active: (tab === 'crop' ? cropTool : adjustTool) === key }" :aria-pressed="(tab === 'crop' ? cropTool : adjustTool) === key" @click="tab === 'crop' ? cropTool = key : adjustTool = key"><NIcon :size="24" :component="operationIcons[key]" /><span>{{ t(`tools.imageEditor.operation${key}`) }}</span></button>
    </div>
    <div class="operation-row" :class="{ 'operation-row--crop': tab === 'crop' && cropTool === 'crop', 'operation-row--flip': tab === 'crop' && cropTool === 'flip', 'operation-row--rotate': tab === 'crop' && cropTool === 'rotate', 'operation-row--resize': tab === 'crop' && cropTool === 'resize' }">
      <template v-if="tab === 'crop' && cropTool === 'crop'">
        <div class="crop-ratio-picker">
          <CropRatioWheel v-model:value="ratio" :options="ratioOptions" :label="t('tools.imageEditor.ratio')" />
        </div>
        <div class="crop-actions">
          <span class="crop-dimensions">{{ Math.round(cropSelection?.width ?? 0) }} × {{ Math.round(cropSelection?.height ?? 0) }} px</span>
          <NButton type="primary" :disabled="disabled || busy || !cropSelection || cropSelection.width < 1 || cropSelection.height < 1" :loading="busy" @click="emit('apply', operation)">{{ t('common.confirm') }}</NButton>
        </div>
      </template>
      <template v-else-if="tab === 'crop' && cropTool === 'flip'">
        <NButton :disabled="disabled || busy" @click="emit('apply', {kind:'flip',axis:'horizontal'})"><template #icon><NIcon :size="22" :component="FlipVertical" /></template>{{ t('tools.imageEditor.horizontal') }}</NButton>
        <NButton :disabled="disabled || busy" @click="emit('apply', {kind:'flip',axis:'vertical'})"><template #icon><NIcon :size="22" :component="FlipHorizontal" /></template>{{ t('tools.imageEditor.vertical') }}</NButton>
      </template>
      <template v-else-if="tab === 'crop' && cropTool === 'rotate'">
        <div class="rotation-buttons">
          <NButton v-for="a in [90,180]" :key="a" :disabled="disabled || busy" @click="rotateBy(-a)"><template #icon><NIcon :size="22" :component="RotateClockwise" style="transform:scaleX(-1)" /></template>{{ a }}°</NButton>
        </div>
        <RotationRuler v-model:value="angle" :label="t('tools.imageEditor.operationrotate')" :disabled="disabled || busy" @commit="commitRotation" />
        <div class="rotation-buttons">
          <NButton v-for="a in [90,180]" :key="a" :disabled="disabled || busy" @click="rotateBy(a)"><template #icon><NIcon :size="22" :component="RotateClockwise" /></template>{{ a }}°</NButton>
        </div>
      </template>
      <template v-else-if="tab === 'crop' && cropTool === 'resize'">
        <label>{{ t('common.width') }} <SizeField :value="resizeWidth" :max="8192" @update:value="resize($event, 'width')" /></label>
        <label>{{ t('common.height') }} <SizeField :value="resizeHeight" :max="8192" @update:value="resize($event, 'height')" /></label>
        <label>{{ t('tools.imageEditor.lockAspect') }} <NSwitch v-model:value="lockAspect" /></label>
      </template>
      <div v-else-if="tab === 'adjust'" class="adjust-controls">
        <div class="adjust-controls__side adjust-controls__side--left">
          <template v-if="adjustTool === 'transparent'">
            <span class="adjust-controls__label">{{ t('tools.imageEditor.targetColor') }}</span>
            <CanvasColorPicker class="operation-color" v-model:value="color" :disabled="disabled || busy" style="width:42px" />
          </template>
        </div>
        <AdjustmentSlider v-model:value="adjustmentValue" :label="t(`tools.imageEditor.operation${adjustTool}`)" :disabled="disabled || busy" />
        <div class="adjust-controls__side adjust-controls__side--right">
          <template v-if="adjustTool === 'transparent'">
            <span class="adjust-controls__label">{{ t('tools.imageEditor.softenEdges') }}</span>
            <NSwitch v-model:value="softenEdges" :disabled="disabled || busy" :aria-label="t('tools.imageEditor.softenEdges')" />
          </template>
        </div>
      </div>
      <template v-else-if="tab === 'annotate'">
        <NInput v-model:value="text" :placeholder="t('tools.imageWatermark.watermarkPlaceholder')" :input-props="{ 'aria-label': t('tools.imageEditor.operationwatermark') }" style="width:180px" />
        <CanvasColorPicker class="operation-color" v-model:value="watermarkColor" style="width:42px" />
        <label>{{ t('tools.imageEditor.size') }} <SizeField v-model:value="watermarkSize" :max="512" /></label>
        <label>{{ t('tools.imageEditor.operationopacity') }} <SizeField v-model:value="watermarkOpacity" :min="0" :max="100" />%</label>
      </template>
      <NButton v-if="tab !== 'adjust' && !(tab === 'crop' && (cropTool === 'flip' || cropTool === 'crop' || cropTool === 'rotate'))" type="primary" :disabled="disabled || busy || (tab === 'annotate' && !text.trim()) || (tab === 'crop' && cropTool === 'crop' && (!cropSelection || cropSelection.width < 1 || cropSelection.height < 1))" :loading="busy" @click="emit('apply', operation)">{{ t(tab === 'crop' && cropTool === 'crop' ? 'common.confirm' : 'common.apply') }}</NButton>
    </div>
  </div>
</template>
<style scoped>
.operation-panel { display:flex; flex-direction:column; gap:12px; }
.operation-toolbar,.operation-row { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:8px; }
.operation-toolbar { justify-content:center; }
.operation-row--flip,.operation-row--resize { justify-content:center; }
.operation-row--resize :deep(.size-field) { height:42px; }
.operation-row--rotate { width:100%; flex-wrap:nowrap; gap:16px; justify-content:center; }
.rotation-buttons { display:flex; align-items:center; gap:8px; flex-shrink:0; }
@media (max-width:640px) { .operation-row--rotate { gap:8px; } .rotation-buttons { flex-direction:column; gap:6px; } }
.operation-row--crop { width:100%; flex-wrap:nowrap; gap:16px; }
.crop-ratio-picker { flex:1; min-width:0; }
.crop-actions { display:flex; align-items:center; gap:12px; margin-left:auto; flex-shrink:0; }
.crop-dimensions { display:inline-block; width:160px; flex:0 0 160px; text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums; font-size:var(--font-size-caption); color:var(--color-text-2); }
@media (max-width:640px) { .operation-row--flip,.operation-row--resize { justify-content:center; }
.operation-row--resize :deep(.size-field) { height:42px; }
.operation-row--rotate { width:100%; flex-wrap:nowrap; gap:16px; justify-content:center; }
.rotation-buttons { display:flex; align-items:center; gap:8px; flex-shrink:0; }
@media (max-width:640px) { .operation-row--rotate { gap:8px; } .rotation-buttons { flex-direction:column; gap:6px; } }
.operation-row--crop { gap:8px; } .crop-actions { gap:8px; } }
.operation-row :deep(.n-button), .operation-row :deep(.n-input), .operation-row :deep(.n-base-selection) { --n-height:42px !important; min-height:42px; }
.operation-row :deep(.n-switch) { --n-rail-height:24px; --n-rail-width:44px; --n-button-height:20px; --n-button-width:20px; }
.adjust-controls { display:flex; align-items:center; gap:16px; width:100%; }
.adjust-controls__side { display:flex; align-items:center; gap:8px; flex:0 0 140px; min-height:42px; }
.adjust-controls__side--right { justify-content:flex-end; }
.operation-row :deep(.adjustment-slider .n-input) { --n-height:24px !important; min-height:24px; height:24px; }
@media (max-width:640px) { .adjust-controls { gap:8px; } .adjust-controls__side { flex-basis:42px; } .adjust-controls__label { display:none; } }
.operation-row label { display:flex; align-items:center; gap:6px; }
.operation-chip { border:1px solid var(--color-hairline); color:var(--color-ink); background:transparent; border-radius:6px; padding:6px 12px; cursor:pointer; }
.operation-chip.active { color:var(--color-primary); border-color:var(--color-primary); background:var(--color-primary-soft); }
.operation-color { width:42px !important; height:42px; }
.operation-row :deep(.size-field) { height:42px; min-width:42px; }
.operation-row :deep(.n-input) { --n-height:42px !important; }
:deep(.operation-color .n-color-picker__value) { display:none; }
:deep(.operation-color .n-color-picker__fill) { position:absolute; inset:2px; width:calc(100% - 4px); height:calc(100% - 4px); border-radius:3px; }
@media (max-width:640px) {
  .operation-row--crop { flex-wrap:wrap; }
  .crop-ratio-picker { flex:0 0 100%; width:100%; }
  .crop-actions { margin-left:auto; }
}
</style>
