<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { xmlToJson } from './xml-to-json.service';

const { t } = useI18n();
const tool = useCurrentTool();
const input = ref('');

const output = computed(() => xmlToJson(input.value).result);
const errorMsg = computed(() => xmlToJson(input.value).error);

</script>
<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('tools.xmlToJson.input')" :output-title="t('tools.xmlToJson.output')" export-name="output.json">
      <template #input>
        <NInput
        v-model:value="input"
        type="textarea"
        :rows="10"
        placeholder='<root><item>example</item></root>'
        :input-props="{ id: 'xmlToJsonField0' }"/>
      </template>
      <template #output>
        <NInput
        :value="output"
        type="textarea"
        :rows="10"
        readonly
        placeholder='{ "root": { "item": { "_text": "example" } } }'
        :input-props="{ id: 'xmlToJsonField1' }"/>
      </template>
      <template #params>
        <NAlert v-if="errorMsg" type="error" :title="t('common.error')">
        {{ errorMsg }}
        </NAlert>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
