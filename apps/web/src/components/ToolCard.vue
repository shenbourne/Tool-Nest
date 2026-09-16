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
  <NCard hoverable style="cursor: pointer;" @click="navigate">
    <template #header>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 15px; font-weight: 600;">{{ t(tool.name) }}</span>
        <NButton text size="small" @click="toggleFav">
          {{ isFavorite ? '★' : '☆' }}
        </NButton>
      </div>
    </template>
    <p style="margin: 0 0 8px; font-size: 13px; opacity: 0.7;">
      {{ t(tool.description) }}
    </p>
    <NSpace size="small">
      <NTag size="small" :bordered="false" type="info">
        {{ t(`category.${tool.category}`) }}
      </NTag>
      <NTag v-for="tag in tool.tags.slice(0, 3)" :key="tag" size="small" :bordered="false">
        {{ tag }}
      </NTag>
    </NSpace>
  </NCard>
</template>
