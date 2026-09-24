<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('Hello World! This is a Test.');
const slug = computed(() => input.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" :placeholder="t('tools.slugify.inputPlaceholder')" />
      <NInput :value="slug" readonly :placeholder="t('tools.slugify.outputPlaceholder')" />
    </NSpace></NCard>
  </ToolLayout>
</template>
