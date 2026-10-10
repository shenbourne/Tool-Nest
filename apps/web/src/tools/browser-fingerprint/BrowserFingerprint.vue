<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NCard, NSpace, NDataTable } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const data = ref<{key: string; value: string}[]>([]);
onMounted(() => {
  const nav = navigator as any;
  data.value = [
    { key: 'User Agent', value: navigator.userAgent },
    { key: 'Platform', value: navigator.platform },
    { key: 'Language', value: navigator.language },
    { key: 'Languages', value: navigator.languages?.join(', ') || '' },
    { key: 'Screen', value: screen.width + 'x' + screen.height + ' @' + devicePixelRatio + 'x' },
    { key: 'Color Depth', value: screen.colorDepth + ' bit' },
    { key: 'Timezone', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
    { key: 'Cookies Enabled', value: String(navigator.cookieEnabled) },
    { key: 'Do Not Track', value: nav.doNotTrack || 'Not set' },
    { key: 'Hardware Concurrency', value: String(navigator.hardwareConcurrency || 'N/A') },
    { key: 'Device Memory', value: (nav.deviceMemory || 'N/A') + ' GB' },
    { key: 'Max Touch Points', value: String(nav.maxTouchPoints || 0) },
    { key: 'PDF Viewer', value: String(navigator.pdfViewerEnabled ?? 'N/A') },
    { key: 'WebGL Vendor', value: getWebGL('UNMASKED_VENDOR_WEBGL') },
    { key: 'WebGL Renderer', value: getWebGL('UNMASKED_RENDERER_WEBGL') },
  ];
});
function getWebGL(param: string): string {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return 'N/A';
    const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!ext) return 'N/A';
    return (gl as WebGLRenderingContext).getParameter(param === 'UNMASKED_VENDOR_WEBGL' ? ext.UNMASKED_VENDOR_WEBGL : ext.UNMASKED_RENDERER_WEBGL) || 'N/A';
  } catch { return 'N/A'; }
}
const cols = [{ title: 'Property', key: 'key' }, { title: 'Value', key: 'value' }];
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NDataTable :columns="cols" :data="data" :bordered="false" size="small" /></NCard>
  </ToolLayout>
</template>
