<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { NUpload, NUploadDragger, NIcon, useMessage } from 'naive-ui';
import type { UploadFileInfo } from 'naive-ui';
import { CloudUpload } from '@vicons/tabler';
import { useI18n } from 'vue-i18n';
import { collectClipboardFiles, splitByAccept } from '@/utils/clipboard-files';
import { thumbnailKind } from '@/utils/file-thumbnail';
import { renderThumbnailDataUrl } from '@/utils/thumbnail-render';
import { moveItem } from '@/utils/file-reorder';
import FileCard from '@/components/FileCard.vue';

const props = withDefaults(defineProps<{
  accept?: string;
  multiple?: boolean;
  removable?: boolean;
}>(), {
  accept: '',
  multiple: false,
  removable: true,
});

const emit = defineEmits<{ change: [files: File[]] }>();

const { t } = useI18n();
const message = useMessage();
const fileList = ref<UploadFileInfo[]>([]);

// The box holds one file or many, and that is what picks the layout: a single
// file fills the width at 128px tall, several files are 128x128 tiles in a grid.
const single = computed(() => fileList.value[0] ?? null);

const files = computed(() =>
  fileList.value.map((item) => item.file).filter((f): f is File => f !== null),
);

// Thumbnails are keyed by list-entry id and cached for the entry's lifetime;
// they are data URLs, so nothing here needs revoking on removal.
const thumbnails = ref<Record<string, string>>({});
const rendering = new Set<string>();

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

function isAccepted(file: File) {
  return splitByAccept([file], props.accept).accepted.length > 0;
}

// naive-ui filters dropped files itself but not the ones chosen in the file
// dialog, so every path is re-checked here: the tools' contract is that only
// accepted files ever reach them.
function onUpdate(list: UploadFileInfo[]) {
  const kept = list.filter((item) => {
    const file = item.file;
    return file != null && isAccepted(file);
  });
  if (kept.length !== list.length) message.warning(t('tool.fileUpload.rejected'));

  // naive-ui appends every pick to the list, so single-file boxes keep only the newest entry.
  fileList.value = props.multiple ? kept : kept.slice(-1);
  emitFiles();
}

function remove(index: number) {
  const item = fileList.value[index];
  if (item) delete thumbnails.value[item.id];
  fileList.value = fileList.value.filter((_, i) => i !== index);
  emitFiles();
}

const dragFrom = ref<number | null>(null);
const dropTarget = ref<number | null>(null);

function clearDrag() {
  dragFrom.value = null;
  dropTarget.value = null;
}

function onTileDragStart(index: number, event: DragEvent) {
  dragFrom.value = index;
  dropTarget.value = null;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    // Firefox starts no drag at all unless some data is attached.
    event.dataTransfer.setData('text/plain', String(index));
  }
}

function onTileDragOver(index: number, event: DragEvent) {
  if (dragFrom.value === null || dragFrom.value === index) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  dropTarget.value = index;
}

function onTileDrop(index: number, event: DragEvent) {
  event.preventDefault();
  const from = dragFrom.value;
  clearDrag();
  if (from === null || from === index) return;

  const ordered = moveItem(fileList.value, from, index);
  fileList.value = ordered;
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

function append(files: File[]) {
  const entries = (props.multiple ? files : files.slice(0, 1)).map(toFileInfo);
  fileList.value = props.multiple ? [...fileList.value, ...entries] : entries;
  emitFiles();
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
  append(accepted);
}

async function readClipboard(): Promise<File[]> {
  const items = await navigator.clipboard.read();
  const pasted: File[] = [];
  for (const item of items) {
    for (const type of item.types) {
      const blob = await item.getType(type);
      const ext = type.split('/').pop() ?? 'bin';
      pasted.push(new File([blob], `pasted.${ext}`, { type }));
    }
  }
  return pasted;
}

async function triggerPaste() {
  try {
    const pasted = await readClipboard();
    const { accepted } = splitByAccept(pasted, props.accept);
    if (!accepted.length) {
      message.warning(t('tool.fileUpload.rejected'));
      return;
    }
    append(accepted);
  } catch {
    message.warning(t('tool.fileUpload.rejected'));
  }
}

const uploadRef = ref<InstanceType<typeof NUpload> | null>(null);

function triggerSelect() {
  const root = uploadRef.value?.$el as HTMLElement | undefined;
  root?.querySelector<HTMLInputElement>('input[type="file"]')?.click();
}

defineExpose({ triggerPaste, triggerSelect });

onMounted(() => document.addEventListener('paste', onPaste));
onUnmounted(() => document.removeEventListener('paste', onPaste));
</script>

<template>
  <div class="tool-file-upload" :class="{ 'tool-file-upload--multi': multiple }">
    <NUpload
      ref="uploadRef"
      class="tool-file-upload__upload"
      :file-list="fileList"
      :accept="accept"
      :multiple="multiple"
      :default-upload="false"
      :show-file-list="false"
      @update:file-list="onUpdate"
    >
      <!-- The dragger has to be n-upload's first child or naive-ui ignores drops. -->
      <NUploadDragger class="tool-file-upload__zone">
        <ul v-if="multiple" class="tool-file-upload__grid">
          <li
            v-for="(item, index) in fileList"
            :key="item.id"
            class="tool-file-upload__cell"
            :class="{ 'tool-file-upload__cell--drop': dropTarget === index }"
            draggable="true"
            @click.stop
            @dragstart="onTileDragStart(index, $event)"
            @dragover="onTileDragOver(index, $event)"
            @drop="onTileDrop(index, $event)"
            @dragend="clearDrag"
          >
            <FileCard
              :name="item.name"
              :file="item.file ?? undefined"
              :file-type="item.type ?? undefined"
              :thumbnail-url="thumbnails[item.id]"
              :removable="removable"
              @remove="remove(index)"
            />
          </li>
          <li class="tool-file-upload__cell tool-file-upload__cell--add">
            <span class="tool-file-upload__add">
              <NIcon :size="20" :component="CloudUpload" class="tool-file-upload__add-icon" />
            </span>
            <span class="tool-file-upload__add-name" aria-hidden="true"></span>
          </li>
        </ul>

        <div v-else-if="single" class="tool-file-upload__single" @click.stop>
          <FileCard
            :name="single.name"
            :file="single.file ?? undefined"
            :file-type="single.type ?? undefined"
            :thumbnail-url="thumbnails[single.id]"
            :removable="removable"
            @remove="remove(0)"
          />
        </div>

        <div v-else class="tool-file-upload__body">
          <NIcon :size="26" :component="CloudUpload" class="tool-file-upload__icon" />
          <p class="tool-file-upload__label">{{ t('tool.fileUpload.choose') }}</p>
          <p v-if="accept" class="tool-file-upload__hint">
            {{ t('tool.fileUpload.accepted', { types: accept }) }}
          </p>
        </div>
      </NUploadDragger>
    </NUpload>
  </div>
</template>

<style scoped>
.tool-file-upload {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.tool-file-upload__upload {
  display: block;
  width: 100%;
}

/* naive renders its trigger wrapper inline-block, which would shrink-wrap the
   box to one grid column; the box fills the panel column instead. */
.tool-file-upload__upload :deep(.n-upload-trigger) {
  display: block;
  width: 100%;
}

/* naive-ui's dragger chrome is replaced: the element is only the drop area and
   the click-to-pick trigger, its surface belongs to the shape below. */
.tool-file-upload__zone {
  box-sizing: border-box;
  width: 100% !important;
  padding: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  background: none !important;
}

.tool-file-upload__single {
  width: 100%;
}

.tool-file-upload__body {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xxs);
  width: 100%;
  height: 128px;
  border: 2px dashed var(--color-hairline-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface-soft);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.tool-file-upload__body:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
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

.tool-file-upload__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, 128px);
  gap: var(--spacing-sm);
  align-content: start;
  width: 100%;
}

.tool-file-upload__cell {
  box-sizing: border-box;
  width: 128px;
  min-width: 0;
}

.tool-file-upload__cell--drop {
  border-radius: var(--radius-md);
  outline: 2px dashed var(--color-primary);
  outline-offset: 2px;
}

.tool-file-upload__add {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 128px;
  height: 128px;
  border: 2px dashed var(--color-hairline-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface-soft);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.tool-file-upload__add:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.tool-file-upload__add-icon {
  color: var(--color-text-3);
}

/* Keeps the add tile's row as tall as a tile that carries a filename. */
.tool-file-upload__add-name {
  display: block;
  min-height: 1em;
}

/* A single file fills the box, so its name lines up with the card. */
.tool-file-upload:not(.tool-file-upload--multi) :deep(.file-card__name) {
  text-align: left;
}
</style>
