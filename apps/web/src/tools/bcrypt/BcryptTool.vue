<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NInputNumber, NButton, NSpace, NFormItem, NTag, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { hashSync, compareSync } from 'bcryptjs';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';

const { t } = useI18n();
const { copyToClipboard } = useCopy();

const input = ref('');
const saltCount = ref(10);
// Rounds above ~20 make the synchronous hash take minutes and freeze the page.
const clampedRounds = computed(() => Math.min(20, Math.max(4, saltCount.value ?? 10)));
const hashed = computed(() => {
  try { return input.value ? hashSync(input.value, clampedRounds.value) : ''; } catch { return ''; }
});

const BCRYPT_HASH_RE = /^\$2[aby]\$\d{2}\$/;
const compareString = ref('');
const compareHash = ref('');
// Distinguish a malformed hash from a genuine mismatch.
const compareError = computed(() =>
  compareHash.value && !BCRYPT_HASH_RE.test(compareHash.value)
    ? t('tools.bcrypt.invalidHash')
    : '',
);
const compareMatch = computed(() => {
  if (compareError.value || !compareHash.value) return null;
  try { return compareSync(compareString.value, compareHash.value); } catch { return null; }
});

function copy() { copyToClipboard(hashed.value); }
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.bcrypt.hash')">
        <NSpace vertical :size="12">
          <NInput v-model:value="input" :placeholder="t('tools.bcrypt.inputPlaceholder')" />
          <NFormItem :label="t('tools.bcrypt.saltRounds')" label-placement="left">
            <NInputNumber v-model:value="saltCount" :min="4" :max="20" style="width: 200px;" />
          </NFormItem>
          <NInput :value="hashed" readonly style="font-family: monospace;" />
          <NButton @click="copy">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>

      <NCard :title="t('tools.bcrypt.compareTitle')">
        <NSpace vertical :size="12">
          <NInput v-model:value="compareString" :placeholder="t('tools.bcrypt.compareStringPlaceholder')" />
          <NInput v-model:value="compareHash" :placeholder="t('tools.bcrypt.compareHashPlaceholder')" />
          <NAlert v-if="compareError" type="error" :title="compareError" />
          <div v-else-if="compareMatch !== null">
            <NTag :type="compareMatch ? 'success' : 'error'" size="large">
              {{ compareMatch ? t('tools.bcrypt.match') : t('tools.bcrypt.noMatch') }}
            </NTag>
          </div>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
