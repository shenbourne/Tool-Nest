<script setup lang="ts">
import { useRoute } from 'vue-router';
import { NLayout, NLayoutHeader, NLayoutContent } from 'naive-ui';
import AppNavbar from '@/components/AppNavbar.vue';

const route = useRoute();
</script>

<template>
  <NLayout has-sider style="min-height: 100vh;">
    <NLayout>
      <NLayoutHeader>
        <AppNavbar />
      </NLayoutHeader>
      <NLayoutContent content-style="padding: 24px; max-width: 1200px; margin: 0 auto;">
        <h2>Category: {{ route.params.category }}</h2>
        <!-- Tools in this category -->
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>
