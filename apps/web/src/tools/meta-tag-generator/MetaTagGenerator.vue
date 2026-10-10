<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSelect, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const tool = useCurrentTool();

const title = ref('');
const description = ref('');
const keywords = ref('');
const ogTitle = ref('');
const ogDescription = ref('');
const ogImage = ref('');
const ogUrl = ref('');
const twitterCard = ref('summary_large_image');
const twitterSite = ref('');
const twitterCreator = ref('');

const twitterCardOptions = [
  { label: 'Summary', value: 'summary' },
  { label: 'Summary Large Image', value: 'summary_large_image' },
  { label: 'App', value: 'app' },
  { label: 'Player', value: 'player' },
];

const metaTags = computed(() => {
  const tags: string[] = [];

  if (title.value) {
    tags.push(`<title>${escapeHtml(title.value)}</title>`);
  }
  if (description.value) {
    tags.push(`<meta name="description" content="${escapeHtml(description.value)}" />`);
  }
  if (keywords.value) {
    tags.push(`<meta name="keywords" content="${escapeHtml(keywords.value)}" />`);
  }

  const effectiveOgTitle = ogTitle.value || title.value;
  const effectiveOgDescription = ogDescription.value || description.value;

  if (effectiveOgTitle) {
    tags.push(`<meta property="og:title" content="${escapeHtml(effectiveOgTitle)}" />`);
  }
  if (effectiveOgDescription) {
    tags.push(`<meta property="og:description" content="${escapeHtml(effectiveOgDescription)}" />`);
  }
  if (ogImage.value) {
    tags.push(`<meta property="og:image" content="${escapeHtml(ogImage.value)}" />`);
  }
  if (ogUrl.value) {
    tags.push(`<meta property="og:url" content="${escapeHtml(ogUrl.value)}" />`);
  }
  if (effectiveOgTitle || effectiveOgDescription || ogImage.value || ogUrl.value) {
    tags.push(`<meta property="og:type" content="website" />`);
  }

  if (twitterCard.value) {
    tags.push(`<meta name="twitter:card" content="${escapeHtml(twitterCard.value)}" />`);
  }
  if (effectiveOgTitle) {
    tags.push(`<meta name="twitter:title" content="${escapeHtml(effectiveOgTitle)}" />`);
  }
  if (effectiveOgDescription) {
    tags.push(`<meta name="twitter:description" content="${escapeHtml(effectiveOgDescription)}" />`);
  }
  if (ogImage.value) {
    tags.push(`<meta name="twitter:image" content="${escapeHtml(ogImage.value)}" />`);
  }
  if (twitterSite.value) {
    tags.push(`<meta name="twitter:site" content="${escapeHtml(twitterSite.value)}" />`);
  }
  if (twitterCreator.value) {
    tags.push(`<meta name="twitter:creator" content="${escapeHtml(twitterCreator.value)}" />`);
  }

  return tags.join('\n');
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel :input-text="''" :output-text="metaTags" :output-title="t('tools.metaTagGenerator.output')" export-name="meta-tags.html" hide-input>
      <template #output>
        <NInput
          :value="metaTags"
          type="textarea"
          readonly
          :rows="10"
          style="font-family: monospace;"
         :input-props="{ id: 'metaTagGeneratorField9' }"/>
      </template>
      <template #params>
        <NSpace vertical :size="12">
          <NInput
            v-model:value="title"
            :placeholder="t('tools.metaTagGenerator.titlePlaceholder')"
           :input-props="{ id: 'metaTagGeneratorField0' }"/>
          <NInput
            v-model:value="description"
            type="textarea"
            :placeholder="t('tools.metaTagGenerator.descriptionPlaceholder')"
            :rows="2"
           :input-props="{ id: 'metaTagGeneratorField1' }"/>
          <NInput
            v-model:value="keywords"
            :placeholder="t('tools.metaTagGenerator.keywordsPlaceholder')"
           :input-props="{ id: 'metaTagGeneratorField2' }"/>
          <NInput
            v-model:value="ogTitle"
            :placeholder="t('tools.metaTagGenerator.ogTitlePlaceholder')"
           :input-props="{ id: 'metaTagGeneratorField3' }"/>
          <NInput
            v-model:value="ogDescription"
            type="textarea"
            :placeholder="t('tools.metaTagGenerator.ogDescriptionPlaceholder')"
            :rows="2"
           :input-props="{ id: 'metaTagGeneratorField4' }"/>
          <NInput
            v-model:value="ogImage"
            :placeholder="t('tools.metaTagGenerator.ogImagePlaceholder')"
           :input-props="{ id: 'metaTagGeneratorField5' }"/>
          <NInput
            v-model:value="ogUrl"
            :placeholder="t('tools.metaTagGenerator.ogUrlPlaceholder')"
           :input-props="{ id: 'metaTagGeneratorField6' }"/>
          <NSelect
            v-model:value="twitterCard"
            :options="twitterCardOptions"
            :placeholder="t('tools.metaTagGenerator.twitterCardPlaceholder')"
            style="min-width: 210px"
          />
          <NInput
            v-model:value="twitterSite"
            :placeholder="t('tools.metaTagGenerator.twitterSitePlaceholder')"
           :input-props="{ id: 'metaTagGeneratorField7' }"/>
          <NInput
            v-model:value="twitterCreator"
            :placeholder="t('tools.metaTagGenerator.twitterCreatorPlaceholder')"
           :input-props="{ id: 'metaTagGeneratorField8' }"/>
        </NSpace>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
