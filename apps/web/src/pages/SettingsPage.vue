<script setup lang="ts">
import { NLayout, NLayoutHeader, NLayoutContent, NCard, NSelect, NRadioGroup, NRadioButton, NDivider, NSwitch, NButton, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { computed, onMounted } from 'vue';
import AppNavbar from '@/components/AppNavbar.vue';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useThemeStore } from '@/stores/theme.store';

const { t, locale } = useI18n();
const preferencesStore = usePreferencesStore();
const themeStore = useThemeStore();

onMounted(() => {
  if (!preferencesStore.loaded) {
    preferencesStore.load();
  }
});

const languageOptions = [
  { label: '简体中文', value: 'zh' },
  { label: 'English', value: 'en' },
];

const currentLanguage = computed({
  get: () => locale.value,
  set: (val: string) => {
    locale.value = val;
    localStorage.setItem('toolnest-locale', val);
    document.documentElement.lang = val;
    preferencesStore.save({ language: val });
  },
});

const themeMode = computed({
  get: () => themeStore.mode,
  set: (val: 'light' | 'dark' | 'system') => {
    themeStore.setMode(val);
  },
});
</script>

<template>
  <NLayout style="min-height: 100vh;">
    <NLayoutHeader>
      <AppNavbar />
    </NLayoutHeader>
    <NLayoutContent content-style="padding: 24px; max-width: 800px; margin: 0 auto;">
      <h1 style="margin: 0 0 24px;">{{ t('settings.title') }}</h1>

      <NAlert v-if="preferencesStore.syncError" type="warning" style="margin-bottom: 24px;">
        {{ preferencesStore.syncError }}
      </NAlert>

      <!-- Language -->
      <NCard style="margin-bottom: 16px;">
        <template #header>{{ t('settings.language') }}</template>
        <NSelect
          :value="currentLanguage"
          :options="languageOptions"
          @update:value="(val: string) => currentLanguage = val"
          style="max-width: 300px;"
        />
      </NCard>

      <!-- Theme -->
      <NCard style="margin-bottom: 16px;">
        <template #header>{{ t('settings.theme') }}</template>
        <NRadioGroup :value="themeMode" @update:value="(val: 'light' | 'dark' | 'system') => themeMode = val">
          <NRadioButton value="light">{{ t('settings.themeLight') }}</NRadioButton>
          <NRadioButton value="dark">{{ t('settings.themeDark') }}</NRadioButton>
          <NRadioButton value="system">{{ t('settings.themeSystem') }}</NRadioButton>
        </NRadioGroup>
      </NCard>

      <!-- Data Management -->
      <NCard>
        <template #header>{{ t('settings.data') }}</template>
        <NSpace vertical>
          <div>
            <p style="margin: 0 0 8px; opacity: 0.7;">{{ t('settings.favoritesCount', { count: preferencesStore.prefs.favorites.length }) }}</p>
            <p style="margin: 0; opacity: 0.7;">{{ t('settings.recentCount', { count: preferencesStore.prefs.recentTools.length }) }}</p>
          </div>
          <NSpace>
            <NButton
              size="small"
              @click="preferencesStore.save({ favorites: [], recentTools: [] })"
            >
              {{ t('settings.clearData') }}
            </NButton>
          </NSpace>
        </NSpace>
      </NCard>
    </NLayoutContent>
  </NLayout>
</template>
