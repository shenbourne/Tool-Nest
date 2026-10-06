<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NButton, NCard, NCheckbox, NInput, NSpace, NText } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
import { computeChmodOctalRepresentation, computeChmodSymbolicRepresentation, parseOctalToPermissions, parseSymbolicToPermissions } from './chmod-calculator.service';
import type { Group, Scope } from './chmod-calculator.types';

const { t } = useI18n();
const { copyToClipboard } = useCopy();

const scopes: { scope: Scope; titleKey: string }[] = [
  { scope: 'read', titleKey: 'tools.chmodCalculator.read' },
  { scope: 'write', titleKey: 'tools.chmodCalculator.write' },
  { scope: 'execute', titleKey: 'tools.chmodCalculator.execute' },
];
const groups: { group: Group; titleKey: string }[] = [
  { group: 'owner', titleKey: 'tools.chmodCalculator.owner' },
  { group: 'group', titleKey: 'tools.chmodCalculator.group' },
  { group: 'public', titleKey: 'tools.chmodCalculator.public' },
];

const permissions = ref({
  owner: { read: false, write: false, execute: false },
  group: { read: false, write: false, execute: false },
  public: { read: false, write: false, execute: false },
});

const octalInput = ref(computeChmodOctalRepresentation({ permissions: permissions.value }));
const symbolicInput = ref(computeChmodSymbolicRepresentation({ permissions: permissions.value }));

let isUpdatingFromInput = false;
let isUpdatingFromCheckbox = false;

const octal = computed(() => computeChmodOctalRepresentation({ permissions: permissions.value }));
const symbolic = computed(() => computeChmodSymbolicRepresentation({ permissions: permissions.value }));

watch(permissions, () => {
  if (!isUpdatingFromInput) {
    isUpdatingFromCheckbox = true;
    octalInput.value = octal.value;
    symbolicInput.value = symbolic.value;
    isUpdatingFromCheckbox = false;
  }
}, { deep: true });

watch(octalInput, (newOctal) => {
  if (isUpdatingFromCheckbox) return;
  const parsed = parseOctalToPermissions(newOctal);
  if (parsed) {
    isUpdatingFromInput = true;
    permissions.value = parsed;
    symbolicInput.value = computeChmodSymbolicRepresentation({ permissions: parsed });
    isUpdatingFromInput = false;
  }
});

watch(symbolicInput, (newSymbolic) => {
  if (isUpdatingFromCheckbox) return;
  const parsed = parseSymbolicToPermissions(newSymbolic);
  if (parsed) {
    isUpdatingFromInput = true;
    permissions.value = parsed;
    octalInput.value = computeChmodOctalRepresentation({ permissions: parsed });
    isUpdatingFromInput = false;
  }
});

function copyCommand() {
  copyToClipboard(`chmod ${octal.value} path`);
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="24">
        <table class="permission-table">
          <thead>
            <tr>
              <th />
              <th v-for="{ group, titleKey } in groups" :key="group" class="text-center">
                {{ t(titleKey) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="{ scope, titleKey } of scopes" :key="scope">
              <td class="row-header">{{ t(titleKey) }}</td>
              <td v-for="{ group } in groups" :key="group" class="text-center">
                <NCheckbox v-model:checked="permissions[group][scope]" size="large" />
              </td>
            </tr>
          </tbody>
        </table>

        <div class="result-section">
          <div class="result-row">
            <NText class="result-label">{{ t('tools.chmodCalculator.octal') }}</NText>
            <NInput
              v-model:value="octalInput"
              class="result-input"
              :maxlength="3"
              placeholder="000-777"
            />
          </div>
          <div class="result-row">
            <NText class="result-label">{{ t('tools.chmodCalculator.symbolic') }}</NText>
            <NInput
              v-model:value="symbolicInput"
              class="result-input"
              :maxlength="9"
              placeholder="rwxrwxrwx"
            />
          </div>
        </div>

        <div class="command-section">
          <code class="chmod-command">chmod {{ octal }} path</code>
          <NButton size="small" @click="copyCommand">{{ t('tool.copy') }}</NButton>
        </div>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>

<style scoped>
.permission-table {
  width: 100%;
  border-collapse: collapse;
}

.permission-table th,
.permission-table td {
  padding: 16px;
}

.text-center {
  text-align: center;
}

.row-header {
  font-weight: bold;
  text-align: right;
  max-width: 120px;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-label {
  font-weight: bold;
  min-width: 80px;
}

.result-input {
  flex: 1;
  font-family: monospace;
  font-size: 18px;
}

.result-input :deep(input) {
  font-family: monospace;
  font-size: 18px;
  letter-spacing: 2px;
}

.command-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.03);
}

.chmod-command {
  font-family: monospace;
  font-size: 14px;
}

@media (max-width: 600px) {
  .permission-table th,
  .permission-table td {
    padding: 8px 4px;
  }

  .result-label {
    min-width: 60px;
    font-size: 14px;
  }

  .result-input :deep(input) {
    font-size: 16px;
  }
}
</style>
