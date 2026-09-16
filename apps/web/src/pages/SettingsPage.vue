<script setup lang="ts">
import { NLayout, NLayoutHeader, NLayoutContent } from 'naive-ui';
import AppNavbar from '@/components/AppNavbar.vue';
</script>

<template>
  <NLayout has-sider style="min-height: 100vh;">
    <NLayout>
      <NLayoutHeader>
        <AppNavbar />
      </NLayoutHeader>
      <NLayoutContent content-style="padding: 24px; max-width: 800px; margin: 0 auto;">
        <h2>Settings</h2>
        <!-- Settings form -->
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>
