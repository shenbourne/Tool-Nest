<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { NCard, NInput, NInputGroup, NInputGroupLabel } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import KeyboardVisual from './KeyboardVisual.vue';
import {
  formatClock,
  formatComboLabel,
  formatModifierList,
  pushHistory,
  type HistoryEntry,
} from './keyboard-history';

// A pressed key stays lit for this long after the last keydown, then dims.
const HIGHLIGHT_MS = 500;

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const event = ref<KeyboardEvent | null>(null);
const highlightCode = ref<string | null>(null);
const history = ref<HistoryEntry[]>([]);
let highlightTimer: ReturnType<typeof setTimeout> | undefined;

function handleKeyDown(e: KeyboardEvent) {
  // Never block default browser shortcuts (F5, Ctrl+R, F12, Tab navigation);
  // this tool only observes keys, it has no input to protect.
  event.value = e;
  highlightCode.value = e.code;
  clearTimeout(highlightTimer);
  highlightTimer = setTimeout(() => {
    highlightCode.value = null;
  }, HIGHLIGHT_MS);
  history.value = pushHistory(history.value, {
    label: formatComboLabel(e),
    time: formatClock(new Date()),
  });
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  clearTimeout(highlightTimer);
});

const fields = computed(() => {
  if (!event.value) return [];
  return [
    { label: t('tools.keycodeInfo.key'), value: event.value.key },
    { label: t('tools.keycodeInfo.keyCode'), value: String(event.value.keyCode) },
    { label: t('tools.keycodeInfo.code'), value: event.value.code },
    { label: t('tools.keycodeInfo.location'), value: String(event.value.location) },
    {
      label: t('tools.keycodeInfo.modifiers'),
      value: formatModifierList(event.value) || t('common.none'),
    },
  ];
});

const comboLabel = computed(() => (event.value ? formatComboLabel(event.value) : ''));

function copyText(text: string) {
  if (text) copyToClipboard(text);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <div class="keycode">
      <KeyboardVisual :active-code="highlightCode" />

      <div class="keycode__columns">
        <NCard :title="t('tools.keycodeInfo.currentKey')" class="keycode__col">
          <div class="keycode__keyname">{{ comboLabel || '?' }}</div>
          <div class="keycode__hint">{{ t('tools.keycodeInfo.pressKeyHint') }}</div>
        </NCard>

        <NCard :title="t('tools.keycodeInfo.fields')" class="keycode__col">
          <template v-if="fields.length > 0">
            <NInputGroup
              v-for="field in fields"
              :key="field.label"
              class="keycode__field"
            >
              <NInputGroupLabel style="flex: 0 0 120px;">
                {{ field.label }}
              </NInputGroupLabel>
              <NInput
                :value="field.value"
                readonly
                style="cursor: pointer;"
                @click="copyText(field.value)"
              />
            </NInputGroup>
          </template>
          <div v-else class="keycode__empty">—</div>
        </NCard>

        <NCard :title="t('tools.keycodeInfo.history')" class="keycode__col">
          <ul v-if="history.length > 0" class="keycode__history">
            <li v-for="(item, i) in history" :key="`${item.time}-${i}`" class="keycode__history-row">
              <span class="keycode__history-key">{{ item.label }}</span>
              <time class="keycode__history-time">{{ item.time }}</time>
            </li>
          </ul>
          <div v-else class="keycode__empty">{{ t('tools.keycodeInfo.noHistory') }}</div>
        </NCard>
      </div>
    </div>
  </ToolLayout>
</template>

<style scoped>
.keycode {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.keycode__columns {
  /* Height is fixed so the three columns stay equal and the history scrolls
     inside its own column instead of stretching the row. */
  --keycode-col-h: 320px;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 260px;
  grid-auto-rows: var(--keycode-col-h);
  gap: 16px;
}

.keycode__col {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.keycode__col :deep(.n-card-content) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.keycode__keyname {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 600;
  text-align: center;
  word-break: break-all;
}

.keycode__hint {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-2);
}

.keycode__field + .keycode__field {
  margin-top: 5px;
}

.keycode__history {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}

.keycode__history-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-hairline);
  font-size: 13px;
}

.keycode__history-row:last-child {
  border-bottom: none;
}

.keycode__history-key {
  font-weight: 600;
  word-break: break-all;
}

.keycode__history-time {
  flex: 0 0 auto;
  color: var(--color-text-3);
  font-variant-numeric: tabular-nums;
}

.keycode__empty {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
  font-size: 13px;
}

@media (max-width: 900px) {
  .keycode__columns {
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: auto;
  }

  .keycode__history {
    max-height: 240px;
  }
}
</style>
