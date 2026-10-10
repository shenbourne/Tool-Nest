<script setup lang="ts">
import { NIcon } from 'naive-ui';
import {
  File as FileIcon,
  FileMusic,
  FileText,
  FileZip,
  FileCode,
  Photo,
  Table,
  Video,
  X,
} from '@vicons/tabler';
import type { Component } from 'vue';
import { fileCategory, type FileCategory } from '@/utils/file-thumbnail';

const props = defineProps<{
  previewItem: { name: string; file?: File | null; type?: string | null } | null;
  previewText: string | null;
  previewPdfPages: string[];
  previewVideoUrl: string | null;
  previewImageUrl: string | null;
}>();

const emit = defineEmits<{
  close: [];
  backdropClick: [event: MouseEvent];
  keydown: [event: KeyboardEvent];
}>();

const ICON_MAP: Record<FileCategory, Component> = {
  pdf: FileText,
  video: Video,
  audio: FileMusic,
  image: Photo,
  archive: FileZip,
  code: FileCode,
  spreadsheet: Table,
  text: FileText,
  other: FileIcon,
};

function fallbackIcon(file: File | null | undefined) {
  return ICON_MAP[fileCategory(file ?? { name: '', type: '' })];
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="previewItem"
      class="file-preview-overlay"
      @click="emit('backdropClick', $event)"
      @keydown="emit('keydown', $event)"
    >
      <div class="file-preview__content" @click.stop>
        <button type="button" class="file-preview__close" @click="emit('close')">
          <NIcon :size="20" :component="X" />
        </button>

        <img
          v-if="previewImageUrl"
          class="file-preview__image"
          :src="previewImageUrl"
          :alt="previewItem.name"
        />

        <div
          v-else-if="previewPdfPages.length > 0"
          class="file-preview__pdf"
        >
          <img
            v-for="(page, idx) in previewPdfPages"
            :key="idx"
            class="file-preview__pdf-page"
            :src="page"
            :alt="`${previewItem.name} — page ${idx + 1}`"
          />
        </div>

        <video
          v-else-if="previewVideoUrl"
          class="file-preview__video"
          :src="previewVideoUrl"
          controls
        />

        <pre v-else-if="previewText !== null" class="file-preview__text">{{ previewText }}</pre>

        <div v-else class="file-preview__fallback">
          <NIcon :size="96" :component="fallbackIcon(previewItem.file)" />
          <span class="file-preview__fallback-name">{{ previewItem.name }}</span>
        </div>

        <p class="file-preview__filename">{{ previewItem.name }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style>
.file-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  animation: file-preview-fade-in 0.15s ease;
}

@keyframes file-preview-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.file-preview__content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.file-preview__close {
  position: absolute;
  top: -40px;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;
}

.file-preview__close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.file-preview__image {
  max-width: 85vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.file-preview__pdf {
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.file-preview__pdf-page {
  max-width: 85vw;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.file-preview__video {
  max-width: 85vw;
  max-height: 80vh;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.file-preview__text {
  max-width: 80vw;
  max-height: 75vh;
  overflow: auto;
  padding: 24px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 8px;
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.file-preview__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.file-preview__fallback-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.file-preview__filename {
  margin-top: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  max-width: 60vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
