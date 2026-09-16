<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NCard, NSpace, NButton, NAlert, NDataTable } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const ips = ref<string[]>([]);
const testing = ref(false);
async function detect() {
  testing.value = true; ips.value = [];
  try {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.createDataChannel('');
    pc.onicecandidate = (e) => {
      if (!e.candidate) { testing.value = false; return; }
      const match = e.candidate.candidate.match(/([0-9a-fA-F.:]{7,})/);
      if (match && !ips.value.includes(match[1])) ips.value.push(match[1]);
    };
    pc.onicegatheringstatechange = () => { if (pc.iceGatheringState === 'complete') testing.value = false; };
    setTimeout(() => { testing.value = false; }, 5000);
  } catch (e: any) { ips.value = ['Error: ' + e.message]; testing.value = false; }
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NAlert type="warning" title="WebRTC can leak your real IP address even behind VPN" />
      <NButton type="primary" :loading="testing" @click="detect">Detect IPs</NButton>
      <div v-if="ips.length">
        <strong>Detected IPs:</strong>
        <div v-for="ip in ips" style="font-family:monospace;padding:4px;">{{ ip }}</div>
      </div>
      <NAlert v-if="!ips.length && !testing" type="success" title="No IPs detected - your browser may block WebRTC leaks" />
    </NSpace></NCard>
  </ToolLayout>
</template>
