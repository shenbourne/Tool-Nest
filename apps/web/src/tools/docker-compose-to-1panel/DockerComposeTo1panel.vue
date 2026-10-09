<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  NAlert,
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NDivider,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NSelect,
  NSpace,
  NTag,
} from 'naive-ui';
import { Download, File, Folder, Photo } from '@vicons/tabler';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import {
  ARCHITECTURE_OPTIONS,
  TAG_OPTIONS,
  TYPE_OPTIONS,
  buildAppZip,
  generateAppDirectory,
  sanitizeAppKey,
  type AppMetadata,
} from './onepanel-app-directory';

const { t } = useI18n();
const tool = useCurrentTool();

const input = ref(`services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    restart: always
    networks:
      - frontend

  api:
    image: node:18
    ports:
      - "3000:3000"
    depends_on:
      - db
    networks:
      - frontend
      - backend

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: example
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - backend

networks:
  frontend:
  backend:

volumes:
  pgdata:
`);

const meta = ref<AppMetadata>({
  key: 'my-app',
  name: 'My App',
  descEn: 'My application',
  descZh: '我的应用',
  tags: ['Tool'],
  type: 'tool',
  version: '1.0.0',
  architectures: ['amd64', 'arm64'],
});

// Manual edits win over the generated content until reset.
const overrides = ref<Record<string, string>>({});
const logoFile = ref<File | null>(null);
const selectedPath = ref('data.yml');
const downloading = ref(false);

const generated = computed(() => generateAppDirectory(input.value, meta.value));

const files = computed(() =>
  generated.value.success
    ? generated.value.files.map(file =>
        overrides.value[file.path] !== undefined ? { ...file, content: overrides.value[file.path] } : file,
      )
    : [],
);

const appKey = computed(() => sanitizeAppKey(meta.value.key));

interface TreeRow {
  depth: number;
  name: string;
  path: string;
  kind: 'dir' | 'file' | 'logo';
}

const treeRows = computed<TreeRow[]>(() => {
  const rows: TreeRow[] = [];
  const seen = new Set<string>();
  const insert = (path: string, kind: 'file' | 'logo') => {
    const parts = path.split('/');
    let prefix = '';
    for (let i = 0; i < parts.length - 1; i++) {
      prefix = prefix ? `${prefix}/${parts[i]}` : parts[i];
      const dirKey = `dir:${prefix}`;
      if (!seen.has(dirKey)) {
        seen.add(dirKey);
        rows.push({ depth: i, name: parts[i], path: dirKey, kind: 'dir' });
      }
    }
    rows.push({ depth: parts.length - 1, name: parts[parts.length - 1], path, kind });
  };
  for (const file of files.value) insert(file.path, 'file');
  if (logoFile.value) insert('logo.png', 'logo');
  return rows;
});

const selectedFile = computed(() => files.value.find(file => file.path === selectedPath.value) ?? null);
const selectedIsLogo = computed(() => logoFile.value !== null && selectedPath.value === 'logo.png');
const selectedIsOverridden = computed(
  () => selectedFile.value !== null && overrides.value[selectedFile.value.path] !== undefined,
);

watch(treeRows, () => {
  const selectable = new Set([...files.value.map(file => file.path), ...(logoFile.value ? ['logo.png'] : [])]);
  if (!selectable.has(selectedPath.value)) {
    selectedPath.value = files.value[0]?.path ?? (logoFile.value ? 'logo.png' : '');
  }
});

const selectedContent = computed({
  get: () => selectedFile.value?.content ?? '',
  set: (value: string) => {
    if (selectedFile.value) {
      overrides.value = { ...overrides.value, [selectedFile.value.path]: value };
    }
  },
});

function resetSelected() {
  if (!selectedFile.value) return;
  const next = { ...overrides.value };
  delete next[selectedFile.value.path];
  overrides.value = next;
}

const logoUrl = ref<string | null>(null);
watch(logoFile, (file, previous) => {
  if (previous && logoUrl.value) URL.revokeObjectURL(logoUrl.value);
  logoUrl.value = file ? URL.createObjectURL(file) : null;
});

const tagSelectOptions = TAG_OPTIONS.map(tag => ({ label: `${tag.zh} (${tag.value})`, value: tag.value }));
const typeSelectOptions = TYPE_OPTIONS.map(value => ({ label: value, value }));
const archSelectOptions = ARCHITECTURE_OPTIONS.map(value => ({ label: value, value }));

async function downloadZip() {
  if (!generated.value.success) return;
  downloading.value = true;
  try {
    const blob = await buildAppZip(
      appKey.value,
      files.value,
      logoFile.value ? { fileName: 'logo.png', blob: logoFile.value } : null,
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${appKey.value}.zip`;
    anchor.click();
    URL.revokeObjectURL(url);
  } finally {
    downloading.value = false;
  }
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCollapse default-expanded-names="compose">
        <NCollapseItem name="compose" :title="t('tools.dockerComposeTo1panel.composeTitle')">
          <NInput
            v-model:value="input"
            type="textarea"
            :placeholder="t('tools.dockerComposeTo1panel.inputPlaceholder')"
            :autosize="{ minRows: 10, maxRows: 30 }"
            style="font-family: monospace;"
            :input-props="{ id: 'dockerComposeTo1panelField0' }"/>
        </NCollapseItem>
      </NCollapse>

      <NAlert v-if="!generated.success && generated.error" type="error">
        {{ generated.error }}
      </NAlert>

      <NCard :title="t('tools.dockerComposeTo1panel.infoTitle')">
        <NForm label-placement="left" label-width="120px">
          <div class="form-grid">
            <NFormItem :label="t('tools.dockerComposeTo1panel.fieldKey')">
              <NInput v-model:value="meta.key" :placeholder="t('tools.dockerComposeTo1panel.fieldKeyPlaceholder')"/>
            </NFormItem>
            <NFormItem :label="t('tools.dockerComposeTo1panel.fieldName')">
              <NInput v-model:value="meta.name"/>
            </NFormItem>
            <NFormItem :label="t('tools.dockerComposeTo1panel.fieldDescZh')">
              <NInput v-model:value="meta.descZh"/>
            </NFormItem>
            <NFormItem :label="t('tools.dockerComposeTo1panel.fieldDescEn')">
              <NInput v-model:value="meta.descEn"/>
            </NFormItem>
            <NFormItem :label="t('tools.dockerComposeTo1panel.fieldTags')">
              <NSelect v-model:value="meta.tags" multiple :options="tagSelectOptions"/>
            </NFormItem>
            <NFormItem :label="t('tools.dockerComposeTo1panel.fieldType')">
              <NSelect v-model:value="meta.type" :options="typeSelectOptions"/>
            </NFormItem>
            <NFormItem :label="t('tools.dockerComposeTo1panel.fieldVersion')">
              <NInput v-model:value="meta.version"/>
            </NFormItem>
            <NFormItem :label="t('tools.dockerComposeTo1panel.fieldArch')">
              <NSelect v-model:value="meta.architectures" multiple :options="archSelectOptions"/>
            </NFormItem>
          </div>
          <NFormItem :label="t('tools.dockerComposeTo1panel.logoTitle')">
            <ToolFileUpload accept=".png,image/png" :multiple="false" @change="(f: File[]) => (logoFile = f[0] ?? null)"/>
          </NFormItem>
          <div style="opacity: 0.65; font-size: 12px; margin-top: -12px;">
            {{ t('tools.dockerComposeTo1panel.logoHint') }}
          </div>
        </NForm>
      </NCard>

      <NCard :title="t('tools.dockerComposeTo1panel.dirTitle')">
        <NAlert type="info" style="margin-bottom: 12px;">
          {{ t('tools.dockerComposeTo1panel.editableNote') }}
        </NAlert>
        <div class="dir-layout">
          <div class="dir-tree">
            <div class="dir-root">
              <NIcon size="16"><Folder /></NIcon>
              <span>{{ appKey }}/</span>
            </div>
            <div
              v-for="row in treeRows"
              :key="row.path"
              class="dir-row"
              :class="{ 'dir-row--active': row.path === selectedPath, 'dir-row--dir': row.kind === 'dir' }"
              :style="{ paddingLeft: `${24 + row.depth * 16}px` }"
              @click="row.kind !== 'dir' && (selectedPath = row.path)">
              <NIcon size="16">
                <Folder v-if="row.kind === 'dir'"/>
                <Photo v-else-if="row.kind === 'logo'"/>
                <File v-else/>
              </NIcon>
              <span>{{ row.name }}</span>
            </div>
            <NTag v-if="!generated.success" type="warning" size="small" style="margin: 8px 0 0 24px;">
              {{ generated.error }}
            </NTag>
          </div>
          <div class="dir-card">
            <template v-if="selectedFile">
              <div class="dir-card-header">
                <code class="dir-card-path">{{ selectedFile.path }}</code>
                <NTag size="small" :type="selectedIsOverridden ? 'warning' : 'default'">
                  {{ t(selectedIsOverridden ? 'tools.dockerComposeTo1panel.badgeEdited' : 'tools.dockerComposeTo1panel.badgeAuto') }}
                </NTag>
                <NButton v-if="selectedIsOverridden" size="tiny" quaternary @click="resetSelected">
                  {{ t('tools.dockerComposeTo1panel.resetFile') }}
                </NButton>
              </div>
              <NInput
                v-model:value="selectedContent"
                type="textarea"
                :autosize="{ minRows: 14, maxRows: 30 }"
                style="font-family: monospace;"/>
            </template>
            <template v-else-if="selectedIsLogo && logoUrl">
              <div class="dir-card-header">
                <code class="dir-card-path">logo.png</code>
              </div>
              <img :src="logoUrl" alt="logo" style="max-width: 200px; max-height: 200px;"/>
            </template>
            <div v-else style="opacity: 0.6;">—</div>
          </div>
        </div>
      </NCard>

      <NButton
        type="primary"
        size="large"
        :disabled="!generated.success"
        :loading="downloading"
        @click="downloadZip">
        <template #icon>
          <NIcon><Download /></NIcon>
        </template>
        {{ t('tools.dockerComposeTo1panel.downloadZip', { name: `${appKey}.zip` }) }}
      </NButton>

      <NDivider />

      <NCard :title="t('common.about')">
        <div style="opacity: 0.8; line-height: 1.6;">
          {{ t('tools.dockerComposeTo1panel.aboutIntro') }}
          <ul style="margin-top: 8px;">
            <i18n-t keypath="tools.dockerComposeTo1panel.addsVersionField" tag="li">
              <template #field><code>version</code></template>
            </i18n-t>
            <i18n-t keypath="tools.dockerComposeTo1panel.addsAppNameLabels" tag="li">
              <template #field><code>com.1panel.appName</code></template>
            </i18n-t>
            <i18n-t keypath="tools.dockerComposeTo1panel.setsRestartPolicy" tag="li">
              <template #field><code>restart: always</code></template>
            </i18n-t>
            <li>{{ t('tools.dockerComposeTo1panel.convertsNetworks') }}</li>
            <li>{{ t('tools.dockerComposeTo1panel.addsNetworkNames') }}</li>
            <i18n-t keypath="tools.dockerComposeTo1panel.parametrizesPorts" tag="li">
              <template #field><code>${PANEL_APP_PORT_HTTP}</code></template>
            </i18n-t>
          </ul>
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  column-gap: 16px;
}

.dir-layout {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.dir-tree {
  min-width: 220px;
  flex: 0 0 240px;
}

.dir-root,
.dir-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
}

.dir-row {
  cursor: pointer;
}

.dir-row:hover {
  background-color: rgba(128, 128, 128, 0.12);
}

.dir-row--active {
  background-color: rgba(128, 128, 128, 0.2);
}

.dir-row--dir {
  opacity: 0.75;
  cursor: default;
}

.dir-card {
  flex: 1;
  min-width: 320px;
}

.dir-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.dir-card-path {
  font-size: 13px;
}
</style>
