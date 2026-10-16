<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
const props = defineProps<{ value: number; count: number; label: string }>();
const emit = defineEmits<{ 'update:value': [number] }>();
const list = ref<HTMLElement>();
const rowHeight = 36;
const dragging = ref(false);
let pointer: { id: number; y: number; scroll: number } | undefined;
let suppressClickUntil = 0;
let targetValue = props.value;
let timer: ReturnType<typeof setTimeout> | undefined;
function scrollToValue(value: number, smooth = true) {
  list.value?.scrollTo({ top: value * rowHeight, behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
}
function select(value: number) {
  const next = Math.max(0, Math.min(props.count - 1, value));
  targetValue = next;
  emit('update:value', next);
  scrollToValue(next);
}
function settle() {
  clearTimeout(timer);
  if (pointer) return;
  timer = setTimeout(() => { if (list.value) select(Math.round(list.value.scrollTop / rowHeight)); }, 160);
}
function wheel(event: WheelEvent) {
  if (event.deltaY) select(targetValue + Math.sign(event.deltaY));
}
function key(event: KeyboardEvent) {
  const values: Record<string, number> = { ArrowDown: props.value + 1, ArrowUp: props.value - 1, Home: 0, End: props.count - 1, PageDown: props.value + 5, PageUp: props.value - 5 };
  if (event.key in values) { event.preventDefault(); select(values[event.key]); }
}
function pointerDown(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || event.button !== 0 || !list.value) return;
  event.preventDefault();
  clearTimeout(timer);
  // Freeze the current visual position before recording the drag origin.
  const position = list.value.scrollTop;
  list.value.scrollTo({ top: position, behavior: 'instant' });
  pointer = { id: event.pointerId, y: event.clientY, scroll: list.value.scrollTop };
}
function pointerMove(event: PointerEvent) {
  if (!pointer || pointer.id !== event.pointerId || !list.value) return;
  const distance = event.clientY - pointer.y;
  if (!dragging.value && Math.abs(distance) < 4) return;
  if (!dragging.value) {
    dragging.value = true;
    list.value.setPointerCapture(event.pointerId);
    // Stop an in-flight smooth animation before directly following the pointer.
    list.value.scrollTo({ top: pointer.scroll, behavior: 'instant' });
  }
  event.preventDefault();
  list.value.scrollTop = pointer.scroll - distance;
}
function pointerEnd(event: PointerEvent) {
  if (!pointer || pointer.id !== event.pointerId) return;
  pointer = undefined;
  if (!dragging.value) return;
  dragging.value = false;
  suppressClickUntil = performance.now() + 300;
  if (list.value?.hasPointerCapture(event.pointerId)) list.value.releasePointerCapture(event.pointerId);
  if (list.value) select(Math.round(list.value.scrollTop / rowHeight));
}
function click(value: number) {
  if (performance.now() >= suppressClickUntil) select(value);
}
async function align() {
  await nextTick();
  if (list.value) list.value.scrollTop = props.value * rowHeight;
}
onMounted(align);
watch(() => props.value, value => {
  if (value === targetValue) return;
  targetValue = value;
  if (!dragging.value) scrollToValue(value);
});
onBeforeUnmount(() => clearTimeout(timer));
</script>
<template>
  <div class="time-wheel">
    <div ref="list" :class="['wheel-list', { dragging }]" role="listbox" tabindex="0" :aria-label="label" @keydown="key" @wheel.prevent="wheel" @scroll="settle" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerEnd" @pointercancel="pointerEnd" @lostpointercapture="pointerEnd">
      <button v-for="n in count" :key="n" type="button" role="option" tabindex="-1" :aria-selected="value === n - 1" :class="{ selected: value === n - 1 }" @click="click(n - 1)">{{ String(n - 1).padStart(2, '0') }}</button>
    </div>
  </div>
</template>
<style scoped>
.time-wheel { position: relative; width: 54px; }
.time-wheel::before { content: ''; position: absolute; top: 108px; height: 36px; left: 0; right: 0; border-block: 1px solid var(--color-hairline); background: var(--color-bg-2, transparent); pointer-events: none; }
.wheel-list { position: relative; height: 252px; overflow-y: auto; padding-block: 108px; box-sizing: border-box; scrollbar-width: none; user-select: none; cursor: grab; mask-image: linear-gradient(transparent, black 30%, black 70%, transparent); }
.wheel-list.dragging { cursor: grabbing; }
.wheel-list.dragging button { cursor: grabbing; }
.wheel-list::-webkit-scrollbar { display: none; }
.wheel-list:focus-visible { outline: 2px solid var(--color-primary); border-radius: 4px; }
button { display: block; height: 36px; width: 100%; padding: 0; border: 0; background: transparent; color: var(--color-text-3); font: inherit; font-variant-numeric: tabular-nums; cursor: pointer; }
button.selected { color: var(--color-primary); font-size: 17px; font-weight: 600; }
</style>
