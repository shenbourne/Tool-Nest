<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import Base64Encoder from './Base64Encoder.vue';
import Base64FileConverter from '../base64-file-converter/Base64FileConverter.vue';

const { t } = useI18n();
const tool = useCurrentTool();
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NTabs type="segment" animated>
      <NTabPane name="codec" :tab="t('tools.base64Encoder.tabCodec')">
        <Base64Encoder />
      </NTabPane>
      <NTabPane name="file" :tab="t('tools.base64Encoder.tabFile')">
        <Base64FileConverter />
      </NTabPane>
    </NTabs>
  </ToolLayout>
</template>
