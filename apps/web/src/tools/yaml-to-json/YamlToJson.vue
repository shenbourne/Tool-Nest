<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { yamlToJson } from './yaml-to-json.service';

const { t } = useI18n();
const tool = useCurrentTool();
const input = ref('');

const output = computed(() => yamlToJson(input.value).result);
const errorMsg = computed(() => yamlToJson(input.value).error);

</script>
<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('tools.yamlToJson.input')" :output-title="t('tools.yamlToJson.output')" export-name="output.json">
      <template #input>
        <NInput
        v-model:value="input"
        type="textarea"
        :rows="10"
        placeholder="name: example&#10;version: 1.0"
        :input-props="{ id: 'yamlToJsonField0' }"/>
      </template>
      <template #output>
        <NInput
        :value="output"
        type="textarea"
        :rows="10"
        readonly
        placeholder="{ }"
        :input-props="{ id: 'yamlToJsonField1' }"/>
      </template>
      <template #params>
        <NAlert v-if="errorMsg" type="error" :title="t('common.error')">
        {{ errorMsg }}
        </NAlert>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
