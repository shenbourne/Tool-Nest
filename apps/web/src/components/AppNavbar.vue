<script setup lang="ts">
import { NMenu, NButton, NSpace } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '@/stores/theme.store';
import { computed } from 'vue';

const router = useRouter();
const { t, locale } = useI18n();
const themeStore = useThemeStore();

const menuOptions = computed(() => [
  { label: t('nav.home'), key: 'home' },
  { label: t('nav.categories'), key: 'categories' },
  { label: t('nav.favorites'), key: 'favorites' },
]);

function handleMenuSelect(key: string) {
  if (key === 'home') router.push('/');
  else if (key === 'settings') router.push('/settings');
}

function toggleLocale() {
  locale.value = locale.value === 'zh' ? 'en' : 'zh';
  localStorage.setItem('toolnest-locale', locale.value);
}
</script>

<template>
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 60px; border-bottom: 1px solid var(--n-border-color);">
    <div style="display: flex; align-items: center; gap: 16px;">
      <span style="font-size: 20px; font-weight: bold; cursor: pointer;" @click="router.push('/')">
        ToolNest
      </span>
      <NMenu mode="horizontal" :options="menuOptions" @update:value="handleMenuSelect" style="flex: 1;" />
    </div>
    <NSpace>
      <NButton quaternary @click="toggleLocale">
        {{ locale === 'zh' ? 'EN' : '中文' }}
      </NButton>
      <NButton quaternary @click="themeStore.toggleDark()">
        {{ themeStore.isDark ? '☀️' : '🌙' }}
      </NButton>
      <NButton quaternary @click="router.push('/settings')">
        ⚙️
      </NButton>
    </NSpace>
  </div>
</template>
