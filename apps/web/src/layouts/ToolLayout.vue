<script setup lang="ts">
import { computed, inject } from 'vue';
import { NBreadcrumb, NBreadcrumbItem, NButton, NSpace, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { TOOL_CATEGORIES } from '@toolnest/shared';
import type { ToolDefinition } from '@toolnest/shared';
import { useToolStore } from '@/stores/tool.store';

const embedded = inject('tool-layout-embedded', false);

const props = defineProps<{
  tool: ToolDefinition;
}>();

const { t } = useI18n();
const router = useRouter();
const toolStore = useToolStore();

const isFavorite = computed(() =>
  toolStore.favoritePaths.includes(props.tool.path)
);

const categoryLabel = computed(() => {
  const cat = TOOL_CATEGORIES.find(c => c.name === props.tool.category);
  return cat ? t(cat.label) : props.tool.category;
});

const categoryPath = computed(() => `/tools/${props.tool.category}`);

function toggleFavorite() {
  toolStore.toggleFavorite(props.tool.path);
}

function goHome() {
  router.push('/');
}

function goCategory() {
  router.push(categoryPath.value);
}
</script>

<template>
  <div :class="embedded ? 'embedded-tool' : 'page-container'">
    <!-- 面包屑导航 -->
    <NBreadcrumb v-if="!embedded" style="margin-bottom: var(--spacing-md);">
      <NBreadcrumbItem @click="goHome" style="cursor: pointer;">
        {{ t('nav.home') }}
      </NBreadcrumbItem>
      <NBreadcrumbItem @click="goCategory" style="cursor: pointer;">
        {{ categoryLabel }}
      </NBreadcrumbItem>
      <NBreadcrumbItem>
        {{ t(tool.name) }}
      </NBreadcrumbItem>
    </NBreadcrumb>

    <!-- 工具头部 -->
    <div v-if="!embedded" class="tool-header">
      <div class="tool-header-info">
        <h1 class="tool-title">{{ t(tool.name) }}</h1>
        <p class="tool-description">{{ t(tool.description) }}</p>
        <NSpace size="small" style="margin-top: var(--spacing-xs);">
          <NTag size="small" :bordered="false" type="info">
            {{ categoryLabel }}
          </NTag>
          <NTag
            v-for="tag in tool.tags"
            :key="tag"
            size="small"
            :bordered="false"
          >
            {{ tag }}
          </NTag>
          <NTag v-if="tool.isNew" size="small" type="success" :bordered="false">
            NEW
          </NTag>
        </NSpace>
      </div>
      <div class="tool-header-actions">
        <NButton
          quaternary
          circle
          size="large"
          @click="toggleFavorite"
          :title="isFavorite ? t('tool.unfavorite') : t('tool.favorite')"
          :style="{ color: isFavorite ? 'var(--color-primary)' : undefined, fontSize: '20px' }"
        >
          {{ isFavorite ? '★' : '☆' }}
        </NButton>
      </div>
    </div>

    <!-- 工具内容区域 -->
    <div class="tool-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Three 128px tiles, two 12px gaps and 26px column chrome per side,
   plus the 16px column gap and 50px outer card chrome: 934px total. */
.page-container:has(.tool-file-panel) {
  max-width: 934px;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-hairline);
}

.tool-header-info {
  flex: 1;
}

.tool-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-display);
}

.tool-description {
  margin: 0;
  font-size: var(--font-size-body-md);
  color: var(--color-text-3);
  line-height: var(--line-height-body-md);
}

.tool-header-actions {
  flex-shrink: 0;
  margin-left: var(--spacing-md);
}

.tool-content {
  min-height: 200px;
}

@media (max-width: 640px) {
  .page-container {
    padding: var(--spacing-md);
  }

  .tool-title {
    font-size: var(--font-size-heading-lg);
  }

  .tool-header {
    flex-direction: column;
  }

  .tool-header-actions {
    margin-left: 0;
    margin-top: var(--spacing-sm);
    align-self: flex-end;
  }
}
</style>
