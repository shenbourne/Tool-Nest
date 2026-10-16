<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
const props = defineProps<{ value: number; options: {value: number; label: string}[]; label: string }>();
const emit = defineEmits<{ 'update:value': [value: number] }>();
const list = ref<HTMLElement>();
const itemWidth = 80;
const dragging = ref(false);
const selectedIndex = computed(() => Math.max(0, props.options.findIndex(option => option.value === props.value)));
let targetIndex = selectedIndex.value;
let pointer: {id: number; x: number; scroll: number} | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let suppressClickUntil = 0;
function scrollToIndex(index: number, smooth = true) {
  list.value?.scrollTo({left: index * itemWidth, behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto'});
}
function select(index: number) {
  const next = Math.max(0, Math.min(props.options.length - 1, index));
  targetIndex = next;
  emit('update:value', props.options[next].value);
  scrollToIndex(next);
}
function settle() {
  clearTimeout(timer);
  if (pointer) return;
  timer = setTimeout(() => {
    if (list.value) select(Math.round(list.value.scrollLeft / itemWidth));
  }, 160);
}
function wheel(event: WheelEvent) {
  const delta = event.deltaX || event.deltaY;
  if (delta) select(targetIndex + Math.sign(delta));
}
function key(event: KeyboardEvent) {
  const indices: Record<string, number> = {ArrowLeft: selectedIndex.value - 1, ArrowRight: selectedIndex.value + 1, Home: 0, End: props.options.length - 1};
  if (event.key in indices) { event.preventDefault(); select(indices[event.key]); }
}
function pointerDown(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || event.button !== 0 || !list.value) return;
  event.preventDefault();
  clearTimeout(timer);
  const position = list.value.scrollLeft;
  list.value.scrollTo({left:position,behavior:'instant'});
  pointer = {id:event.pointerId,x:event.clientX,scroll:position};
}
function pointerMove(event: PointerEvent) {
  if (!pointer || pointer.id !== event.pointerId || !list.value) return;
  const distance = event.clientX - pointer.x;
  if (!dragging.value && Math.abs(distance) < 4) return;
  if (!dragging.value) {
    dragging.value = true;
    list.value.setPointerCapture(event.pointerId);
  }
  event.preventDefault();
  list.value.scrollLeft = pointer.scroll - distance;
}
function pointerEnd(event: PointerEvent) {
  if (!pointer || pointer.id !== event.pointerId) return;
  pointer = undefined;
  if (!dragging.value) return;
  dragging.value = false;
  suppressClickUntil = performance.now() + 300;
  if (list.value?.hasPointerCapture(event.pointerId)) list.value.releasePointerCapture(event.pointerId);
  if (list.value) select(Math.round(list.value.scrollLeft / itemWidth));
}
function click(index: number) {
  if (performance.now() >= suppressClickUntil) select(index);
}
onMounted(async () => { await nextTick(); scrollToIndex(selectedIndex.value, false); });
watch(selectedIndex, index => {
  if (index === targetIndex) return;
  targetIndex = index;
  if (!dragging.value) scrollToIndex(index);
});
onBeforeUnmount(() => clearTimeout(timer));
</script>
<template>
  <div class="ratio-wheel">
    <div ref="list" class="ratio-wheel__list" :class="{dragging}" role="listbox" :aria-label="label" aria-orientation="horizontal" tabindex="0" @keydown="key" @wheel.prevent="wheel" @scroll="settle" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerEnd" @pointercancel="pointerEnd" @lostpointercapture="pointerEnd">
      <button v-for="(option,index) in options" :key="option.value" type="button" role="option" tabindex="-1" :aria-selected="value === option.value" :class="{selected:value === option.value}" @click="click(index)">{{ option.label }}</button>
    </div>
  </div>
</template>
<style scoped>
.ratio-wheel { position:relative; width:100%; min-width:0; }
.ratio-wheel::after { content:''; position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(to right,transparent,var(--color-hairline-strong) 25%,var(--color-hairline-strong) 75%,transparent),linear-gradient(to right,transparent,var(--color-hairline-strong) 25%,var(--color-hairline-strong) 75%,transparent); background-size:100% 1px; background-position:top,bottom; background-repeat:no-repeat; }
.ratio-wheel::before { content:''; position:absolute; top:4px; bottom:4px; left:50%; width:80px; transform:translateX(-50%); border-inline:1px solid var(--color-hairline); background:var(--color-primary-soft); border-radius:var(--radius-sm); pointer-events:none; }
.ratio-wheel__list { position:relative; display:flex; height:42px; overflow-x:auto; overflow-y:hidden; padding-inline:max(0px, calc((100% - 80px)/2)); box-sizing:border-box; scrollbar-width:none; user-select:none; cursor:grab; touch-action:pan-x; mask-image:linear-gradient(to right,transparent,black 18%,black 82%,transparent); }
.ratio-wheel__list.dragging,.ratio-wheel__list.dragging button { cursor:grabbing; }
.ratio-wheel__list::-webkit-scrollbar { display:none; }
.ratio-wheel__list:focus-visible { outline:2px solid var(--color-primary); border-radius:var(--radius-sm); }
button { flex:0 0 80px; border:0; padding:0 4px; background:transparent; color:var(--color-text-3); font:inherit; font-size:var(--font-size-caption); white-space:nowrap; cursor:pointer; }
button.selected { color:var(--color-primary); font-weight:600; }
</style>
