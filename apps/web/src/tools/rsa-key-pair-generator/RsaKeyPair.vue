<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import { NInputNumber, NInput, NButton, NFormItem, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import * as forge from 'node-forge';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';

const { t } = useI18n();

const keySize = ref(2048);
const publicKey = ref('');
const privateKey = ref('');
const generating = ref(false);
const error = ref('');

let revision = 0;
let disposed = false;
function generate() {
  revision++;
  error.value = '';
  publicKey.value = '';
  privateKey.value = '';
  if (!generating.value) runGeneration();
}
function runGeneration() {
  const current = revision;
  const bits = keySize.value;
  if (!Number.isInteger(bits) || bits < 512 || bits > 4096) {
    generating.value = false;
    return;
  }
  generating.value = true;
  const finish = (err: Error | null, keypair?: forge.pki.rsa.KeyPair) => {
    if (disposed) return;
    if (current !== revision) {
      runGeneration();
      return;
    }
    generating.value = false;
    if (err || !keypair) {
      error.value = err?.message || t('tools.rsaKeyPair.generateFailed');
    } else {
      publicKey.value = forge.pki.publicKeyToPem(keypair.publicKey);
      privateKey.value = forge.pki.privateKeyToPem(keypair.privateKey);
    }
  };
  try {
    forge.pki.rsa.generateKeyPair({ bits }, finish);
  } catch (cause) {
    finish(cause instanceof Error ? cause : new Error(String(cause)));
  }
}
watch(keySize, generate, { immediate: true });
onBeforeUnmount(() => { disposed = true; });
</script>

<template>
  <ToolLayout :tool="tool">
    <div class="rsa-key-pair">
      <div class="rsa-key-pair__keys">
        <ToolTextPanel :input-text="''" :output-text="privateKey" :output-title="t('tools.rsaKeyPair.privateKey')" export-name="private-key.pem" hide-input>
          <template #output>
            <NInput :value="privateKey" readonly type="textarea" :rows="10" class="rsa-key-pair__pem" :input-props="{ id: 'rsaKeyPairGeneratorField2' }" />
          </template>
        </ToolTextPanel>
        <ToolTextPanel :input-text="''" :output-text="publicKey" :output-title="t('tools.rsaKeyPair.publicKey')" export-name="public-key.pem" hide-input>
          <template #output>
            <NInput :value="publicKey" readonly type="textarea" :rows="10" class="rsa-key-pair__pem" :input-props="{ id: 'rsaKeyPairGeneratorField1' }" />
          </template>
        </ToolTextPanel>
      </div>
      <div class="rsa-key-pair__controls">
        <NFormItem :label="t('tools.rsaKeyPair.keySize')" label-placement="left" :show-feedback="false">
          <NInputNumber v-model:value="keySize" :min="512" :max="4096" :step="512" class="rsa-key-pair__size" :input-props="{ id: 'rsaKeyPairGeneratorField0' }" />
        </NFormItem>
        <NButton type="primary" @click="generate" :loading="generating">{{ t('tools.rsaKeyPair.generateKeyPair') }}</NButton>
      </div>
      <NAlert v-if="error" type="error">{{ error }}</NAlert>
    </div>
  </ToolLayout>
</template>

<style scoped>
.rsa-key-pair {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.rsa-key-pair__keys {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--spacing-md);
}

.rsa-key-pair__pem {
  font-family: monospace;
  font-size: 12px;
}

.rsa-key-pair__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xs);
}

.rsa-key-pair__controls > .n-form-item {
  min-width: 0;
}

.rsa-key-pair__size {
  width: 200px;
  max-width: 100%;
}

.rsa-key-pair__controls > .n-button {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .rsa-key-pair__keys {
    grid-template-columns: minmax(0, 1fr);
  }

  .rsa-key-pair__size {
    width: 120px;
  }

  .rsa-key-pair__controls {
    align-items: flex-end;
  }

  .rsa-key-pair__controls > .n-form-item {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "label" "blank";
  }

  .rsa-key-pair__controls :deep(.n-form-item-label) {
    justify-content: start;
    padding: 0 0 4px;
  }
}
</style>
