<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { NInput, NDescriptions, NDescriptionsItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useMediaQuery } from '@vueuse/core';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { parseUserAgent, getCurrentUserAgent } from './user-agent-parser.service';

const { t } = useI18n();
const tool = useCurrentTool();
const mobile = useMediaQuery('(max-width: 640px)');

const uaString = ref('');
const parsed = computed(() => parseUserAgent(uaString.value));

onMounted(() => {
  uaString.value = getCurrentUserAgent();
});
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="uaString" :output-text="''" :input-title="t('tools.userAgentParser.uaString')" hide-output>
      <template #input>
        <NInput
          v-model:value="uaString"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 6 }"
          :placeholder="t('tools.userAgentParser.inputPlaceholder')"
         :input-props="{ id: 'userAgentParserField0' }"/>
      </template>
      <template #params>
        <NDescriptions label-placement="left" bordered :column="mobile ? 1 : 2" size="small">
          <NDescriptionsItem :label="t('tools.userAgentParser.browser')">{{ parsed.browser.name }} {{ parsed.browser.version }}</NDescriptionsItem>
          <NDescriptionsItem :label="t('tools.userAgentParser.operatingSystem')">{{ parsed.os.name }} {{ parsed.os.version }}</NDescriptionsItem>
          <NDescriptionsItem :label="t('tools.userAgentParser.deviceType')">{{ parsed.device.type }}</NDescriptionsItem>
          <NDescriptionsItem :label="t('tools.userAgentParser.vendor')">{{ parsed.device.vendor }}</NDescriptionsItem>
          <NDescriptionsItem :label="t('tools.userAgentParser.model')">{{ parsed.device.model }}</NDescriptionsItem>
          <NDescriptionsItem :label="t('tools.userAgentParser.engine')">{{ parsed.engine.name }} {{ parsed.engine.version }}</NDescriptionsItem>
          <NDescriptionsItem label="CPU">{{ parsed.cpu.architecture }}</NDescriptionsItem>
        </NDescriptions>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
