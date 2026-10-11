<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
const props = defineProps<{ value: number; count: number; label: string }>();
const emit = defineEmits<{ 'update:value': [number] }>();
const list = ref<HTMLElement>();
const rowHeight = 36;
let timer: ReturnType<typeof setTimeout> | undefined;
function select(value: number) {
  const next = Math.max(0, Math.min(props.count - 1, value));
  emit('update:value', next);
  if (list.value) list.value.scrollTop = next * rowHeight;
}
function settle() {
  clearTimeout(timer);
  timer = setTimeout(() => { if (list.value) select(Math.round(list.value.scrollTop / rowHeight)); }, 100);
}
function wheel(event: WheelEvent) {
  if (event.deltaY) select(props.value + Math.sign(event.deltaY));
}
function key(event: KeyboardEvent) {
  const values: Record<string, number> = { ArrowDown: props.value + 1, ArrowUp: props.value - 1, Home: 0, End: props.count - 1, PageDown: props.value + 5, PageUp: props.value - 5 };
  if (event.key in values) { event.preventDefault(); select(values[event.key]); }
}
async function align() {
  await nextTick();
  if (list.value) list.value.scrollTop = props.value * rowHeight;
}
onMounted(align);
watch(() => props.value, align);
onBeforeUnmount(() => clearTimeout(timer));
</script>
<template>
  <div class="time-wheel">
    <div ref="list" class="wheel-list" role="listbox" tabindex="0" :aria-label="label" @keydown="key" @wheel.prevent="wheel" @scroll="settle">
      <button v-for="n in count" :key="n" type="button" role="option" tabindex="-1" :aria-selected="value === n - 1" :class="{ selected: value === n - 1 }" @click="select(n - 1)">{{ String(n - 1).padStart(2, '0') }}</button>
    </div>
  </div>
</template>
<style scoped>
.time-wheel { position: relative; width: 54px; }
.time-wheel::before { content: ''; position: absolute; top: 108px; height: 36px; left: 0; right: 0; border-block: 1px solid var(--color-hairline); background: var(--color-bg-2, transparent); pointer-events: none; }
.wheel-list { position: relative; height: 252px; overflow-y: auto; padding-block: 108px; box-sizing: border-box; scrollbar-width: none; scroll-snap-type: y mandatory; mask-image: linear-gradient(transparent, black 30%, black 70%, transparent); }
.wheel-list::-webkit-scrollbar { display: none; }
.wheel-list:focus-visible { outline: 2px solid var(--color-primary); border-radius: 4px; }
button { display: block; height: 36px; width: 100%; padding: 0; border: 0; background: transparent; color: var(--color-text-3); font: inherit; font-variant-numeric: tabular-nums; cursor: pointer; scroll-snap-align: center; }
button.selected { color: var(--color-primary); font-size: 17px; font-weight: 600; }
</style>
