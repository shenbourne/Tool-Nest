<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { xmlToJson } from './xml-to-json.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();
const input = ref('');

const output = computed(() => xmlToJson(input.value).result);
const errorMsg = computed(() => xmlToJson(input.value).error);

function copyOutput() {
  copyToClipboard(output.value);
}
</script>
<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NAlert v-if="errorMsg" type="error" :title="t('common.error')">
        {{ errorMsg }}
      </NAlert>
      <NCard :title="t('tools.xmlToJson.input')">
        <NSpace vertical :size="12">
          <NInput
            v-model:value="input"
            type="textarea"
            :rows="10"
            placeholder='<root><item>example</item></root>'
           :input-props="{ id: 'xmlToJsonField0' }"/>
        </NSpace>
      </NCard>
      <NCard :title="t('tools.xmlToJson.output')">
        <NSpace vertical :size="12">
          <NInput
            :value="output"
            type="textarea"
            :rows="10"
            readonly
            placeholder='{ "root": { "item": { "_text": "example" } } }'
           :input-props="{ id: 'xmlToJsonField1' }"/>
          <NButton :disabled="!output" @click="copyOutput">
            {{ t('tool.copy') }}
          </NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
