<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { NCard, NInput, NSpace, NButton, NDescriptions, NDescriptionsItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { parseUserAgent } from './user-agent-parser.service';

const { t } = useI18n();
const tool = useCurrentTool();

const uaString = ref('');
const parsed = computed(() => parseUserAgent(uaString.value));

function copyUa() {
  if (uaString.value) {
    navigator.clipboard.writeText(uaString.value);
  }
}

onMounted(() => {
  uaString.value = navigator.userAgent;
});
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.userAgentParser.uaString')">
        <NSpace vertical :size="12">
          <NInput
            v-model:value="uaString"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            :placeholder="t('tools.userAgentParser.inputPlaceholder')"
          />
          <NButton @click="copyUa">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>

      <NCard :title="t('tools.userAgentParser.browser')">
        <NDescriptions label-placement="left" bordered :column="2" size="small">
          <NDescriptionsItem :label="t('common.name')">{{ parsed.browser.name }}</NDescriptionsItem>
          <NDescriptionsItem :label="t('common.version')">{{ parsed.browser.version }}</NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <NCard :title="t('tools.userAgentParser.operatingSystem')">
        <NDescriptions label-placement="left" bordered :column="2" size="small">
          <NDescriptionsItem :label="t('common.name')">{{ parsed.os.name }}</NDescriptionsItem>
          <NDescriptionsItem :label="t('common.version')">{{ parsed.os.version }}</NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <NCard :title="t('tools.userAgentParser.device')">
        <NDescriptions label-placement="left" bordered :column="3" size="small">
          <NDescriptionsItem :label="t('tools.userAgentParser.deviceType')">{{ parsed.device.type }}</NDescriptionsItem>
          <NDescriptionsItem :label="t('tools.userAgentParser.vendor')">{{ parsed.device.vendor }}</NDescriptionsItem>
          <NDescriptionsItem :label="t('tools.userAgentParser.model')">{{ parsed.device.model }}</NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <NCard :title="t('tools.userAgentParser.engine')">
        <NDescriptions label-placement="left" bordered :column="2" size="small">
          <NDescriptionsItem :label="t('common.name')">{{ parsed.engine.name }}</NDescriptionsItem>
          <NDescriptionsItem :label="t('common.version')">{{ parsed.engine.version }}</NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <NCard title="CPU">
        <NDescriptions label-placement="left" bordered :column="1" size="small">
          <NDescriptionsItem :label="t('tools.userAgentParser.architecture')">{{ parsed.cpu.architecture }}</NDescriptionsItem>
        </NDescriptions>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
