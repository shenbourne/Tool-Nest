import { ref, watch, type Ref } from 'vue';
import QRCode from 'qrcode';

export type WifiEncryption = 'nopass' | 'WPA' | 'WEP' | 'WPA2-EAP';

function escapeWifiField(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

export function buildWifiQrString(params: {
  ssid: string;
  encryption: WifiEncryption;
  password?: string;
  hidden?: boolean;
}): string {
  const ssid = escapeWifiField(params.ssid);
  const password = params.encryption === 'nopass' ? '' : escapeWifiField(params.password || '');
  const hidden = params.hidden ? 'H:true' : '';
  return `WIFI:S:${ssid};T:${params.encryption};P:${password};${hidden};`;
}

export function useWifiQrCode(params: {
  ssid: Ref<string>;
  encryption: Ref<WifiEncryption>;
  password: Ref<string>;
  hidden: Ref<boolean>;
  foreground?: Ref<string>;
  background?: Ref<string>;
}) {
  const dataUrl = ref('');
  const qrString = ref('');

  watch(
    () => [
      params.ssid.value,
      params.encryption.value,
      params.password.value,
      params.hidden.value,
      params.foreground?.value,
      params.background?.value,
    ],
    async () => {
      if (!params.ssid.value.trim()) {
        dataUrl.value = '';
        qrString.value = '';
        return;
      }
      const str = buildWifiQrString({
        ssid: params.ssid.value,
        encryption: params.encryption.value,
        password: params.password.value,
        hidden: params.hidden.value,
      });
      qrString.value = str;
      try {
        dataUrl.value = await QRCode.toDataURL(str, {
          color: {
            dark: params.foreground?.value || '#000000',
            light: params.background?.value || '#ffffff',
          },
          errorCorrectionLevel: 'M',
          width: 512,
        });
      } catch {
        dataUrl.value = '';
      }
    },
    { immediate: true, deep: true },
  );

  return { dataUrl, qrString };
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
