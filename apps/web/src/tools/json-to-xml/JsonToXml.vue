<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { jsonToXml } from './json-to-xml.service';

const { t } = useI18n();
const tool = useCurrentTool();
const input = ref('');

const output = computed(() => jsonToXml(input.value).result);
const errorMsg = computed(() => jsonToXml(input.value).error);

</script>
<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('tools.jsonToXml.input')" :output-title="t('tools.jsonToXml.output')" export-name="output.xml">
      <template #input>
        <NInput
        v-model:value="input"
        type="textarea"
        :rows="10"
        placeholder='{ "root": { "item": "example" } }'
        :input-props="{ id: 'jsonToXmlField0' }"/>
      </template>
      <template #output>
        <NInput
        :value="output"
        type="textarea"
        :rows="10"
        readonly
        placeholder="<root>\n  <item>example</item>\n</root>"
        :input-props="{ id: 'jsonToXmlField1' }"/>
      </template>
      <template #params>
        <NAlert v-if="errorMsg" type="error" :title="t('common.error')">
        {{ errorMsg }}
        </NAlert>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
