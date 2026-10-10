<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const prefix = ref('"');
const suffix = ref('"');
const output = computed(() => input.value.split('\n').map(l => prefix.value + l + suffix.value).join('\n'));
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.listItemsPlaceholder')"  :input-props="{ id: 'listWrapField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly  :input-props="{ id: 'listWrapField3' }"/>
      </template>
      <template #params>
        <NSpace><NInput v-model:value="prefix" :placeholder="t('common.prefix')" style="width:120px"  :input-props="{ id: 'listWrapField1' }"/><NInput v-model:value="suffix" :placeholder="t('common.suffix')" style="width:120px"  :input-props="{ id: 'listWrapField2' }"/></NSpace>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
