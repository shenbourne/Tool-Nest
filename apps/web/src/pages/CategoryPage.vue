<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { NLayout, NLayoutHeader, NLayoutContent, NGrid, NGi, NBreadcrumb, NBreadcrumbItem, NEmpty, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import AppNavbar from '@/components/AppNavbar.vue';
import ToolCard from '@/components/ToolCard.vue';
import { useToolStore } from '@/stores/tool.store';
import { TOOL_CATEGORIES } from '@toolnest/shared';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toolStore = useToolStore();

const categoryName = computed(() => route.params.category as string);

const categoryDef = computed(() =>
  TOOL_CATEGORIES.find(c => c.name === categoryName.value)
);

const tools = computed(() =>
  toolStore.getToolsByCategory(categoryName.value as any)
);
</script>

<template>
  <NLayout style="min-height: 100vh;">
    <NLayoutHeader>
      <AppNavbar />
    </NLayoutHeader>
    <NLayoutContent content-style="padding: 24px; max-width: 1200px; margin: 0 auto;">
      <NBreadcrumb style="margin-bottom: 16px;">
        <NBreadcrumbItem @click="router.push('/')" style="cursor: pointer;">
          {{ t('nav.home') }}
        </NBreadcrumbItem>
        <NBreadcrumbItem>
          {{ categoryDef ? t(categoryDef.label) : categoryName }}
        </NBreadcrumbItem>
      </NBreadcrumb>

      <div style="margin-bottom: 24px;">
        <h1 style="margin: 0 0 8px;">{{ categoryDef ? t(categoryDef.label) : categoryName }}</h1>
        <p v-if="categoryDef" style="margin: 0; opacity: 0.6;">{{ t(categoryDef.description) }}</p>
      </div>

      <NGrid v-if="tools.length > 0" :x-gap="16" :y-gap="16" :cols="3" responsive="screen">
        <NGi v-for="tool in tools" :key="tool.path">
          <ToolCard :tool="tool" />
        </NGi>
      </NGrid>
      <NEmpty v-else :description="t('home.noResults')" style="padding: 48px 0;">
        <template #extra>
          <NButton size="small" @click="router.push('/')">{{ t('common.back') }}</NButton>
        </template>
      </NEmpty>
    </NLayoutContent>
  </NLayout>
</template>
