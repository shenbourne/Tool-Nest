<script setup lang="ts">
import { NLayout, NLayoutContent, NResult, NButton } from 'naive-ui';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <NLayout style="min-height: 100vh;">
    <NLayoutContent content-style="padding: 48px; display: flex; justify-content: center;">
      <NResult status="404" description="Page not found">
        <template #footer>
          <NButton @click="router.push('/')">Go Home</NButton>
        </template>
      </NResult>
    </NLayoutContent>
  </NLayout>
</template>
