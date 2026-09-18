<script setup lang="ts">
import { ref, computed } from 'vue';
import { NButton, NCard, NCheckbox, NSpace, NText } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import { computeChmodOctalRepresentation, computeChmodSymbolicRepresentation } from './chmod-calculator.service';
import type { Group, Scope } from './chmod-calculator.types';

const { t } = useI18n();

const scopes: { scope: Scope; title: string }[] = [
  { scope: 'read', title: 'Read (4)' },
  { scope: 'write', title: 'Write (2)' },
  { scope: 'execute', title: 'Execute (1)' },
];
const groups: Group[] = ['owner', 'group', 'public'];

const permissions = ref({
  owner: { read: false, write: false, execute: false },
  group: { read: false, write: false, execute: false },
  public: { read: false, write: false, execute: false },
});

const octal = computed(() => computeChmodOctalRepresentation({ permissions: permissions.value }));
const symbolic = computed(() => computeChmodSymbolicRepresentation({ permissions: permissions.value }));

function copyCommand() {
  navigator.clipboard.writeText(`chmod ${octal.value} path`);
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
              <th v-for="group in groups" :key="group" class="text-center">
                {{ group === 'owner' ? 'Owner (u)' : group === 'group' ? 'Group (g)' : 'Public (o)' }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="{ scope, title } of scopes" :key="scope">
              <td class="row-header">{{ title }}</td>
              <td v-for="group in groups" :key="group" class="text-center">
                <NCheckbox v-model:checked="permissions[group][scope]" size="large" />
              </td>
            </tr>
          </tbody>
        </table>

        <div class="result-section">
          <div class="result-octal">{{ octal }}</div>
          <div class="result-symbolic">{{ symbolic }}</div>
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
  text-align: center;
}

.result-octal {
  font-size: 48px;
  font-family: monospace;
  font-weight: bold;
  color: var(--primary-color, #2080f0);
  margin: 12px 0 4px;
}

.result-symbolic {
  font-size: 24px;
  font-family: monospace;
  color: var(--text-color-2, #666);
  margin-bottom: 12px;
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

  .result-octal {
    font-size: 36px;
  }
}
</style>
