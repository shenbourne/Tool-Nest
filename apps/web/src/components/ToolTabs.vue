<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue';

const props = defineProps<{
  tabs: { name: string; label: string; shortLabel?: string }[];
  value?: string;
  ariaLabel?: string;
}>();
const emit = defineEmits<{ 'update:value': [value: string] }>();
const id = useId();
const localValue = ref(props.tabs[0]?.name ?? '');
const visited = ref(new Set([props.value ?? localValue.value]));
const active = computed({
  get: () => props.value ?? localValue.value,
  set: value => { localValue.value = value; emit('update:value', value); },
});
watch(active, value => { visited.value.add(value); }, { immediate: true });
const buttons = ref<HTMLButtonElement[]>([]);

async function navigate(event: KeyboardEvent) {
  const index = props.tabs.findIndex(tab => tab.name === active.value);
  const count = props.tabs.length;
  if (!count) return;
  const targets: Record<string, number> = {
    ArrowRight: (index + 1) % count, ArrowLeft: (index + count - 1) % count,
    Home: 0, End: count - 1,
  };
  if (!(event.key in targets)) return;
  event.preventDefault();
  const target = targets[event.key];
  active.value = props.tabs[target].name;
  await nextTick();
  buttons.value[target]?.focus();
}
</script>

<template>
  <div class="tool-tabs">
    <div class="tool-tabs__nav" role="tablist" :aria-label="ariaLabel" :style="{ '--tab-count': tabs.length }" @keydown="navigate">
      <button v-for="tab in tabs" :key="tab.name" :id="`${id}-tab-${tab.name}`" ref="buttons" type="button" role="tab" :aria-label="tab.label" :aria-selected="active === tab.name" :aria-controls="$slots.default ? `${id}-panel` : `${id}-panel-${tab.name}`" :tabindex="active === tab.name ? 0 : -1" @click="active = tab.name">
        <span :class="{ 'tool-tabs__label--has-short': tab.shortLabel }">{{ tab.label }}</span>
        <span v-if="tab.shortLabel" class="tool-tabs__short-label" aria-hidden="true">{{ tab.shortLabel }}</span>
      </button>
    </div>
    <section v-if="$slots.default" :id="`${id}-panel`" class="tool-tabs__panel" role="tabpanel" :aria-labelledby="`${id}-tab-${active}`">
      <slot />
    </section>
    <template v-else>
      <Transition v-for="tab in tabs" :key="tab.name" name="tool-tab">
        <section v-show="active === tab.name" :id="`${id}-panel-${tab.name}`" class="tool-tabs__panel" role="tabpanel" :aria-labelledby="`${id}-tab-${tab.name}`">
          <slot v-if="visited.has(tab.name)" :name="tab.name" />
        </section>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
/* Segment-style nav, matching the naive-ui NTabs type="segment" look used
   by the merged Base64 tool: a full-width gray track with a white rounded
   active segment. */
.tool-tabs__nav {
  display: grid;
  grid-template-columns: repeat(var(--tab-count), minmax(0, 1fr));
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-lg);
  background: rgba(0, 0, 0, 0.05);
}
.tool-tabs__nav button {
  position: relative;
  min-width: 0;
  min-height: 34px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-ink);
  font: inherit;
  font-size: 14px;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition: background-color var(--motion-fast) var(--motion-ease);
}
.tool-tabs__nav button[aria-selected="true"] {
  background: var(--color-canvas);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
.tool-tabs__nav button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}
.tool-tabs__panel { padding-top: var(--spacing-sm); }
.tool-tabs__short-label { display: none; }
.tool-tab-enter-active, .tool-tab-leave-active { transition: opacity var(--motion-fast) var(--motion-ease); }
.tool-tab-enter-from, .tool-tab-leave-to { opacity: 0; }
@media (max-width: 640px) {
  .tool-tabs__nav button { padding-left: var(--spacing-xxs); padding-right: var(--spacing-xxs); font-size: 12px; }
  .tool-tabs__label--has-short { display: none; }
  .tool-tabs__short-label { display: inline; }
}
@media (prefers-reduced-motion: reduce) {
  .tool-tab-enter-active, .tool-tab-leave-active { transition: none; }
}
</style>
