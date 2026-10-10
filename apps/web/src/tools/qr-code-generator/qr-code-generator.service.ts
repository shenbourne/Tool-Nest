import { ref, watch, type Ref } from 'vue';
import QRCode from 'qrcode';

export function useQrCode(text: Ref<string>, options?: { foreground?: Ref<string>; background?: Ref<string>; errorCorrectionLevel?: Ref<string> }) {
  const dataUrl = ref('');
  // Distinguish a generation failure (e.g. text too long) from an empty input.
  const error = ref(false);
  // Sequence guard: a slower earlier render must never overwrite the result of
  // a newer input.
  let sequence = 0;

  watch(
    () => [
      text.value,
      options?.foreground?.value,
      options?.background?.value,
      options?.errorCorrectionLevel?.value,
    ],
    async () => {
      const current = ++sequence;
      if (!text.value.trim()) {
        dataUrl.value = '';
        error.value = false;
        return;
      }
      try {
        const url = await QRCode.toDataURL(text.value.trim(), {
          color: {
            dark: options?.foreground?.value || '#000000',
            light: options?.background?.value || '#ffffff',
          },
          errorCorrectionLevel: (options?.errorCorrectionLevel?.value || 'M') as 'L' | 'M' | 'Q' | 'H',
          width: 512,
        });
        if (current !== sequence) return;
        dataUrl.value = url;
        error.value = false;
      } catch {
        if (current !== sequence) return;
        dataUrl.value = '';
        error.value = true;
      }
    },
    { immediate: true, deep: true },
  );

  return { dataUrl, error };
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) return;
  const mime = match[1];
  const b64 = match[2];
  const byteChars = atob(b64);
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
