<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { jsonToYaml } from './json-to-yaml.service';

const { t } = useI18n();
const tool = useCurrentTool();
const input = ref('');

const output = computed(() => jsonToYaml(input.value).result);
const errorMsg = computed(() => jsonToYaml(input.value).error);

</script>
<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('tools.jsonToYaml.input')" :output-title="t('tools.jsonToYaml.output')" export-name="output.yaml">
      <template #input>
        <NInput
        v-model:value="input"
        type="textarea"
        :rows="10"
        placeholder='{ "name": "example" }'
        :input-props="{ id: 'jsonToYamlField0' }"/>
      </template>
      <template #output>
        <NInput
        :value="output"
        type="textarea"
        :rows="10"
        readonly
        placeholder="name: example"
        :input-props="{ id: 'jsonToYamlField1' }"/>
      </template>
      <template #params>
        <NAlert v-if="errorMsg" type="error" :title="t('common.error')">
        {{ errorMsg }}
        </NAlert>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
