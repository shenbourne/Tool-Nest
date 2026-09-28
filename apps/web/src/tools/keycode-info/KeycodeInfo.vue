<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { NCard, NInput, NInputGroup, NInputGroupLabel, NSpace, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const event = ref<KeyboardEvent | null>(null);

function handleKeyDown(e: KeyboardEvent) {
  // Never block default browser shortcuts (F5, Ctrl+R, F12, Tab navigation);
  // this tool only observes keys, it has no input to protect.
  event.value = e;
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

const fields = computed(() => {
  if (!event.value) return [];
  return [
    { label: t('tools.keycodeInfo.key'), value: event.value.key },
    { label: t('tools.keycodeInfo.keyCode'), value: String(event.value.keyCode) },
    { label: t('tools.keycodeInfo.code'), value: event.value.code },
    { label: t('tools.keycodeInfo.location'), value: String(event.value.location) },
    {
      label: t('tools.keycodeInfo.modifiers'),
      value: [
        event.value.metaKey && 'Meta',
        event.value.shiftKey && 'Shift',
        event.value.ctrlKey && 'Ctrl',
        event.value.altKey && 'Alt',
      ].filter(Boolean).join(' + ') || t('common.none'),
    },
  ];
});

function copyText(text: string) {
  if (text) copyToClipboard(text);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard>
        <div style="text-align: center; padding: 24px 0;">
          <div v-if="event" style="font-size: 48px; margin-bottom: 12px; font-weight: bold;">
            {{ event.key }}
          </div>
          <span v-else style="font-size: 48px; margin-bottom: 12px; opacity: 0.3;">
            ?
          </span>
          <div style="opacity: 0.6;">
            {{ t('tools.keycodeInfo.pressKeyHint') }}
          </div>
        </div>
      </NCard>

      <div v-if="fields.length > 0">
        <NInputGroup
          v-for="(field, i) in fields"
          :key="i"
          style="margin-bottom: 5px;"
        >
          <NInputGroupLabel style="flex: 0 0 150px;">
            {{ field.label }}
          </NInputGroupLabel>
          <NInput
            :value="field.value"
            readonly
            @click="copyText(field.value)"
            style="cursor: pointer;"
           :input-props="{ id: 'keycodeInfoField0' }"/>
        </NInputGroup>
      </div>

      <NCard v-if="event" :title="t('tools.keycodeInfo.modifierKeys')">
        <NSpace>
          <NTag v-if="event.ctrlKey" type="info">Ctrl</NTag>
          <NTag v-if="event.shiftKey" type="info">Shift</NTag>
          <NTag v-if="event.altKey" type="info">Alt</NTag>
          <NTag v-if="event.metaKey" type="info">Meta</NTag>
          <span v-if="!event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey" style="opacity: 0.5;">
            {{ t('tools.keycodeInfo.noModifiers') }}
          </span>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
