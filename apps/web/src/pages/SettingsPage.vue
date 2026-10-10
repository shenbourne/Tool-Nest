<script setup lang="ts">
import { NCard, NSelect, NRadioGroup, NRadioButton, NSwitch, NSpace, NAlert, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { computed, onMounted } from 'vue';
import { usePreferencesStore } from '@/stores/preferences.store';

const { t } = useI18n();
const preferencesStore = usePreferencesStore();

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
  get: () => preferencesStore.prefs.language,
  set: (val: string) => {
    preferencesStore.setLocale(val);
    preferencesStore.save({ language: val });
  },
});

const themeMode = computed({
  get: () => preferencesStore.prefs.theme,
  set: (val: 'light' | 'dark' | 'system') => {
    preferencesStore.setMode(val);
    preferencesStore.save({ theme: val });
  },
});

const sidebarMode = computed({
  get: () => preferencesStore.sidebarMode,
  set: (val: 'anchor' | 'navigate') => {
    preferencesStore.setSidebarMode(val);
  },
});
</script>

<template>
  <div style="padding: 24px; max-width: 800px; margin: 0 auto;">
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

    <!-- Layout Mode -->
    <NCard style="margin-bottom: 16px;">
      <template #header>{{ t('settings.layoutMode') }}</template>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 14px;">{{ t('settings.sidebarModeAnchor') }}</span>
        <NSwitch
          :value="sidebarMode === 'navigate'"
          @update:value="(val: boolean) => sidebarMode = val ? 'navigate' : 'anchor'"
        />
        <span style="font-size: 14px;">{{ t('settings.sidebarModeNavigate') }}</span>
      </div>
      <p style="margin: 8px 0 0; font-size: 13px; opacity: 0.6;">
        {{ sidebarMode === 'anchor' ? t('settings.sidebarModeAnchor') : t('settings.sidebarModeNavigate') }}
      </p>
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
  </div>
</template>
