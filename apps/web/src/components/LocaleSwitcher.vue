<script setup lang="ts">
import { NButton } from 'naive-ui';
import { usePreferencesStore } from '@/stores/preferences.store';

const preferencesStore = usePreferencesStore();
</script>

<template>
  <NButton quaternary @click="preferencesStore.toggleLocale">
    {{ preferencesStore.isZh ? '中文' : 'EN' }}
  </NButton>
</template>
