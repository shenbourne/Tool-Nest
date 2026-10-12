<script setup lang="ts">
import { NCard, NTag, NButton, NSpace } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToolStore } from '@/stores/tool.store';
import type { ToolDefinition } from '@toolnest/shared';
import { computed } from 'vue';

const props = defineProps<{ tool: ToolDefinition }>();
const router = useRouter();
const { t } = useI18n();
const toolStore = useToolStore();

const isFavorite = computed(() => toolStore.favoritePaths.includes(props.tool.path));

function navigate() {
  router.push(props.tool.path);
}

function toggleFav(e: Event) {
  e.stopPropagation();
  toolStore.toggleFavorite(props.tool.path);
}
</script>

<template>
  <NCard class="tool-card" style="cursor: pointer;" @click="navigate">
    <template #header>
      <div class="tool-card-header">
        <span class="tool-card-title">{{ t(tool.name) }}</span>
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
    <NSpace size="small">
      <NTag size="small" :bordered="false" type="info">
        {{ t(`category.${tool.category}.name`) }}
      </NTag>
      <NTag v-for="tag in tool.tags.slice(0, 3)" :key="tag" size="small" :bordered="false">
        {{ tag }}
      </NTag>
    </NSpace>
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

.tool-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
