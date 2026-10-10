<script setup lang="ts">
import { NLayout, NLayoutContent, NResult, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
</script>

<template>
  <NLayout style="min-height: 100vh;">
    <NLayoutContent content-style="padding: 48px; display: flex; justify-content: center;">
      <NResult status="404" :description="t('common.pageNotFound')">
        <template #footer>
          <NButton @click="router.push('/')">{{ t('common.goHome') }}</NButton>
        </template>
      </NResult>
    </NLayoutContent>
  </NLayout>
</template>
