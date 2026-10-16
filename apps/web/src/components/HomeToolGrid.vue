<script setup lang="ts">
import { computed } from 'vue';
import type { ToolDefinition } from '@toolnest/shared';
import ToolCard from './ToolCard.vue';
import { isLargeHomeTool, largeHomeToolsFirst } from '@/utils/home-tool-cards';

const props = defineProps<{ tools: ToolDefinition[]; largeFirst?: boolean }>();
const cards = computed(() => props.largeFirst ? largeHomeToolsFirst(props.tools) : props.tools);
</script>

<template>
  <div class="home-tool-grid">
    <div v-for="(tool, index) in cards" :key="tool.path" class="home-tool-grid-item" :class="{ 'home-tool-grid-item-large': isLargeHomeTool(tool) }">
      <ToolCard :tool="tool" expanded :joined="index > 0 && isLargeHomeTool(tool) && isLargeHomeTool(cards[index - 1])" />
    </div>
  </div>
</template>

<style scoped>
.home-tool-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.home-tool-grid-item {
  min-width: 0;
}

.home-tool-grid-item-large {
  grid-column: 1 / -1;
}

.home-tool-grid-item-large + .home-tool-grid-item-large {
  margin-top: -16px;
}

@media (min-width: 640px) {
  .home-tool-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .home-tool-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
