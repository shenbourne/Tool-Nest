<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NCard, NDataTable } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const data = ref<{feature: string; status: string; info: string}[]>([]);
onMounted(() => {
  const nav = navigator;
  const checks = [
    { feature: 'HTTPS', status: location.protocol === 'https:' ? '✅' : '❌', info: location.protocol },
    { feature: 'Secure Cookies', status: document.cookie ? 'Check manually' : '✅ No cookies', info: '' },
    { feature: 'Do Not Track', status: nav.doNotTrack === '1' ? '✅' : '❌', info: nav.doNotTrack || 'Not set' },
    { feature: 'Geolocation API', status: 'geolocation' in nav ? '⚠️ Available' : '✅ Disabled', info: '' },
    { feature: 'Camera/Microphone', status: 'mediaDevices' in nav ? '⚠️ Available' : '✅ Disabled', info: '' },
    { feature: 'Service Workers', status: 'serviceWorker' in nav ? '⚠️ Supported' : '✅ Not supported', info: '' },
    { feature: 'WebRTC', status: 'RTCPeerConnection' in window ? '⚠️ Available' : '✅ Disabled', info: '' },
    { feature: 'Clipboard API', status: 'clipboard' in nav ? '⚠️ Available' : '✅ Disabled', info: '' },
    { feature: 'IndexedDB', status: 'indexedDB' in window ? '⚠️ Available' : '✅ Disabled', info: '' },
    { feature: 'WebSocket', status: 'WebSocket' in window ? '⚠️ Available' : '✅ Disabled', info: '' },
  ];
  data.value = checks;
});
const cols = [{ title: 'Feature', key: 'feature' }, { title: 'Status', key: 'status' }, { title: 'Info', key: 'info' }];
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NDataTable :columns="cols" :data="data" :bordered="false" size="small" /></NCard>
  </ToolLayout>
</template>
