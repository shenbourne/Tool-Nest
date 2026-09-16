<script setup lang="ts">
import { NLayout, NLayoutHeader, NLayoutContent, NInput, NH2, NP } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import AppNavbar from '@/components/AppNavbar.vue';

const { t } = useI18n();
</script>

<template>
  <NLayout has-sider style="min-height: 100vh;">
    <NLayout>
      <NLayoutHeader>
        <AppNavbar />
      </NLayoutHeader>
      <NLayoutContent content-style="padding: 24px; max-width: 1200px; margin: 0 auto;">
        <div style="text-align: center; padding: 48px 0;">
          <NH2>{{ t('app.title') }}</NH2>
          <NP depth="3">{{ t('app.subtitle') }}</NP>
          <NInput
            size="large"
            :placeholder="t('home.searchPlaceholder')"
            style="max-width: 600px; margin: 24px auto;"
          />
        </div>
        <div>
          <!-- Tool categories and tools grid will go here -->
          <NP depth="3">{{ t('home.allTools') }}</NP>
        </div>
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>
