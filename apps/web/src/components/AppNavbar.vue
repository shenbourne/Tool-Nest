<script setup lang="ts">
import { NButton, NSpace } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ThemeSwitcher from './ThemeSwitcher.vue';
import LocaleSwitcher from './LocaleSwitcher.vue';

const router = useRouter();
const { t } = useI18n();
</script>

<template>
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 60px; border-bottom: 1px solid var(--n-border-color);">
    <div style="display: flex; align-items: center; gap: 24px;">
      <span style="font-size: 20px; font-weight: bold; cursor: pointer;" @click="router.push('/')">
        ToolNest
      </span>
      <NButton text @click="router.push('/')">{{ t('nav.home') }}</NButton>
      <NButton text @click="router.push('/settings')">{{ t('nav.settings') }}</NButton>
    </div>
    <NSpace :size="4">
      <LocaleSwitcher />
      <ThemeSwitcher />
    </NSpace>
  </div>
</template>
