<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, NNotificationProvider, darkTheme, type GlobalThemeOverrides } from 'naive-ui';
import { computed } from 'vue';
import { useThemeStore } from './stores/theme.store';
import CommandPalette from './components/CommandPalette.vue';

const themeStore = useThemeStore();

const theme = computed(() => themeStore.isDark ? darkTheme : null);

const themeOverrides = computed<GlobalThemeOverrides>(() => ({
  common: {
    primaryColor: '#18a058',
    primaryColorHover: '#36ad6a',
    primaryColorPressed: '#0c7a43',
    primaryColorSuppl: '#36ad6a',
    borderRadius: '6px',
  },
}));
</script>

<template>
  <NConfigProvider :theme="theme" :theme-overrides="themeOverrides" style="min-height: 100vh;">
    <NMessageProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <RouterView />
          <CommandPalette />
        </NNotificationProvider>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
* {
  transition: background-color 0.3s ease, color 0.2s ease, border-color 0.3s ease;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
