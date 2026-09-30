<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import type { CSSProperties } from 'vue';
import { NLayout, NLayoutSider, NLayoutContent, NTooltip } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { TOOL_CATEGORIES } from '@toolnest/shared';
import { usePreferencesStore } from '@/stores/preferences.store';
import { categoryAnchorHref, categoryAnchorId } from '@/utils/category-anchor';
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

// NLayoutSider wraps the slot in a scroll container, so make that wrapper the flex
// column; otherwise .category-list can never be the element that scrolls.
const siderContentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

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
      router.push(categoryAnchorHref(categoryName));
    } else {
      const el = document.getElementById(categoryAnchorId(categoryName));
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
  <NLayout has-sider class="app-layout">
    <NLayoutSider
      class="app-sider"
      :collapsed="collapsed"
      :width="240"
      :collapsed-width="60"
      :native-scrollbar="false"
      :content-style="siderContentStyle"
      bordered
      collapse-mode="width"
      show-trigger="bar"
      @collapse="preferencesStore.toggleSidebarCollapsed()"
      @expand="preferencesStore.toggleSidebarCollapsed()"
    >
      <div class="logo" @click="goHome">
        <span class="logo-text">{{ collapsed ? 'T' : 'ToolNest' }}</span>
      </div>

      <div class="category-list">
        <div
          v-for="cat in sortedCategories"
          :key="cat.name"
          class="category-item"
          :class="{ active: activeCategory === cat.name, collapsed }"
          @click="handleCategoryClick(cat.name)"
        >
          <NTooltip v-if="collapsed" placement="right">
            <template #trigger>
              <span class="category-emoji">{{ getCategoryEmoji(cat.name) }}</span>
            </template>
            {{ t(cat.label) }}
          </NTooltip>
          <template v-else>
            <span class="category-emoji">{{ getCategoryEmoji(cat.name) }}</span>
            <span class="category-label">{{ t(cat.label) }}</span>
          </template>
        </div>
      </div>

      <div class="sidebar-footer">
        <LocaleSwitcher />
        <ThemeSwitcher />
      </div>
    </NLayoutSider>

    <NLayoutContent
      class="app-content"
      :style="{ marginLeft: collapsed ? '60px' : '240px', transition: 'margin-left var(--motion-slow) var(--motion-ease)' }"
    >
      <slot />
    </NLayoutContent>
  </NLayout>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-sider {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 52px;
  box-sizing: border-box;
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  border-bottom: 1px solid var(--color-hairline);
}

.logo-text {
  font-size: var(--font-size-heading-md);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
  overflow: hidden;
}

.category-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-sm) 0;
  scrollbar-width: thin;
  scrollbar-color: var(--color-muted) transparent;
}

.category-list::-webkit-scrollbar {
  width: 10px;
}

.category-list::-webkit-scrollbar-thumb {
  background-color: var(--color-muted);
  border-radius: var(--radius-full);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.category-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  height: 42px;
  padding: 0 var(--spacing-md);
  margin: var(--spacing-xxs) var(--spacing-xs);
  cursor: pointer;
  border-radius: var(--radius-lg);
  color: var(--color-text-2);
  transition:
    background-color var(--motion-base) var(--motion-ease),
    color var(--motion-base) var(--motion-ease);
}

.category-item.collapsed {
  padding: 0;
  justify-content: center;
}

.category-item:hover {
  background-color: var(--color-surface-2);
}

.category-item.active {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  box-shadow: inset 3px 0 0 var(--color-primary);
}

.category-emoji {
  font-size: 18px;
  flex-shrink: 0;
}

.category-label {
  font-size: var(--font-size-body-md);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--color-hairline);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
</style>
