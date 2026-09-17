<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, NNotificationProvider, darkTheme, type GlobalThemeOverrides } from 'naive-ui';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePreferencesStore } from './stores/preferences.store';
import CommandPalette from './components/CommandPalette.vue';
import AppLayout from './layouts/AppLayout.vue';

const route = useRoute();
const preferencesStore = usePreferencesStore();

const theme = computed(() => preferencesStore.isDark ? darkTheme : null);
const showSidebar = computed(() => route.meta.showSidebar === true);

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: 'var(--color-primary)',
    primaryColorHover: 'var(--color-primary-hover)',
    primaryColorPressed: 'var(--color-primary-pressed)',
    primaryColorSuppl: 'var(--color-primary-hover)',
    borderRadius: 'var(--radius-md)',
  },
};
</script>

<template>
  <NConfigProvider :theme="theme" :theme-overrides="themeOverrides" style="min-height: 100vh;">
    <NMessageProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <AppLayout v-if="showSidebar">
            <RouterView />
          </AppLayout>
          <RouterView v-else />
          <CommandPalette />
        </NNotificationProvider>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
