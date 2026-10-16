<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
const props = defineProps<{value: number; label: string; disabled: boolean}>();
const emit = defineEmits<{ 'update:value': [value: number]; commit: [value: number] }>();
const list = ref<HTMLElement>();
const dragging = ref(false);
const minimum = -360; const maximum = 360; const tickWidth = 12;
let pointer: {id: number; x: number; scroll: number; mouse: boolean} | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let dirty = false;
let alignedScroll: number | undefined;
function currentAngle() {
  return Math.round(Math.max(minimum, Math.min(maximum, (list.value?.scrollLeft ?? -minimum * tickWidth) / tickWidth + minimum)) * 10) / 10;
}
function update() {
  const angle = currentAngle();
  if (Math.abs(angle - props.value) > 0.01) { dirty = true; emit('update:value', angle); }
}
function finish() {
  clearTimeout(timer);
  update();
  if (dirty) { dirty = false; emit('commit', currentAngle()); }
}
function scroll() {
  // Prop synchronization (including reset after a commit) is not a gesture.
  if (alignedScroll !== undefined) {
    const synchronized = Math.abs((list.value?.scrollLeft ?? 0) - alignedScroll) < 0.01;
    alignedScroll = undefined;
    if (synchronized) return;
  }
  if (props.disabled) return;
  update();
  clearTimeout(timer);
  if (!pointer) timer = setTimeout(finish, 180);
}
function wheel(event: WheelEvent) {
  if (!props.disabled && list.value) list.value.scrollLeft += event.deltaX || event.deltaY;
}
function key(event: KeyboardEvent) {
  if (props.disabled || !list.value) return;
  const step = event.shiftKey ? 1 : 0.1;
  const angles: Record<string, number> = {ArrowLeft: props.value - step, ArrowRight: props.value + step, Home: minimum, End: maximum};
  if (event.key in angles) {
    event.preventDefault();
    list.value.scrollLeft = (Math.max(minimum, Math.min(maximum, angles[event.key])) - minimum) * tickWidth;
    scroll();
  }
}
function pointerDown(event: PointerEvent) {
  if (props.disabled || !list.value || event.button !== 0) return;
  clearTimeout(timer);
  pointer = {id:event.pointerId,x:event.clientX,scroll:list.value.scrollLeft,mouse:event.pointerType === 'mouse'};
  if (pointer.mouse) { event.preventDefault(); list.value.setPointerCapture(event.pointerId); dragging.value = true; }
}
function pointerMove(event: PointerEvent) {
  if (!pointer?.mouse || pointer.id !== event.pointerId || !list.value || props.disabled) return;
  event.preventDefault();
  list.value.scrollLeft = pointer.scroll - (event.clientX - pointer.x);
  update();
}
function pointerEnd(event: PointerEvent) {
  if (!pointer || pointer.id !== event.pointerId) return;
  const mouse = pointer.mouse;
  pointer = undefined; dragging.value = false;
  if (list.value?.hasPointerCapture(event.pointerId)) list.value.releasePointerCapture(event.pointerId);
  if (mouse) finish();
  else timer = setTimeout(finish, 180);
}
async function align() {
  await nextTick();
  alignValue(props.value);
}
function alignValue(value: number) {
  dirty = false;
  clearTimeout(timer);
  if (list.value) {
    list.value.scrollLeft = (value - minimum) * tickWidth;
    alignedScroll = list.value.scrollLeft;
  }
}
onMounted(align);
watch(() => props.value, value => {
  if (Math.abs(value - currentAngle()) < 0.01) return;
  alignValue(value);
});
onBeforeUnmount(() => { clearTimeout(timer); if (dirty && !props.disabled) emit('commit', currentAngle()); });
</script>
<template>
  <div class="rotation-ruler" :class="{disabled}">
    <output class="rotation-ruler__value">{{ value.toFixed(1) }}°</output>
    <div ref="list" class="rotation-ruler__track" :class="{dragging}" role="slider" aria-orientation="horizontal" :aria-label="label" :aria-valuemin="minimum" :aria-valuemax="maximum" :aria-valuenow="value" :aria-disabled="disabled" :tabindex="disabled ? -1 : 0" @scroll="scroll" @wheel.prevent="wheel" @keydown="key" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerEnd" @pointercancel="pointerEnd" @lostpointercapture="pointerEnd">
      <span v-for="n in maximum - minimum + 1" :key="n" class="rotation-ruler__tick" :class="{major:(n - 1 + minimum) % 5 === 0}" />
    </div>
    <span class="rotation-ruler__indicator" />
  </div>
</template>
<style scoped>
.rotation-ruler { position:relative; flex:1; min-width:0; height:70px; }
.rotation-ruler__value { display:block; text-align:center; font-size:14px; font-variant-numeric:tabular-nums; color:var(--color-ink); line-height:28px; }
.rotation-ruler__track { display:flex; align-items:center; height:42px; overflow-x:auto; overflow-y:hidden; padding-inline:max(0px,calc((100% - 12px)/2)); scrollbar-width:none; box-sizing:border-box; user-select:none; touch-action:pan-x; cursor:grab; mask-image:linear-gradient(to right,transparent,black 15%,black 85%,transparent); }
.rotation-ruler__track.dragging { cursor:grabbing; }
.rotation-ruler__track::-webkit-scrollbar { display:none; }
.rotation-ruler__track:focus-visible { outline:2px solid var(--color-primary); border-radius:var(--radius-sm); }
.rotation-ruler__tick { display:flex; align-items:center; justify-content:center; flex:0 0 12px; height:20px; }
.rotation-ruler__tick::after { content:''; width:3px; height:3px; border-radius:2px; background:var(--color-text-3); }
.rotation-ruler__tick.major::after { height:16px; background:var(--color-text-2); }
.rotation-ruler__indicator { position:absolute; width:6px; height:28px; border-radius:3px; left:50%; top:31px; transform:translateX(-50%); background:var(--color-ink); pointer-events:none; }
.rotation-ruler.disabled { opacity:0.5; }
</style>
