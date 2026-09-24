<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('Hello');
const count = ref(5);
const output = computed(() => input.value.repeat(Math.min(count.value, 1000)));
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" :placeholder="t('tools.textRepeat.inputPlaceholder')" />
      <NInputNumber v-model:value="count" :min="1" :max="1000" :placeholder="t('common.count')" style="width:150px" />
      <NInput :value="output" type="textarea" :rows="6" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
