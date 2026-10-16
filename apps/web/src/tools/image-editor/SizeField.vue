<script setup lang="ts">
import { ref, watch, onUnmounted, type Component } from 'vue';
import { NIcon, NPopover, NSlider, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// A square numeric field for the image-editor params toolbar. The box shows the
// current value; hovering/focusing it pops up a slider that adjusts by drag or
// scroll wheel. Square (not a wide input) so the toolbar stays compact. An
// optional leading icon hints what the number controls (width, radius, size…).
const props = withDefaults(defineProps<{
  value: number;
  min?: number;
  max?: number;
  step?: number;
  labelKey?: string;
  icon?: Component | null;
}>(), {
  min: 1,
  max: 50,
  step: 1,
  labelKey: '',
  icon: null,
});

const emit = defineEmits<{ 'update:value': [value: number] }>();

const show = ref(false);
const popoverFocused = ref(false);
const triggerFocused = ref(false);
const triggerButton = ref<HTMLButtonElement>();
const sliderValue = ref(props.value);
watch(() => props.value, value => { sliderValue.value = value; });
let closeTimer: ReturnType<typeof setTimeout> | null = null;

function cancelClose() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}

function open() {
  cancelClose();
  sliderValue.value = props.value;
  show.value = true;
}

// Delayed close so the pointer can travel from the box into the popover
// without the popover vanishing underneath it.
function scheduleClose() {
  cancelClose();
  if (popoverFocused.value || triggerFocused.value) return;
  closeTimer = setTimeout(() => {
    show.value = false;
  }, 150);
}
function closeWithEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  event.stopPropagation();
  cancelClose();
  triggerButton.value?.focus();
  show.value = false;
}

function commit(v: number | null) {
  if (v == null) return;
  const clamped = Math.min(props.max, Math.max(props.min, v));
  emit('update:value', clamped);
}

function onSliderUpdate(v: number) {
  sliderValue.value = v;
  commit(v);
}

// Wheel over the box (not just the open slider) nudges the value so a quick
// scroll adjusts without waiting for the popover.
function onWheel(event: WheelEvent) {
  event.preventDefault();
  const delta = event.deltaY < 0 ? props.step : -props.step;
  commit(props.value + delta);
}
onUnmounted(cancelClose);
</script>

<template>
  <NPopover
    :show="show"
    trigger="manual"
    placement="bottom"
    :show-arrow="false"
    raw
    @clickoutside="show = false"
  >
    <template #trigger>
      <span class="size-field__group">
        <NIcon v-if="icon" :size="22" :component="icon" class="size-field__icon" />
        <button
          ref="triggerButton"
          type="button"
          class="size-field"
          :style="{ fontSize: `${Math.min(14, 36 / Math.max(1, String(value).length) / 0.65)}px` }"
          :aria-label="labelKey ? t(labelKey) : undefined"
          @mouseenter="open"
          @focus="triggerFocused = true; open()"
          @blur="triggerFocused = false; scheduleClose()"
          @keydown="closeWithEscape"
          @click="open"
          @mouseleave="scheduleClose"
          @wheel="onWheel"
        >
          <span class="size-field__value">{{ value }}</span>
        </button>
      </span>
    </template>
    <div
      class="size-field__popover"
      @keydown="closeWithEscape"
      @focusin="popoverFocused = true; cancelClose()"
      @focusout="popoverFocused = false; scheduleClose()"
      @mouseenter="cancelClose"
      @mouseleave="scheduleClose"
    >
      <span v-if="labelKey" class="size-field__label">{{ t(labelKey) }}</span>
      <NInputNumber :value="value" :min="min" :max="max" :step="step" :show-button="false" style="width:80px" @update:value="commit" />
      <NSlider
        :value="sliderValue"
        :min="min"
        :max="max"
        :step="step"
        :style="{ width: '140px' }"
        @update:value="onSliderUpdate"
      />
    </div>
  </NPopover>
</template>

<style scoped>
.size-field__group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-inline: 6px;
}

.size-field__icon {
  color: var(--color-text-3);
  flex: none;
}

.size-field {
  box-sizing: border-box;
  width: 42px;
  padding: 0;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-ink);
  font-size: var(--font-size-caption);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.size-field:hover {
  border-color: var(--color-primary);
}

.size-field__value {
  line-height: 1;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.size-field__popover {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-pop);
}

.size-field__label {
  font-size: var(--font-size-caption);
  color: var(--color-text-2);
  white-space: nowrap;
}
</style>
