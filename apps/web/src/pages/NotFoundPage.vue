<script setup lang="ts">
import { NLayout, NLayoutHeader, NLayoutContent, NResult, NButton } from 'naive-ui';
import { useRouter } from 'vue-router';
import AppNavbar from '@/components/AppNavbar.vue';

const router = useRouter();
</script>

<template>
  <NLayout has-sider style="min-height: 100vh;">
    <NLayout>
      <NLayoutHeader>
        <AppNavbar />
      </NLayoutHeader>
      <NLayoutContent content-style="padding: 48px; display: flex; justify-content: center;">
        <NResult status="404" description="Page not found">
          <template #footer>
            <NButton @click="router.push('/')">Go Home</NButton>
          </template>
        </NResult>
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>
