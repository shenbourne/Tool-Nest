<script setup lang="ts">
import CanvasColorPicker from './CanvasColorPicker.vue';
import { useI18n } from 'vue-i18n';
const props = withDefaults(defineProps<{value:string; swatches?:string[]; showSwatches?:boolean}>(), {
  showSwatches: true,
  swatches: () => ['#e03131','#1971c2','#2f9e44','#f08c00','#343a40'],
});
const emit = defineEmits<{ 'update:value':[value:string] }>();
const { t } = useI18n();
</script>
<template>
  <div class="annotation-color-control">
    <CanvasColorPicker class="param-color" :value="value" :swatches="props.swatches" @update:value="emit('update:value',$event)" />
    <button v-for="color in (props.showSwatches ? props.swatches : [])" :key="color" type="button" class="annotation-color-control__swatch" :style="{background:color}" :aria-label="`${t('tools.imageEditor.colour')} ${color}`" :aria-pressed="value.toLowerCase() === color.toLowerCase()" @click="emit('update:value',color)" />
  </div>
</template>
<style scoped>
.annotation-color-control { display:flex; align-items:center; flex:none; gap:8px; }
.annotation-color-control__swatch { box-sizing:border-box; width:22px; height:22px; padding:0; border:1px solid rgba(0,0,0,0.16); border-radius:7px; cursor:pointer; }
.annotation-color-control__swatch:focus-visible { outline:2px solid var(--color-primary); outline-offset:2px; }
.annotation-color-control__swatch[aria-pressed="true"] { box-shadow:0 0 0 2px var(--color-surface),0 0 0 3px var(--color-primary); }
:deep(.param-color) { width:42px !important; height:42px !important; }
:deep(.param-color .n-color-picker__value) { display:none; }
:deep(.param-color .n-color-picker__fill) { position:absolute; top:2px; left:2px; width:calc(100% - 4px); height:calc(100% - 4px); border-radius:7px; }
</style>
