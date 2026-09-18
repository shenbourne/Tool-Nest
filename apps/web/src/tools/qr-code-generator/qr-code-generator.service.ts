import { ref, watch, type Ref } from 'vue';
import QRCode from 'qrcode';

export function useQrCode(text: Ref<string>, options?: { foreground?: Ref<string>; background?: Ref<string>; errorCorrectionLevel?: Ref<string> }) {
  const dataUrl = ref('');

  watch(
    () => [
      text.value,
      options?.foreground?.value,
      options?.background?.value,
      options?.errorCorrectionLevel?.value,
    ],
    async () => {
      if (!text.value.trim()) {
        dataUrl.value = '';
        return;
      }
      try {
        dataUrl.value = await QRCode.toDataURL(text.value.trim(), {
          color: {
            dark: options?.foreground?.value || '#000000',
            light: options?.background?.value || '#ffffff',
          },
          errorCorrectionLevel: (options?.errorCorrectionLevel?.value || 'M') as 'L' | 'M' | 'Q' | 'H',
          width: 512,
        });
      } catch {
        dataUrl.value = '';
      }
    },
    { immediate: true, deep: true },
  );

  return { dataUrl };
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
