<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NProgress, NSpace, NTag, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { analyzePassword, tool } from './index';

const { t } = useI18n();
const password = ref('');
const result = computed(() => analyzePassword(password.value));
const progressStatus = computed(() => {
  const s = result.value.score;
  if (s <= 1) return 'error';
  if (s <= 2) return 'warning';
  return 'success';
});
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="16">
        <NInput v-model:value="password" type="password" show-password-on="click" :placeholder="t('tools.passwordStrength.inputPlaceholder')" size="large"  :input-props="{ id: 'passwordStrengthAnalyserField0' }"/>

        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span :style="{ color: result.color, fontWeight: 700 }">{{ result.label }}</span>
            <span style="opacity: 0.6;">{{ t('tools.passwordStrength.score', { score: result.score }) }}/4</span>
          </div>
          <NProgress type="line" :percentage="result.score * 25" :show-indicator="false" :status="progressStatus" />
        </div>

        <div style="display: flex; gap: 16px;">
          <div>
            <span style="opacity: 0.6; font-size: 13px;">{{ t('tools.passwordStrength.crackTime') }}</span>
            <div style="font-size: 18px; font-weight: 700;">{{ result.crackTime }}</div>
          </div>
          <div>
            <span style="opacity: 0.6; font-size: 13px;">{{ t('common.length') }}:</span>
            <div style="font-size: 18px; font-weight: 700;">{{ password.length }}</div>
          </div>
        </div>

        <NAlert v-if="result.suggestions.length > 0" type="warning" :title="t('tools.passwordStrength.suggestions')">
          <ul style="margin: 0; padding-left: 16px;">
            <li v-for="s in result.suggestions" :key="s">{{ s }}</li>
          </ul>
        </NAlert>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
