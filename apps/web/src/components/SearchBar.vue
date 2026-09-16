<script setup lang="ts">
import { NInput, NCard, NTag, NScrollbar } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSearchStore } from '@/stores/search.store';
import { ref, watch, computed } from 'vue';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps<{ size?: 'medium' | 'large' }>();
const { t } = useI18n();
const router = useRouter();
const searchStore = useSearchStore();

const showDropdown = ref(false);
const activeIndex = ref(-1);
const inputRef = ref();

const suggestions = computed(() => searchStore.results.slice(0, 8));

const debouncedSearch = useDebounceFn((val: string) => {
  searchStore.setQuery(val);
  showDropdown.value = val.trim().length > 0;
  activeIndex.value = -1;
}, 200);

function handleInput(val: string) {
  debouncedSearch(val);
}

function selectTool(path: string) {
  showDropdown.value = false;
  searchStore.setQuery('');
  router.push(path);
}

function handleKeydown(e: KeyboardEvent) {
  if (!showDropdown.value) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex.value = Math.min(activeIndex.value + 1, suggestions.value.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (e.key === 'Enter' && activeIndex.value >= 0) {
    e.preventDefault();
    selectTool(suggestions.value[activeIndex.value].path);
  } else if (e.key === 'Escape') {
    showDropdown.value = false;
  }
}

function handleBlur() {
  setTimeout(() => { showDropdown.value = false; }, 200);
}
</script>

<template>
  <div style="position: relative; width: 100%; max-width: 600px; margin: 0 auto;">
    <NInput
      ref="inputRef"
      :size="size || 'large'"
      :placeholder="t('home.searchPlaceholder')"
      clearable
      @input="handleInput"
      @keydown="handleKeydown"
      @blur="handleBlur"
      @focus="showDropdown = searchStore.query.trim().length > 0"
    >
      <template #prefix>🔍</template>
    </NInput>
    <div v-if="showDropdown && suggestions.length > 0"
      style="position: absolute; top: 100%; left: 0; right: 0; z-index: 100; margin-top: 4px;">
      <NCard content-style="padding: 4px;">
        <NScrollbar style="max-height: 320px;">
          <div
            v-for="(tool, idx) in suggestions"
            :key="tool.path"
            :style="{
              padding: '8px 12px', cursor: 'pointer', borderRadius: '4px',
              backgroundColor: idx === activeIndex ? 'rgba(24,160,88,0.1)' : 'transparent'
            }"
            @mousedown.prevent="selectTool(tool.path)"
            @mouseenter="activeIndex = idx"
          >
            <div style="font-weight: 500;">{{ t(tool.name) }}</div>
            <div style="font-size: 12px; opacity: 0.6;">
              {{ t(tool.description) }}
              <NTag size="tiny" :bordered="false" style="margin-left: 8px;">
                {{ t(`category.${tool.category}`) }}
              </NTag>
            </div>
          </div>
        </NScrollbar>
      </NCard>
    </div>
    <div v-if="showDropdown && suggestions.length === 0 && searchStore.query.trim()"
      style="position: absolute; top: 100%; left: 0; right: 0; z-index: 100; margin-top: 4px;">
      <NCard content-style="padding: 16px; text-align: center; opacity: 0.6;">
        {{ t('home.noResults') }}
      </NCard>
    </div>
  </div>
</template>
