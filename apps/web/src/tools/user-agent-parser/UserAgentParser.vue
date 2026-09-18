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
      <NCard title="User-Agent String">
        <NSpace vertical :size="12">
          <NInput
            v-model:value="uaString"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="Enter a user-agent string..."
          />
          <NButton @click="copyUa">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>

      <NCard title="Browser">
        <NDescriptions label-placement="left" bordered :column="2" size="small">
          <NDescriptionsItem label="Name">{{ parsed.browser.name }}</NDescriptionsItem>
          <NDescriptionsItem label="Version">{{ parsed.browser.version }}</NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <NCard title="Operating System">
        <NDescriptions label-placement="left" bordered :column="2" size="small">
          <NDescriptionsItem label="Name">{{ parsed.os.name }}</NDescriptionsItem>
          <NDescriptionsItem label="Version">{{ parsed.os.version }}</NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <NCard title="Device">
        <NDescriptions label-placement="left" bordered :column="3" size="small">
          <NDescriptionsItem label="Type">{{ parsed.device.type }}</NDescriptionsItem>
          <NDescriptionsItem label="Vendor">{{ parsed.device.vendor }}</NDescriptionsItem>
          <NDescriptionsItem label="Model">{{ parsed.device.model }}</NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <NCard title="Engine">
        <NDescriptions label-placement="left" bordered :column="2" size="small">
          <NDescriptionsItem label="Name">{{ parsed.engine.name }}</NDescriptionsItem>
          <NDescriptionsItem label="Version">{{ parsed.engine.version }}</NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <NCard title="CPU">
        <NDescriptions label-placement="left" bordered :column="1" size="small">
          <NDescriptionsItem label="Architecture">{{ parsed.cpu.architecture }}</NDescriptionsItem>
        </NDescriptions>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
