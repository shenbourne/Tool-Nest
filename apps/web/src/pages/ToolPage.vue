<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToolStore } from '@/stores/tool.store';
import { useTitle } from '@vueuse/core';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toolStore = useToolStore();

const toolPath = computed(() => route.path);

const tool = computed(() => {
  return toolStore.getToolByPath(toolPath.value);
});

// 设置页面标题
const pageTitle = computed(() => {
  if (tool.value) {
    return `${t(tool.value.name)} - ${t('app.title')}`;
  }
  return t('app.title');
});

useTitle(pageTitle);

// 记录最近使用
watch(
  () => toolPath.value,
  (path) => {
    if (tool.value && route.meta.isTool) {
      toolStore.addRecentTool(path);
    }
  },
  { immediate: true }
);

// 如果工具不存在，跳转到 404
onMounted(() => {
  if (!tool.value) {
    router.replace({ name: 'not-found' });
  }
});
</script>

<template>
  <!-- 工具页面由路由直接加载工具组件 -->
  <!-- 每个工具组件内部使用 ToolLayout 包裹 -->
  <RouterView v-if="tool" />
  <div v-else style="padding: 48px; text-align: center;">
    <p>Loading...</p>
  </div>
</template>
