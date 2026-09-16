<script setup lang="ts">
import { NButton, NTooltip } from 'naive-ui';
import { useThemeStore } from '@/stores/theme.store';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const themeStore = useThemeStore();
const { t } = useI18n();

const themeIcon = computed(() => {
  switch (themeStore.mode) {
    case 'light': return '☀️';
    case 'dark': return '🌙';
    case 'system': return '💻';
  }
});

const themeTooltip = computed(() => {
  switch (themeStore.mode) {
    case 'light': return t('settings.themeLight');
    case 'dark': return t('settings.themeDark');
    case 'system': return t('settings.themeSystem');
  }
});
</script>

<template>
  <NTooltip>
    <template #trigger>
      <NButton quaternary circle @click="themeStore.toggleDark()">
        <span style="font-size: 18px;">{{ themeIcon }}</span>
      </NButton>
    </template>
    {{ themeTooltip }}
  </NTooltip>
</template>
