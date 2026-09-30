<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { NUpload, NUploadDragger, NIcon, useMessage } from 'naive-ui';
import type { UploadFileInfo } from 'naive-ui';
import { CloudUpload, File as FileIcon, FileMusic } from '@vicons/tabler';
import { useI18n } from 'vue-i18n';
import { collectClipboardFiles, splitByAccept } from '@/utils/clipboard-files';
import { thumbnailKind } from '@/utils/file-thumbnail';
import { renderThumbnailDataUrl } from '@/utils/thumbnail-render';

const props = withDefaults(defineProps<{
  accept?: string;
  multiple?: boolean;
}>(), {
  accept: '',
  multiple: false,
});

const emit = defineEmits<{ change: [files: File[]] }>();

const { t } = useI18n();
const message = useMessage();
const fileList = ref<UploadFileInfo[]>([]);

const files = computed(() =>
  fileList.value.map((item) => item.file).filter((f): f is File => f !== null),
);

// Thumbnails are keyed by list-entry id and cached for the entry's lifetime;
// they are data URLs, so nothing here needs revoking on removal.
const thumbnails = ref<Record<string, string>>({});
const rendering = new Set<string>();

function fallbackIcon(file: File | null | undefined) {
  return file?.type.startsWith('audio/') ? FileMusic : FileIcon;
}

async function ensureThumbnail(item: UploadFileInfo) {
  const file = item.file;
  if (!file || thumbnails.value[item.id] || rendering.has(item.id)) return;
  if (thumbnailKind(file) === 'none') return;

  rendering.add(item.id);
  const dataUrl = await renderThumbnailDataUrl(file);
  rendering.delete(item.id);

  // The entry can be removed while its thumbnail renders; a late result must
  // not resurrect the row or land on a different file's id.
  if (dataUrl && fileList.value.some((entry) => entry.id === item.id)) {
    thumbnails.value = { ...thumbnails.value, [item.id]: dataUrl };
  }
}

function syncThumbnails() {
  const live = new Set(fileList.value.map((item) => item.id));
  const kept: Record<string, string> = {};
  for (const [id, dataUrl] of Object.entries(thumbnails.value)) {
    if (live.has(id)) kept[id] = dataUrl;
  }
  thumbnails.value = kept;

  for (const item of fileList.value) void ensureThumbnail(item);
}

watch(fileList, syncThumbnails, { immediate: true });

function emitFiles() {
  emit('change', files.value);
}

// naive-ui appends every pick to the list, so single-file tools keep only the newest entry.
function onUpdate(list: UploadFileInfo[]) {
  fileList.value = props.multiple ? list : list.slice(-1);
  emitFiles();
}

function remove(index: number) {
  fileList.value = fileList.value.filter((_, i) => i !== index);
  emitFiles();
}

let pasteSequence = 0;

function toFileInfo(file: File): UploadFileInfo {
  return {
    id: `pasted-${Date.now()}-${pasteSequence++}`,
    name: file.name,
    status: 'pending',
    file,
    type: file.type,
  };
}

// The paste event is the only channel that carries a copied file (or a copied
// screenshot) without a clipboard permission prompt. It has to live on the
// document: a paste with no focused editor is dispatched there, not at the
// control. Clipboards without files are left alone so the tools' own text
// inputs keep receiving ordinary text pastes.
function onPaste(event: ClipboardEvent) {
  const pasted = collectClipboardFiles(event.clipboardData);
  if (!pasted.length) return;

  const { accepted } = splitByAccept(pasted, props.accept);
  if (!accepted.length) {
    message.warning(t('tool.fileUpload.rejected'));
    return;
  }

  event.preventDefault();
  const entries = (props.multiple ? accepted : accepted.slice(0, 1)).map(toFileInfo);
  fileList.value = props.multiple ? [...fileList.value, ...entries] : entries;
  emitFiles();
}

onMounted(() => document.addEventListener('paste', onPaste));
onUnmounted(() => document.removeEventListener('paste', onPaste));
</script>

<template>
  <div class="tool-file-upload">
    <NUpload
      :file-list="fileList"
      :accept="accept"
      :multiple="multiple"
      :default-upload="false"
      :show-file-list="false"
      @update:file-list="onUpdate"
    >
      <NUploadDragger>
        <div class="tool-file-upload__body">
          <NIcon :size="26" :component="CloudUpload" class="tool-file-upload__icon" />
          <p class="tool-file-upload__label">
            {{ files.length ? t('tool.fileUpload.replace') : t('tool.fileUpload.choose') }}
          </p>
          <p v-if="accept" class="tool-file-upload__hint">
            {{ t('tool.fileUpload.accepted', { types: accept }) }}
          </p>
        </div>
      </NUploadDragger>
    </NUpload>

    <ul v-if="fileList.length" class="tool-file-upload__files">
      <li v-for="(item, index) in fileList" :key="item.id" class="tool-file-upload__file">
        <span class="tool-file-upload__thumb">
          <img
            v-if="thumbnails[item.id]"
            class="tool-file-upload__thumb-image"
            :src="thumbnails[item.id]"
            alt=""
          />
          <NIcon v-else :size="20" :component="fallbackIcon(item.file)" class="tool-file-upload__thumb-icon" />
        </span>
        <span class="tool-file-upload__name" :title="item.name">{{ item.name }}</span>
        <button type="button" class="tool-file-upload__remove" @click="remove(index)">
          {{ t('common.remove') }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tool-file-upload__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xxs);
}

.tool-file-upload__icon {
  color: var(--color-primary);
}

.tool-file-upload__label {
  margin: 0;
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-ink);
}

.tool-file-upload__hint {
  margin: 0;
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
}

.tool-file-upload__files {
  list-style: none;
  margin: var(--spacing-xs) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
}

.tool-file-upload__file {
  /* The app has no global border-box reset, so it is declared here: the sizes
     below are then the rendered ones. 38 + 2x4px padding + 2x1px border lands
     the row exactly on the DESIGN.md 48px (large) step. */
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-height: 48px;
  padding: var(--spacing-xxs) var(--spacing-sm);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  background: var(--color-surface-soft);
}

.tool-file-upload__thumb {
  box-sizing: border-box;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  overflow: hidden;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
}

.tool-file-upload__thumb-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tool-file-upload__thumb-icon {
  color: var(--color-text-3);
}

.tool-file-upload__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--font-size-body-sm);
  color: var(--color-ink);
}

.tool-file-upload__remove {
  flex: none;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
}

.tool-file-upload__remove:hover {
  color: var(--color-error);
}
</style>
