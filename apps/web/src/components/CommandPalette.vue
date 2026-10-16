<script setup lang="ts">
import { NModal, NInput, NCard, NScrollbar, NEmpty } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSearchStore } from '@/stores/search.store';
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';

const show = ref(false);
const query = ref('');
const activeIndex = ref(0);
const { t } = useI18n();
const router = useRouter();
const searchStore = useSearchStore();

const results = computed(() => {
  return searchStore.results.slice(0, 20);
});

watch(query, (value) => searchStore.setQuery(value));

function open() {
  show.value = true;
  query.value = '';
  activeIndex.value = 0;
}

function close() {
  show.value = false;
  query.value = '';
}

function selectTool(path: string) {
  close();
  router.push(path);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (e.key === 'Enter' && results.value.length > 0) {
    e.preventDefault();
    selectTool(results.value[activeIndex.value].path);
  } else if (e.key === 'Escape') {
    close();
  }
}

// Global Ctrl+K shortcut
function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (show.value) close();
    else open();
  }
}

onMounted(() => document.addEventListener('keydown', handleGlobalKeydown));
onUnmounted(() => document.removeEventListener('keydown', handleGlobalKeydown));

defineExpose({ open });
</script>

<template>
  <NModal
    v-model:show="show"
    :mask-closable="true"
    :auto-focus="false"
    style="width: 560px; max-width: 90vw;"
    @after-enter="($event as any)?.querySelector('input')?.focus()"
  >
    <NCard content-style="padding: 0;">
      <div style="padding: 12px 16px; border-bottom: 1px solid var(--color-hairline);">
        <NInput
          v-model:value="query"
          :placeholder="t('commandPalette.placeholder')"
          clearable
          @keydown="handleKeydown"
        >
          <template #prefix>🔍</template>
        </NInput>
      </div>
      <NScrollbar style="max-height: 400px;">
        <div v-if="results.length === 0" style="padding: 24px;">
          <NEmpty :description="t('commandPalette.noResults')" />
        </div>
        <div
          v-for="(tool, idx) in results"
          :key="tool.path"
          :style="{
            padding: '10px 16px', cursor: 'pointer',
            backgroundColor: idx === activeIndex ? 'var(--color-primary-soft)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }"
          @click="selectTool(tool.path)"
          @mouseenter="activeIndex = idx"
        >
          <div>
            <div style="font-weight: 500;">{{ t(tool.name) }}</div>
            <div style="font-size: 12px; opacity: 0.6;">{{ t(tool.description) }}</div>
          </div>
          <span style="font-size: 11px; opacity: 0.4;">{{ tool.path }}</span>
        </div>
      </NScrollbar>
      <div style="padding: 8px 16px; border-top: 1px solid var(--color-hairline); font-size: 11px; opacity: 0.5;">
        {{ t('commandPalette.hint') }}
      </div>
    </NCard>
  </NModal>
</template>
