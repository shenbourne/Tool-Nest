<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const count = ref(10);
const output = computed(() => input.value.split('\n').slice(0, count.value).join('\n'));
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.listItemsPlaceholder')"  :input-props="{ id: 'listTruncateField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly  :input-props="{ id: 'listTruncateField2' }"/>
      </template>
      <template #params>
        <NInputNumber v-model:value="count" :min="1" style="width:130px"  :input-props="{ id: 'listTruncateField1' }"/>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
