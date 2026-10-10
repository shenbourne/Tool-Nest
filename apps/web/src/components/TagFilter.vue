<script setup lang="ts">
import { NTag, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useSearchStore } from '@/stores/search.store';

const { t } = useI18n();
const searchStore = useSearchStore();
</script>

<template>
  <div>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
      <span style="font-size: 13px; font-weight: 500;">{{ t('tags.filter') }}</span>
      <NButton v-if="searchStore.selectedTags.length > 0" text size="small" @click="searchStore.clearFilters()">
        {{ t('tags.clearAll') }}
      </NButton>
    </div>
    <NSpace size="small">
      <NTag
        v-for="tag in searchStore.allTags"
        :key="tag"
        :type="searchStore.selectedTags.includes(tag) ? 'success' : 'default'"
        :bordered="false"
        style="cursor: pointer;"
        @click="searchStore.toggleTag(tag)"
      >
        {{ tag }}
      </NTag>
    </NSpace>
  </div>
</template>
