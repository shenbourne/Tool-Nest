<script setup lang="ts">
import { NTag, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useSearchStore } from '@/stores/search.store';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const searchStore = useSearchStore();
const route = useRoute();
const router = useRouter();

function clearFilters() {
  searchStore.clearFilters();
  if (route.query.tag) {
    const query = { ...route.query };
    delete query.tag;
    router.replace({ query });
  }
}
</script>

<template>
  <div>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
      <span style="font-size: 13px; font-weight: 500;">{{ t('tags.filter') }}</span>
      <NButton v-if="searchStore.selectedTags.length > 0" text size="small" @click="clearFilters()">
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
        {{ t(`tags.labels.${tag}`) }}
      </NTag>
    </NSpace>
  </div>
</template>
