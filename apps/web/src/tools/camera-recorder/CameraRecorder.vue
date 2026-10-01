<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue';
import { NCard, NSpace, NButton, NAlert, NSelect, NDivider, NPopconfirm } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useCopy } from '@/composables/useCopy';
import FileCard from '@/components/FileCard.vue';

const { t } = useI18n();
const tool = useCurrentTool();
const { copyFileToClipboard } = useCopy();

const isSupported = computed(() => !!(navigator.mediaDevices?.getUserMedia) && !!window.MediaRecorder);

const permissionGranted = ref(false);
const permissionError = ref('');
const stream = ref<MediaStream | null>(null);
const videoRef = ref<HTMLVideoElement>();

const cameras = ref<{ label: string; value: string }[]>([]);
const microphones = ref<{ label: string; value: string }[]>([]);
const selectedCamera = ref<string>('');
const selectedMic = ref<string>('');

const recordingState = ref<'stopped' | 'recording' | 'paused'>('stopped');
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordedChunks = ref<Blob[]>([]);
const recordings = ref<{ url: string; type: string; createdAt: Date; file: File }[]>([]);

const isRecordingSupported = computed(() => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm'));

async function requestPermission() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    permissionGranted.value = true;
    permissionError.value = '';
    s.getTracks().forEach(track => track.stop());
    await enumerateDevices();
    startStream();
  } catch (e) {
    permissionError.value = e instanceof Error ? e.message : t('tools.cameraRecorder.permissionDenied');
  }
}

async function enumerateDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  cameras.value = devices
    .filter(d => d.kind === 'videoinput')
    .map((d, i) => ({ label: d.label || t('tools.cameraRecorder.cameraLabel', { n: i + 1 }), value: d.deviceId }));
  microphones.value = devices
    .filter(d => d.kind === 'audioinput')
    .map((d, i) => ({ label: d.label || t('tools.cameraRecorder.microphoneLabel', { n: i + 1 }), value: d.deviceId }));

  if (cameras.value.length && !selectedCamera.value) {
    selectedCamera.value = cameras.value[0].value;
  }
  if (microphones.value.length && !selectedMic.value) {
    selectedMic.value = microphones.value[0].value;
  }
}

async function startStream() {
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop());
  }

  const constraints: MediaStreamConstraints = {
    video: selectedCamera.value ? { deviceId: selectedCamera.value } : true,
    audio: selectedMic.value ? { deviceId: selectedMic.value } : true,
  };

  try {
    stream.value = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value;
    }
  } catch (e) {
    permissionError.value = e instanceof Error ? e.message : t('tools.cameraRecorder.failedToStart');
  }
}

watch([selectedCamera, selectedMic], () => {
  if (permissionGranted.value) {
    startStream();
  }
});

function startRecording() {
  if (!stream.value || !isRecordingSupported.value) return;

  recordedChunks.value = [];
  mediaRecorder.value = new MediaRecorder(stream.value, { mimeType: 'video/webm' });

  mediaRecorder.value.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.value.push(e.data);
  };

  mediaRecorder.value.onstop = () => {
    const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
    // When unmounting, stopRecording() fires this handler after teardown has
    // begun — that recording would leak, so release it immediately.
    if (unmounted) { URL.revokeObjectURL(url); return; }
    recordings.value.unshift({ url, type: 'video', createdAt: new Date(), file });
    recordedChunks.value = [];
  };

  mediaRecorder.value.start();
  recordingState.value = 'recording';
}

function stopRecording() {
  if (mediaRecorder.value && recordingState.value !== 'stopped') {
    mediaRecorder.value.stop();
    recordingState.value = 'stopped';
  }
}

function pauseRecording() {
  if (mediaRecorder.value && recordingState.value === 'recording') {
    mediaRecorder.value.pause();
    recordingState.value = 'paused';
  }
}

function resumeRecording() {
  if (mediaRecorder.value && recordingState.value === 'paused') {
    mediaRecorder.value.resume();
    recordingState.value = 'recording';
  }
}

function downloadRecording(item: { url: string; type: string; createdAt: Date; file: File }) {
  const a = document.createElement('a');
  a.href = item.url;
  a.download = `${item.type}-${item.createdAt.getTime()}.webm`;
  a.click();
}

async function copyRecording(item: { url: string; type: string; createdAt: Date; file: File }) {
  await copyFileToClipboard(item.file);
}

function removeRecording(index: number) {
  const item = recordings.value[index];
  URL.revokeObjectURL(item.url);
  recordings.value.splice(index, 1);
}

let unmounted = false;

onBeforeUnmount(() => {
  unmounted = true;
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop());
  }
  stopRecording();
  for (const item of recordings.value) URL.revokeObjectURL(item.url);
  recordings.value = [];
});
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NAlert v-if="!isSupported" type="warning">
        {{ t('tools.cameraRecorder.unsupportedBrowser') }}
      </NAlert>

      <NCard v-else-if="!permissionGranted" :title="t('tools.cameraRecorder.permissionTitle')">
        <div style="text-align: center;">
          <p>{{ t('tools.cameraRecorder.permissionHint') }}</p>
          <NAlert v-if="permissionError" type="error" style="margin: 12px 0;">
            {{ permissionError }}
          </NAlert>
          <NButton type="primary" @click="requestPermission" style="margin-top: 12px;">
            {{ t('tools.cameraRecorder.grantPermission') }}
          </NButton>
        </div>
      </NCard>

      <NCard v-else :title="t('tools.cameraRecorder.cameraPreview')">
        <NSpace vertical :size="12">
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <NSelect
              v-model:value="selectedCamera"
              :options="cameras"
              :placeholder="t('tools.cameraRecorder.selectCamera')"
              style="min-width: 200px; flex: 1;"
            />
            <NSelect
              v-if="microphones.length > 0"
              v-model:value="selectedMic"
              :options="microphones"
              :placeholder="t('tools.cameraRecorder.selectMicrophone')"
              style="min-width: 200px; flex: 1;"
            />
          </div>

          <video
            ref="videoRef"
            autoplay
            playsinline
            muted
            style="width: 100%; max-height: 480px; background: #000; border-radius: 8px;"
          />

          <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
            <NButton v-if="recordingState === 'stopped'" type="primary" @click="startRecording" :disabled="!isRecordingSupported">
              {{ t('tools.cameraRecorder.startRecording') }}
            </NButton>
            <NButton v-if="recordingState === 'recording'" @click="pauseRecording">
              {{ t('tools.cameraRecorder.pause') }}
            </NButton>
            <NButton v-if="recordingState === 'paused'" @click="resumeRecording">
              {{ t('tools.cameraRecorder.resume') }}
            </NButton>
            <NButton v-if="recordingState !== 'stopped'" type="error" @click="stopRecording">
              {{ t('common.stop') }}
            </NButton>
          </div>

          <div v-if="!isRecordingSupported" style="text-align: center; opacity: 0.6; font-style: italic;">
            {{ t('tools.cameraRecorder.recordingUnsupported') }}
          </div>
        </NSpace>
      </NCard>

      <NCard v-if="recordings.length > 0" :title="t('tools.cameraRecorder.recordings')">
        <NSpace vertical :size="12">
          <div v-for="(item, index) in recordings" :key="index" style="border: 1px solid var(--color-hairline); border-radius: 8px; padding: 12px;">
            <video :src="item.url" controls style="width: 100%; max-height: 300px;" />
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <FileCard :name="`video-${item.createdAt.getTime()}.webm`" :file="item.file" file-type="video/webm" />
              <NSpace>
                <NButton size="small" @click="downloadRecording(item)">{{ t('tool.download') }}</NButton>
                <NButton size="small" @click="copyRecording(item)">{{ t('tool.copyFile') }}</NButton>
                <NPopconfirm @positive-click="removeRecording(index)">
                  <template #trigger>
                    <NButton size="small">{{ t('tool.clear') }}</NButton>
                  </template>
                  {{ t('tools.cameraRecorder.confirmDelete') }}
                </NPopconfirm>
              </NSpace>
            </div>
          </div>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
