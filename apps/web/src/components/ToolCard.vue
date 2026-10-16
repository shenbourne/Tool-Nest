<script setup lang="ts">
import { NCard, NTag, NButton, NSpace } from 'naive-ui';
import { RouterLink, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToolStore } from '@/stores/tool.store';
import type { ToolDefinition } from '@toolnest/shared';
import { computed } from 'vue';
import { visibleToolTags } from '@/utils/tool-tags';
import { getToolTabNavigation } from '@/utils/tool-tab-navigation';

const props = defineProps<{ tool: ToolDefinition; expanded?: boolean; joined?: boolean }>();
const router = useRouter();
const { t } = useI18n();
const toolStore = useToolStore();

const isFavorite = computed(() => toolStore.favoritePaths.includes(props.tool.path));
const tabConfig = computed(() => props.expanded ? getToolTabNavigation(props.tool.path) : undefined);
const isExpanded = computed(() => !!tabConfig.value);

function navigate() {
  router.push(props.tool.path);
}

function toggleFav(e: Event) {
  e.stopPropagation();
  toolStore.toggleFavorite(props.tool.path);
}
</script>

<template>
  <NCard class="tool-card" :class="{ 'tool-card-expanded': isExpanded, 'tool-card-joined': isExpanded && joined }" :bordered="!isExpanded" style="cursor: pointer;" :tabindex="isExpanded ? 0 : undefined" @click="navigate" @keydown.enter.self="navigate">
    <template #header>
      <div class="tool-card-header">
        <span class="tool-card-title">{{ t(tool.name) }}</span>
        <NSpace v-if="isExpanded" class="tool-card-header-tags" size="small">
          <NTag size="small" :bordered="false" type="info">
            {{ t(`category.${tool.category}.name`) }}
          </NTag>
          <NTag v-for="tag in visibleToolTags(tool.tags).slice(0, 3)" :key="tag" size="small" :bordered="false">
            {{ t(`tags.labels.${tag}`) }}
          </NTag>
        </NSpace>
        <NButton
          text
          size="small"
          class="tool-card-fav"
          :class="{ active: isFavorite }"
          @click="toggleFav"
        >
          {{ isFavorite ? '★' : '☆' }}
        </NButton>
      </div>
    </template>
    <p class="tool-card-desc">{{ t(tool.description) }}</p>
    <NSpace v-if="!isExpanded" size="small">
      <NTag size="small" :bordered="false" type="info">
        {{ t(`category.${tool.category}.name`) }}
      </NTag>
      <NTag v-for="tag in visibleToolTags(tool.tags).slice(0, 3)" :key="tag" size="small" :bordered="false">
        {{ t(`tags.labels.${tag}`) }}
      </NTag>
    </NSpace>
    <nav v-if="isExpanded" class="text-tab-cards" :aria-label="t(tool.name)">
      <RouterLink v-for="tab in tabConfig?.tabs" :key="tab.name" :to="{ path: tool.path, query: tab.query ?? { tab: tab.name } }" class="text-tab-link" @click.stop>
        <NCard class="tool-card text-tab-card" size="small">
          <span class="tool-card-title">{{ t(tab.homeLabelKey) }}</span>
        </NCard>
      </RouterLink>
    </nav>
  </NCard>
</template>

<style scoped>
.tool-card {
  height: 100%;
  border: 1px solid var(--color-hairline);
  transition:
    box-shadow var(--motion-base) var(--motion-ease),
    border-color var(--motion-base) var(--motion-ease);
}

.tool-card:hover {
  box-shadow: var(--shadow-card);
  border-color: var(--color-hairline-strong);
}

.tool-card-expanded {
  background: transparent;
  border-width: 1px 0;
  border-color: var(--color-hairline-strong);
  border-radius: 0;
}

.tool-card-expanded:hover {
  box-shadow: none;
  border-color: var(--color-hairline-strong);
}

.tool-card-joined {
  border-top-width: 0;
}

.text-tab-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.text-tab-link {
  flex: 0 1 calc((100% - 48px) / 5);
  min-width: 112px;
  max-width: 180px;
  text-decoration: none;
  border-radius: 999px;
}

.text-tab-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.text-tab-card {
  text-align: center;
  border-radius: 999px;
}

.text-tab-card :deep(.n-card-content) {
  padding: 6px 12px;
}

@media (max-width: 639px) {
  .text-tab-link {
    flex-basis: calc((100% - 12px) / 2);
    min-width: 0;
  }
}

.tool-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-card-expanded .tool-card-header {
  justify-content: flex-start;
  gap: 12px;
}

.tool-card-expanded .tool-card-title,
.tool-card-expanded .tool-card-fav {
  flex-shrink: 0;
}

.tool-card-expanded .tool-card-fav {
  margin-left: auto;
}

.tool-card-expanded:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.tool-card-expanded .tool-card-desc {
  -webkit-line-clamp: unset;
}

@media (max-width: 639px) {
  .tool-card-expanded .tool-card-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px 12px;
  }

  .tool-card-header-tags {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .tool-card-expanded .tool-card-fav {
    grid-column: 2;
    grid-row: 1;
  }

  .tool-card-expanded :deep(.n-card-header),
  .tool-card-expanded :deep(.n-card-content) {
    padding-left: 12px;
    padding-right: 12px;
  }

  .tool-card-header-tags :deep(.n-tag) {
    padding: 0 4px;
  }
}

.tool-card-title {
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-ink);
}

.tool-card-fav {
  font-size: 16px;
  color: var(--color-text-3);
}

.tool-card-fav.active {
  color: var(--color-primary);
}

.tool-card-desc {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-body-sm);
  color: var(--color-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
