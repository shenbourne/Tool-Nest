<script setup lang="ts">
import { NInputNumber, NSlider } from 'naive-ui';
defineProps<{value:number; label:string; disabled:boolean}>();
const emit = defineEmits<{ 'update:value':[value:number] }>();
function slide(value:number) {
  emit('update:value', Math.abs(value - 100) <= 3 ? 100 : value);
}
function input(value:number | null) {
  if (value !== null) emit('update:value', Math.min(200, Math.max(0,value)));
}
</script>
<template>
  <div class="adjustment-slider">
    <NInputNumber class="adjustment-slider__input" :value="value" :min="0" :max="200" :step="1" :show-button="false" :disabled="disabled" :input-props="{'aria-label':label}" @update:value="input" />
    <div class="adjustment-slider__track">
      <span class="adjustment-slider__neutral" />
      <NSlider :value="value" :min="0" :max="200" :step="1" :disabled="disabled" :tooltip="false" :theme-overrides="{ railColor: '#b8b8b8', fillColor: '#b8b8b8', railColorHover: '#b8b8b8', fillColorHover: '#b8b8b8', handleColor: '#ffffff', handleSize: '14px' }" :aria-label="label" @update:value="slide" />
    </div>
  </div>
</template>
<style scoped>
.adjustment-slider { position:relative; flex:1; min-width:0; display:flex; flex-direction:column; align-items:center; gap:3px; }
.adjustment-slider__input { width:72px; --n-height:24px !important; }
.adjustment-slider__input :deep(input) { text-align:center; }
.adjustment-slider__track { position:relative; display:flex; align-items:center; width:100%; height:24px; }
.adjustment-slider__neutral { position:absolute; left:50%; top:50%; width:12px; height:12px; box-sizing:border-box; transform:translate(-50%,-50%); border:2px solid #b8b8b8; background:#b8b8b8; border-radius:50%; pointer-events:none; z-index:1; }
.adjustment-slider__track :deep(.n-slider) { z-index:2; }
.adjustment-slider :deep(.n-slider-handle) { box-sizing:border-box; width:14px; height:14px; border:2px solid var(--color-primary); border-radius:50%; background:#ffffff !important; box-shadow:0 1px 4px rgba(0,0,0,0.22); z-index:2; }
.adjustment-slider :deep(.n-slider-rail), .adjustment-slider :deep(.n-slider-rail__fill) { background:#b8b8b8 !important; }
</style>
