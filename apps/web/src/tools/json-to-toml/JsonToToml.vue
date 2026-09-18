<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { jsonToToml } from './json-to-toml.service';

const { t } = useI18n();
const tool = useCurrentTool();
const input = ref('');

const output = computed(() => jsonToToml(input.value).result);
const errorMsg = computed(() => jsonToToml(input.value).error);

function copyOutput() {
  navigator.clipboard.writeText(output.value);
}
</script>
<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NAlert v-if="errorMsg" type="error" :title="t('common.error')">
        {{ errorMsg }}
      </NAlert>
      <NCard title="Input JSON">
        <NSpace vertical :size="12">
          <NInput
            v-model:value="input"
            type="textarea"
            :rows="10"
            placeholder='{"title":"example","owner":{"name":"Tom"}}'
          />
        </NSpace>
      </NCard>
      <NCard title="Output TOML">
        <NSpace vertical :size="12">
          <NInput
            :value="output"
            type="textarea"
            :rows="10"
            readonly
            placeholder='title = "example"'
          />
          <NButton :disabled="!output" @click="copyOutput">
            {{ t('tool.copy') }}
          </NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
