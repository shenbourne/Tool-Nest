<script setup lang="ts">
import { ref, computed } from 'vue';
import { NButton, NCard, NSpace, NSwitch, NText } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';

const { t } = useI18n();
const { copyToClipboard } = useCopy();

const excludeCommon = ref(true);

const commonPorts = new Set([80, 443, 8080, 8443, 3000, 3001, 4200, 5000, 5173, 5432, 6379, 8000, 8081, 8888, 9090, 27017]);

function generatePort(): number {
  const min = 1024;
  const max = 65535;
  let port: number;
  do {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    port = min + (array[0] % (max - min + 1));
  } while (excludeCommon.value && commonPorts.has(port));
  return port;
}

const port = ref(generatePort());

function refresh() {
  port.value = generatePort();
}

// Toggling the exclusion must not leave a port on screen that violates it.
watch(excludeCommon, () => refresh());

function copy() {
  copyToClipboard(String(port.value));
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical align="center" :size="16">
        <div class="port-display">{{ port }}</div>
        <NSpace align="center" :size="12">
          <NButton @click="copy" type="primary">{{ t('tool.copy') }}</NButton>
          <NButton @click="refresh">{{ t('common.reset') }}</NButton>
        </NSpace>
        <div class="exclude-option">
          <NSwitch v-model:value="excludeCommon" />
          <NText style="margin-left: 8px;">Exclude common ports (80, 443, 8080, etc.)</NText>
        </div>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>

<style scoped>
.port-display {
  font-size: 48px;
  font-weight: bold;
  font-family: monospace;
  color: var(--color-primary);
  margin: 16px 0;
}
.exclude-option {
  display: flex;
  align-items: center;
  margin-top: 8px;
}
</style>
