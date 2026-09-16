<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const QUOTES = [
  ["Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", "Martin Fowler"],
  ["First, solve the problem. Then, write the code.", "John Johnson"],
  ["The best error message is the one that never shows up.", "Thomas Fuchs"],
  ["Code is like humor. When you have to explain it, it's bad.", "Cory House"],
  ["Make it work, make it right, make it fast.", "Kent Beck"],
  ["Simplicity is the soul of efficiency.", "Austin Freeman"],
  ["Talk is cheap. Show me the code.", "Linus Torvalds"],
  ["Programs must be written for people to read, and only incidentally for machines to execute.", "Harold Abelson"],
  ["Testing leads to failure, and failure leads to understanding.", "Burt Rutan"],
  ["The only way to learn a new programming language is by writing programs in it.", "Dennis Ritchie"],
];
const idx = ref(0);
const quote = QUOTES[idx.value];
function next() { idx.value = (idx.value + 1) % QUOTES.length; }
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="16" align="center">
        <div style="font-size:18px;font-style:italic;text-align:center;padding:20px;">"{{ QUOTES[idx][0] }}"</div>
        <div style="opacity:0.7;">— {{ QUOTES[idx][1] }}</div>
        <NButton @click="next" type="primary">Next Quote</NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
