<script setup lang="ts">
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  darkTheme,
  zhCN,
  dateZhCN,
  enUS,
  dateEnUS,
} from 'naive-ui';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePreferencesStore } from './stores/preferences.store';
import CommandPalette from './components/CommandPalette.vue';
import AppLayout from './layouts/AppLayout.vue';
import { naiveLightThemeOverrides, naiveDarkThemeOverrides } from './styles/naive-theme';

const route = useRoute();
const { locale } = useI18n();
const preferencesStore = usePreferencesStore();

const theme = computed(() => preferencesStore.isDark ? darkTheme : null);
const themeOverrides = computed(() =>
  preferencesStore.isDark ? naiveDarkThemeOverrides : naiveLightThemeOverrides
);
const showSidebar = computed(() => route.meta.showSidebar === true);
const naiveLocale = computed(() => (locale.value === 'zh' ? zhCN : enUS));
const naiveDateLocale = computed(() => (locale.value === 'zh' ? dateZhCN : dateEnUS));
</script>

<template>
  <NConfigProvider
    :theme="theme"
    :theme-overrides="themeOverrides"
    :locale="naiveLocale"
    :date-locale="naiveDateLocale"
    style="min-height: 100vh;"
  >
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
