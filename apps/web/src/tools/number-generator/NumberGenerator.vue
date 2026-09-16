<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const output = computed(() => {
  const lines = input.value.trim().split('\n');
  const type = lines[0]?.toLowerCase() || '';
  const n = parseInt(lines[1]) || 10;
  if (type === 'fibonacci') { const s = [0,1]; for(let i=2;i<n;i++) s.push(s[i-1]+s[i-2]); return s.slice(0,n).join(', '); }
  if (type === 'primes') { const p=[]; for(let i=2;p.length<n;i++){if([2,3].includes(i)||![2,3].some(d=>i%d===0)&&i>3&&Array.from({length:Math.floor(Math.sqrt(i))},(_,j)=>j+2).every(d=>i%d!==0))p.push(i);} return p.join(', '); }
  if (type === 'even') return Array.from({length:n},(_,i)=>i*2).join(', ');
  if (type === 'odd') return Array.from({length:n},(_,i)=>i*2+1).join(', ');
  return 'Line 1: type (fibonacci/primes/even/odd)\nLine 2: count';
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" placeholder="Input..." />
      <NInput :value="output" type="textarea" :rows="6" readonly placeholder="Output..." />
    </NSpace></NCard>
  </ToolLayout>
</template>
