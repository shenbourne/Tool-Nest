<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NTag, NSpace, NDataTable, NInputGroup, NInputGroupLabel } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { mimeTypes, type MimeEntry } from './mime-data';

const { t } = useI18n();
const tool = useCurrentTool();

const searchQuery = ref('');
const lookupByExtension = ref('');
const lookupByMimeType = ref('');

const filteredMimeTypes = computed(() => {
  if (!searchQuery.value.trim()) return mimeTypes;
  const query = searchQuery.value.toLowerCase().trim();
  return mimeTypes.filter(
    (entry) =>
      entry.mimeType.toLowerCase().includes(query) ||
      entry.extensions.some((ext) => ext.toLowerCase().includes(query)) ||
      `.${entry.extensions.join(', .')}`.toLowerCase().includes(query)
  );
});

const extensionLookupResult = computed(() => {
  if (!lookupByExtension.value.trim()) return null;
  const ext = lookupByExtension.value.trim().toLowerCase().replace(/^\./, '');
  const found = mimeTypes.find((entry) =>
    entry.extensions.includes(ext)
  );
  return found ? found.mimeType : null;
});

const mimeLookupResult = computed(() => {
  if (!lookupByMimeType.value.trim()) return null;
  const mimeType = lookupByMimeType.value.trim().toLowerCase();
  const found = mimeTypes.find((entry) =>
    entry.mimeType.toLowerCase() === mimeType
  );
  return found ? found.extensions : null;
});

const columns: DataTableColumns<MimeEntry> = [
  {
    title: t('tools.mimeTypes.mimeTypeColumn'),
    key: 'mimeType',
    width: 300,
    ellipsis: { tooltip: true },
  },
  {
    title: t('tools.mimeTypes.extensionsColumn'),
    key: 'extensions',
    render(row) {
      return row.extensions.map((ext) => `.${ext}`).join(', ');
    },
  },
];

function copyText(text: string) {
  if (text) navigator.clipboard.writeText(text);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.mimeTypes.extensionLookup')">
        <p style="margin-bottom: 8px; opacity: 0.7;">{{ t('tools.mimeTypes.extensionLookupDesc') }}</p>
        <NInputGroup>
          <NInputGroupLabel style="flex: 0 0 120px;">
            {{ t('tools.mimeTypes.extension') }}
          </NInputGroupLabel>
          <NInput
            v-model:value="lookupByExtension"
            :placeholder="t('tools.mimeTypes.extensionPlaceholder')"
            clearable
          />
        </NInputGroup>
        <div v-if="extensionLookupResult" style="margin-top: 8px;">
          <NTag type="primary" round :bordered="false" @click="copyText(extensionLookupResult)" style="cursor: pointer;">
            {{ extensionLookupResult }}
          </NTag>
        </div>
      </NCard>

      <NCard :title="t('tools.mimeTypes.mimeTypeLookup')">
        <p style="margin-bottom: 8px; opacity: 0.7;">{{ t('tools.mimeTypes.mimeTypeLookupDesc') }}</p>
        <NInputGroup>
          <NInputGroupLabel style="flex: 0 0 120px;">
            {{ t('tools.mimeTypes.mimeType') }}
          </NInputGroupLabel>
          <NInput
            v-model:value="lookupByMimeType"
            :placeholder="t('tools.mimeTypes.mimeTypePlaceholder')"
            clearable
          />
        </NInputGroup>
        <div v-if="mimeLookupResult" style="margin-top: 8px;">
          <NTag
            v-for="ext in mimeLookupResult"
            :key="ext"
            type="primary"
            round
            :bordered="false"
            style="margin-right: 8px;"
          >
            .{{ ext }}
          </NTag>
        </div>
      </NCard>

      <NCard :title="t('tools.mimeTypes.allTypes')">
        <NInput
          v-model:value="searchQuery"
          :placeholder="t('tools.mimeTypes.searchPlaceholder')"
          clearable
          style="margin-bottom: 12px;"
        />
        <NDataTable
          :columns="columns"
          :data="filteredMimeTypes"
          :bordered="false"
          :single-line="false"
          :max-height="400"
          virtual-scroll
          size="small"
        />
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
