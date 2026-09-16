<script setup lang="ts">
import { computed } from 'vue';
import { NBreadcrumb, NBreadcrumbItem, NButton, NSpace, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { TOOL_CATEGORIES } from '@toolnest/shared';
import type { ToolDefinition } from '@toolnest/shared';
import { useToolStore } from '@/stores/tool.store';
import AppNavbar from '@/components/AppNavbar.vue';

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
  <div class="tool-page-wrapper">
    <AppNavbar />
    <div class="tool-layout">
    <!-- 面包屑导航 -->
    <NBreadcrumb style="margin-bottom: 16px;">
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
    <div class="tool-header">
      <div class="tool-header-info">
        <h1 class="tool-title">{{ t(tool.name) }}</h1>
        <p class="tool-description">{{ t(tool.description) }}</p>
        <NSpace size="small" style="margin-top: 8px;">
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
          :style="{ color: isFavorite ? '#f0a020' : undefined, fontSize: '20px' }"
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
  </div>
</template>

<style scoped>
.tool-page-wrapper {
  min-height: 100vh;
  background: #fafafc;
}

.tool-layout {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--n-border-color);
}

.tool-header-info {
  flex: 1;
}

.tool-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.tool-description {
  margin: 0;
  font-size: 15px;
  color: var(--n-text-color-3);
  line-height: 1.5;
}

.tool-header-actions {
  flex-shrink: 0;
  margin-left: 16px;
}

.tool-content {
  min-height: 200px;
}

@media (max-width: 640px) {
  .tool-layout {
    padding: 16px;
  }

  .tool-title {
    font-size: 22px;
  }

  .tool-header {
    flex-direction: column;
  }

  .tool-header-actions {
    margin-left: 0;
    margin-top: 12px;
    align-self: flex-end;
  }
}
</style>

<style>
html.dark .tool-page-wrapper {
  background: #101014;
}
</style>
