<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { NLayout, NLayoutSider, NLayoutContent, NTooltip } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { TOOL_CATEGORIES } from '@toolnest/shared';
import { usePreferencesStore } from '@/stores/preferences.store';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const preferencesStore = usePreferencesStore();

const collapsed = computed(() => preferencesStore.sidebarCollapsed);

const sortedCategories = computed(() =>
  [...TOOL_CATEGORIES].sort((a, b) => a.order - b.order)
);

const clickedCategory = ref<string | null>(null);

const activeCategory = computed(() => {
  if (clickedCategory.value) return clickedCategory.value;
  if (route.name === 'category') return route.params.category as string;
  if (route.meta.category) return route.meta.category as string;
  return null;
});

const categoryEmojiMap: Record<string, string> = {
  'crypto': '🔒', 'converter': '🔄', 'web': '🌐', 'developer': '💻',
  'network': '📡', 'text': '📝', 'data': '📊', 'image': '🖼️',
  'video': '🎬', 'audio': '🔊', 'pdf': '📄', 'math': '🧮',
  'measurement': '📏', 'generator': '⚡', 'network-test': '📶', 'platform': '⚙️',
};

function getCategoryEmoji(name: string): string {
  return categoryEmojiMap[name] || '📦';
}

function handleCategoryClick(categoryName: string) {
  clickedCategory.value = categoryName;
  if (preferencesStore.sidebarMode === 'navigate') {
    router.push(`/tools/${categoryName}`);
  } else {
    // Anchor mode: go to home and scroll
    if (route.path !== '/') {
      router.push(`/#${categoryName}`);
    } else {
      const el = document.getElementById(`category-${categoryName}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function goHome() {
  router.push('/');
}

let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id; // e.g., "category-crypto"
          clickedCategory.value = id.replace('category-', '');
        }
      }
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
  );
  document.querySelectorAll('[id^="category-"]').forEach((el) => {
    observer!.observe(el);
  });
});

onUnmounted(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <NLayout has-sider style="min-height: 100vh;">
    <NLayoutSider
      :collapsed="collapsed"
      :width="240"
      :collapsed-width="60"
      :native-scrollbar="false"
      bordered
      collapse-mode="width"
      show-trigger="bar"
      @collapse="preferencesStore.toggleSidebarCollapsed()"
      @expand="preferencesStore.toggleSidebarCollapsed()"
      style="position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; display: flex; flex-direction: column;"
    >
      <!-- Logo -->
      <div
        style="padding: 16px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--n-border-color);"
        @click="goHome"
      >
        <span style="font-size: 20px; font-weight: bold; white-space: nowrap; overflow: hidden;">
          {{ collapsed ? 'T' : 'ToolNest' }}
        </span>
      </div>

      <!-- Category list (scrollable) -->
      <div style="flex: 1; overflow-y: auto; padding: 8px 0;">
        <div
          v-for="cat in sortedCategories"
          :key="cat.name"
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: collapsed ? '10px 0' : '10px 16px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            cursor: 'pointer',
            borderRadius: '6px',
            margin: '2px 8px',
            backgroundColor: activeCategory === cat.name ? 'rgba(24,160,88,0.12)' : 'transparent',
            color: activeCategory === cat.name ? '#18a058' : undefined,
            transition: 'background-color 0.2s',
          }"
          @click="handleCategoryClick(cat.name)"
        >
          <NTooltip v-if="collapsed" placement="right">
            <template #trigger>
              <span style="font-size: 18px; flex-shrink: 0;">{{ getCategoryEmoji(cat.name) }}</span>
            </template>
            {{ t(cat.label) }}
          </NTooltip>
          <template v-else>
            <span style="font-size: 18px; flex-shrink: 0;">{{ getCategoryEmoji(cat.name) }}</span>
            <span style="font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              {{ t(cat.label) }}
            </span>
          </template>
        </div>
      </div>

      <!-- Footer: theme + locale (pinned at bottom) -->
      <div style="padding: 12px 16px; border-top: 1px solid var(--n-border-color); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
        <LocaleSwitcher />
        <ThemeSwitcher />
      </div>
    </NLayoutSider>

    <NLayoutContent
      :style="{ marginLeft: collapsed ? '60px' : '240px', transition: 'margin-left 0.3s' }"
    >
      <slot />
    </NLayoutContent>
  </NLayout>
</template>

<style>
html.dark .n-layout-sider {
  background: #18181c !important;
}
</style>
