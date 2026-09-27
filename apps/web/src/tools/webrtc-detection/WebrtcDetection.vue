<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NCard, NSpace, NButton, NAlert, NDataTable } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const ips = ref<string[]>([]);
const testing = ref(false);
let activePc: RTCPeerConnection | null = null;

function closePc(pc: RTCPeerConnection) {
  pc.close();
  if (activePc === pc) activePc = null;
}

async function detect() {
  testing.value = true; ips.value = [];
  try {
    activePc?.close();
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    activePc = pc;
    pc.createDataChannel('');
    pc.onicecandidate = (e) => {
      if (!e.candidate) { testing.value = false; closePc(pc); return; }
      const match = e.candidate.candidate.match(/([0-9a-fA-F.:]{7,})/);
      if (match && !ips.value.includes(match[1])) ips.value.push(match[1]);
    };
    pc.onicegatheringstatechange = () => { if (pc.iceGatheringState === 'complete') { testing.value = false; closePc(pc); } };
    setTimeout(() => { testing.value = false; closePc(pc); }, 5000);
  } catch (e: any) { ips.value = [t('tools.webrtcDetection.error', { message: e.message })]; testing.value = false; }
}
onUnmounted(() => { activePc?.close(); activePc = null; });
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NAlert type="warning" :title="t('tools.webrtcDetection.warning')" />
      <NButton type="primary" :loading="testing" @click="detect">{{ t('tools.webrtcDetection.detect') }}</NButton>
      <div v-if="ips.length">
        <strong>{{ t('tools.webrtcDetection.detected') }}</strong>
        <div v-for="ip in ips" style="font-family:monospace;padding:4px;">{{ ip }}</div>
      </div>
      <NAlert v-if="!ips.length && !testing" type="success" :title="t('tools.webrtcDetection.noIps')" />
    </NSpace></NCard>
  </ToolLayout>
</template>
