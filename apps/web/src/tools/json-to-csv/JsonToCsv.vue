<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { jsonToCsv } from './json-to-csv.service';

const { t } = useI18n();
const tool = useCurrentTool();
const input = ref('');

const output = computed(() => jsonToCsv(input.value).result);
const errorMsg = computed(() => jsonToCsv(input.value).error);

</script>
<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.inputJson')" :output-title="t('tools.jsonToCsv.outputTitle')" export-name="output.csv">
      <template #input>
        <NInput
        v-model:value="input"
        type="textarea"
        :rows="10"
        placeholder='[{"name":"John","age":30}]'
        :input-props="{ id: 'jsonToCsvField0' }"/>
      </template>
      <template #output>
        <NInput
        :value="output"
        type="textarea"
        :rows="10"
        readonly
        placeholder="name,age&#10;John,30"
        :input-props="{ id: 'jsonToCsvField1' }"/>
      </template>
      <template #params>
        <NAlert v-if="errorMsg" type="error" :title="t('common.error')">
        {{ errorMsg }}
        </NAlert>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
