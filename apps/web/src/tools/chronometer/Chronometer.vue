<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { NCard, NButton, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const elapsed = ref(0);
const running = ref(false);
const laps = ref<number[]>([]);
let interval: ReturnType<typeof setInterval> | null = null;
function start() { if (running.value) return; running.value = true; const s = Date.now() - elapsed.value; interval = setInterval(() => { elapsed.value = Date.now() - s; }, 10); }
function stop() { running.value = false; if (interval) clearInterval(interval); }
function reset() { stop(); elapsed.value = 0; laps.value = []; }
function lap() { laps.value.push(elapsed.value); }
function fmt(ms: number) { const m = Math.floor(ms/60000); const s = Math.floor((ms%60000)/1000); const cs = Math.floor((ms%1000)/10); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`; }
onUnmounted(() => { if (interval) clearInterval(interval); });
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="16" align="center">
      <div style="font-size: 48px; font-weight: 700; font-family: monospace;">{{ fmt(elapsed) }}</div>
      <NSpace>
        <NButton v-if="!running" type="primary" @click="start">Start</NButton>
        <NButton v-else type="warning" @click="stop">Stop</NButton>
        <NButton @click="lap" :disabled="!running">Lap</NButton>
        <NButton @click="reset">Reset</NButton>
      </NSpace>
      <div v-if="laps.length" style="width: 100%; max-width: 300px;">
        <div v-for="(l, i) in laps" :key="i" style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee;">
          <span>Lap {{ i + 1 }}</span><span style="font-family: monospace;">{{ fmt(l) }}</span>
        </div>
      </div>
    </NSpace></NCard>
  </ToolLayout>
</template>
