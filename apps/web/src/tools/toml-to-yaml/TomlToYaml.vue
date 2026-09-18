<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { tomlToYaml } from './toml-to-yaml.service';

const { t } = useI18n();
const tool = useCurrentTool();
const input = ref('');

const output = computed(() => tomlToYaml(input.value).result);
const errorMsg = computed(() => tomlToYaml(input.value).error);

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
      <NCard title="Input TOML">
        <NSpace vertical :size="12">
          <NInput
            v-model:value="input"
            type="textarea"
            :rows="10"
            placeholder='title = "example"&#10;[owner]&#10;name = "Tom"'
          />
        </NSpace>
      </NCard>
      <NCard title="Output YAML">
        <NSpace vertical :size="12">
          <NInput
            :value="output"
            type="textarea"
            :rows="10"
            readonly
            placeholder="title: example"
          />
          <NButton :disabled="!output" @click="copyOutput">
            {{ t('tool.copy') }}
          </NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
