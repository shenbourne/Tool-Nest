<script setup lang="ts">
import { NCard, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const tool = useCurrentTool();
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NCard>
      <NAlert type="success" :title="t('tools.helloWorld.name')">
        {{ t('tools.helloWorld.welcome') }}
      </NAlert>
    </NCard>
  </ToolLayout>
</template>
