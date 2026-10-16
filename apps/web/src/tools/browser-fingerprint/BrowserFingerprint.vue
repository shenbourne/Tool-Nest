<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NDescriptions, NDescriptionsItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useMediaQuery } from '@vueuse/core';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { parseUserAgent, getCurrentUserAgent } from '../user-agent-parser/user-agent-parser.service';
import { tool } from './index';

const { t } = useI18n();
const mobile = useMediaQuery('(max-width: 640px)');
const ua = ref('');
const environment = ref<{ key: string; value: string | number | boolean | null }[]>([]);
const parsed = computed(() => parseUserAgent(ua.value));
const rows = computed(() => [
  { label: t('tools.userAgentParser.browser'), value: [parsed.value.browser.name, parsed.value.browser.version].join(' ') },
  { label: t('tools.userAgentParser.operatingSystem'), value: [parsed.value.os.name, parsed.value.os.version].join(' ') },
  { label: t('tools.userAgentParser.deviceType'), value: parsed.value.device.type },
  { label: t('tools.userAgentParser.vendor'), value: parsed.value.device.vendor },
  { label: t('tools.userAgentParser.model'), value: parsed.value.device.model },
  { label: t('tools.userAgentParser.engine'), value: [parsed.value.engine.name, parsed.value.engine.version].join(' ') },
  { label: 'CPU', value: parsed.value.cpu.architecture },
  ...environment.value.map(({ key, value }) => ({
    label: t('tools.browserFingerprint.' + key),
    value: value === null ? t('tools.browserFingerprint.unavailable')
      : typeof value === 'boolean' ? t('tools.browserFingerprint.' + (value ? 'enabled' : 'disabled'))
      : key === 'colorDepth' ? value + ' ' + t('tools.browserFingerprint.bits')
      : key === 'doNotTrack' && value === '' ? t('tools.browserFingerprint.notSet') : String(value),
  })),
]);

onMounted(() => {
  ua.value = getCurrentUserAgent();
  const nav = navigator as Navigator & { deviceMemory?: number; doNotTrack?: string | null };
  environment.value = [
    { key: 'platform', value: nav.platform || null },
    { key: 'language', value: nav.language || null },
    { key: 'languages', value: nav.languages?.join(', ') || null },
    { key: 'screen', value: screen.width + ' × ' + screen.height + ' @' + devicePixelRatio + 'x' },
    { key: 'colorDepth', value: screen.colorDepth },
    { key: 'timezone', value: Intl.DateTimeFormat().resolvedOptions().timeZone || null },
    { key: 'cookies', value: nav.cookieEnabled },
    { key: 'doNotTrack', value: nav.doNotTrack === '1' ? true : nav.doNotTrack === '0' ? false : nav.doNotTrack || '' },
    { key: 'hardwareConcurrency', value: nav.hardwareConcurrency || null },
    { key: 'deviceMemory', value: nav.deviceMemory ? nav.deviceMemory + ' GB' : null },
    { key: 'maxTouchPoints', value: nav.maxTouchPoints },
    { key: 'pdfViewer', value: nav.pdfViewerEnabled ?? null },
    { key: 'webglVendor', value: getWebGL('vendor') },
    { key: 'webglRenderer', value: getWebGL('renderer') },
  ];
});
function getWebGL(param: 'vendor' | 'renderer'): string | null {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    return gl && ext ? gl.getParameter(param === 'vendor' ? ext.UNMASKED_VENDOR_WEBGL : ext.UNMASKED_RENDERER_WEBGL) || null : null;
  } catch { return null; }
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NDescriptions label-placement="left" bordered :column="mobile ? 1 : 2" size="small" class="browser-info">
      <NDescriptionsItem label="User-Agent" :span="mobile ? 1 : 2">{{ ua }}</NDescriptionsItem>
      <NDescriptionsItem v-for="row in rows" :key="row.label" :label="row.label">{{ row.value }}</NDescriptionsItem>
    </NDescriptions>
  </ToolLayout>
</template>

<style scoped>
.browser-info { overflow-wrap: anywhere; }
.browser-info :deep(.n-descriptions-table-header) { width: 120px; }
@media (max-width: 640px) {
  .browser-info :deep(.n-descriptions-table-header) { width: 96px; }
}
</style>
