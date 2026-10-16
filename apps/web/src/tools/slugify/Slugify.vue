<script setup lang="ts">
defineOptions({ name: 'ToolSlugify' });
import { ref, computed } from 'vue';
import { NInput } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('Hello World! This is a Test.');
const slug = computed(() => input.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="slug" :input-title="t('common.input')" :output-title="t('common.output')" export-name="slug.txt">
      <template #input>
        <NInput v-model:value="input" :placeholder="t('tools.slugify.inputPlaceholder')"  :input-props="{ id: 'slugifyField0' }"/>
      </template>
      <template #output>
        <NInput :value="slug" readonly :placeholder="t('tools.slugify.outputPlaceholder')"  :input-props="{ id: 'slugifyField1' }"/>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
