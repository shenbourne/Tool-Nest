<script setup lang="ts">
import { inject, ref } from 'vue';
import { NButton, NColorPicker, NIcon } from 'naive-ui';
import { ColorPicker } from '@vicons/tabler';
import { useI18n } from 'vue-i18n';
import { imageColorPickingKey } from './image-color-picking';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{value?:string | null; swatches?:string[]}>(), {
  swatches: () => ['#e03131','#1971c2','#2f9e44','#f08c00','#343a40'],
});
const emit = defineEmits<{ 'update:value':[value:string] }>();
const { t } = useI18n();
const picking = inject(imageColorPickingKey);
const show = ref(false);
function update(value:string | null) { if (value !== null) emit('update:value',value); }
function pick() {
  show.value = false;
  picking?.request(color => emit('update:value',color));
}
</script>
<template>
  <NColorPicker v-bind="$attrs" v-model:show="show" :value="props.value" :modes="['hex']" :show-alpha="true" :show-preview="false" :swatches="props.swatches" @update:value="update">
    <template #action>
      <NButton class="image-editor-eyedropper" quaternary :disabled="!picking?.available.value" :aria-label="t('tools.imageEditor.pickFromImage')" :title="t('tools.imageEditor.pickFromImage')" style="width:32px;height:32px;padding:0" @click="pick"><template #icon><NIcon :size="20" :component="ColorPicker" /></template></NButton>
    </template>
  </NColorPicker>
</template>

<style>
.n-color-picker-panel:has(.image-editor-eyedropper) { display:grid; grid-template-columns:minmax(0,1fr) 32px; column-gap:8px; row-gap:12px; padding:12px; }
.n-color-picker-panel:has(.image-editor-eyedropper) > .n-color-picker-control { display:contents; }
.n-color-picker-panel:has(.image-editor-eyedropper) > .n-color-picker-control > * { grid-column:1 / -1; margin-top:0; }
.n-color-picker-panel:has(.image-editor-eyedropper) > .n-color-picker-action { grid-column:2; grid-row:4; margin:0; padding:0; border:0; align-self:center; }
.n-color-picker-panel:has(.image-editor-eyedropper) > .n-color-picker-control > .n-color-picker-swatches { grid-column:1; grid-row:4; align-self:center; }
.n-color-picker-panel:has(.image-editor-eyedropper) .image-editor-eyedropper { margin-left:0; }
</style>
