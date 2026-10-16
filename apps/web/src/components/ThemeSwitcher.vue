<script setup lang="ts">
import { NButton, NTooltip } from 'naive-ui';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const preferencesStore = usePreferencesStore();
const { t } = useI18n();

const themeIcon = computed(() => {
  switch (preferencesStore.prefs.theme) {
    case 'light': return '☀️';
    case 'dark': return '🌙';
    default: return '💻';
  }
});

const themeTooltip = computed(() => {
  switch (preferencesStore.prefs.theme) {
    case 'light': return t('settings.themeLight');
    case 'dark': return t('settings.themeDark');
    default: return t('settings.themeSystem');
  }
});
</script>

<template>
  <NTooltip>
    <template #trigger>
      <NButton quaternary circle @click="preferencesStore.toggleDark()">
        <span style="font-size: 18px;">{{ themeIcon }}</span>
      </NButton>
    </template>
    {{ themeTooltip }}
  </NTooltip>
</template>
