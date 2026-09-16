<script setup lang="ts">
import { NCard, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { computed } from 'vue';
import { useToolStore } from '@/stores/tool.store';

const { t } = useI18n();
const toolStore = useToolStore();
const tool = computed(() => toolStore.getToolByPath('/hello-world'));
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
