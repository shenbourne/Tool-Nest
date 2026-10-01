<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { minifyJson } from './json-minify.service';

const { t } = useI18n();
const tool = useCurrentTool();

const inputJson = ref('');
const minified = computed(() => minifyJson(inputJson.value));

</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="inputJson" :output-text="minified.result" :input-title="t('common.inputJson')" :output-title="t('tools.jsonMinify.outputTitle')" export-name="output.json">
      <template #input>
        <NInput v-model:value="inputJson" type="textarea" :rows="8" :placeholder="t('tools.jsonMinify.inputPlaceholder')"  :input-props="{ id: 'jsonMinifyField0' }"/>
      </template>
      <template #output>
        <NInput :value="minified.result" type="textarea" :rows="8" readonly :placeholder="t('tools.jsonMinify.outputPlaceholder')"  :input-props="{ id: 'jsonMinifyField1' }"/>
      </template>
      <template #params>
        <NAlert v-if="minified.error" type="error" :title="t('common.invalidJson')">
        {{ minified.error }}
        </NAlert>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
