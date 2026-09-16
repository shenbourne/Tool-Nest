<script setup lang="ts">
import { NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

function toggleLocale() {
  locale.value = locale.value === 'zh' ? 'en' : 'zh';
  localStorage.setItem('toolnest-locale', locale.value);
  document.documentElement.lang = locale.value;
}
</script>

<template>
  <NButton quaternary @click="toggleLocale">
    {{ locale === 'zh' ? 'EN' : '中文' }}
  </NButton>
</template>
