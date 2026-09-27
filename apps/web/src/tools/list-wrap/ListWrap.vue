<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const prefix = ref('"');
const suffix = ref('"');
const output = computed(() => input.value.split('\n').map(l => prefix.value + l + suffix.value).join('\n'));
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.listItemsPlaceholder')" />
      <NSpace><NInput v-model:value="prefix" :placeholder="t('common.prefix')" style="width:120px" /><NInput v-model:value="suffix" :placeholder="t('common.suffix')" style="width:120px" /></NSpace>
      <NInput :value="output" type="textarea" :rows="6" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
