<script setup lang="ts">
import { NH2, NP, NGrid, NGi, NDivider, NEmpty } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import SearchBar from '@/components/SearchBar.vue';
import ToolCard from '@/components/ToolCard.vue';
import TagFilter from '@/components/TagFilter.vue';
import { useToolStore } from '@/stores/tool.store';
import { useSearchStore } from '@/stores/search.store';
import { TOOL_CATEGORIES } from '@toolnest/shared';

const { t } = useI18n();
const toolStore = useToolStore();
const searchStore = useSearchStore();

const isSearching = computed(() =>
  searchStore.query.trim() || searchStore.selectedTags.length > 0 || searchStore.selectedCategory
);

const sortedCategories = computed(() =>
  [...TOOL_CATEGORIES].sort((a, b) => a.order - b.order)
);
</script>

<template>
  <div style="padding: 24px; max-width: 1200px; margin: 0 auto;">
    <!-- Hero section with search -->
    <div style="text-align: center; padding: 32px 0 24px;">
      <NH2 style="margin-bottom: 4px;">{{ t('home.welcome') }}</NH2>
      <NP depth="3" style="margin-bottom: 24px;">{{ t('home.welcomeDesc') }}</NP>
      <SearchBar size="large" />
    </div>

    <!-- Tag filter (always visible) -->
    <div v-if="searchStore.allTags.length > 0" style="margin-bottom: 24px;">
      <TagFilter />
    </div>

    <!-- Search results -->
    <div v-if="isSearching">
      <NP depth="3" style="margin-bottom: 16px;">
        {{ t('search.resultCount', { count: searchStore.results.length }) }}
      </NP>
      <NGrid v-if="searchStore.results.length > 0" :x-gap="16" :y-gap="16" :cols="3" responsive="screen" :collapsed-rows="999">
        <NGi v-for="tool in searchStore.results" :key="tool.path">
          <ToolCard :tool="tool" />
        </NGi>
      </NGrid>
      <NEmpty v-else :description="t('home.noResults')" style="padding: 48px 0;" />
    </div>

    <!-- Normal home view -->
    <div v-else>
      <!-- Favorites -->
      <div v-if="toolStore.favoriteTools.length > 0" style="margin-bottom: 32px;">
        <NDivider title-placement="left">{{ t('home.favoriteTools') }}</NDivider>
        <NGrid :x-gap="16" :y-gap="16" :cols="3" responsive="screen">
          <NGi v-for="tool in toolStore.favoriteTools" :key="tool.path">
            <ToolCard :tool="tool" />
          </NGi>
        </NGrid>
      </div>

      <!-- Recent tools -->
      <div v-if="toolStore.recentToolsList.length > 0" style="margin-bottom: 32px;">
        <NDivider title-placement="left">{{ t('home.recentTools') }}</NDivider>
        <NGrid :x-gap="16" :y-gap="16" :cols="3" responsive="screen">
          <NGi v-for="tool in toolStore.recentToolsList" :key="tool.path">
            <ToolCard :tool="tool" />
          </NGi>
        </NGrid>
      </div>

      <!-- All tools by category (with anchor IDs) -->
      <div v-if="toolStore.tools.length > 0">
        <NDivider title-placement="left">{{ t('home.allTools') }}</NDivider>
        <template v-for="cat in sortedCategories" :key="cat.name">
          <div
            v-if="toolStore.toolsByCategory.get(cat.name)?.length"
            :id="`category-${cat.name}`"
            style="margin-bottom: 24px; scroll-margin-top: 24px;"
          >
            <h3 style="margin: 0 0 12px; font-size: 16px;">
              {{ t(cat.label) }}
              <span style="font-weight: normal; opacity: 0.5; font-size: 13px; margin-left: 8px;">
                {{ toolStore.toolsByCategory.get(cat.name)?.length }}
              </span>
            </h3>
            <NGrid :x-gap="16" :y-gap="16" :cols="3" responsive="screen">
              <NGi v-for="tool in toolStore.toolsByCategory.get(cat.name)" :key="tool.path">
                <ToolCard :tool="tool" />
              </NGi>
            </NGrid>
          </div>
        </template>
      </div>

      <NEmpty v-if="toolStore.tools.length === 0" :description="t('home.noToolsInstalled')" style="padding: 48px 0;" />
    </div>
  </div>
</template>
