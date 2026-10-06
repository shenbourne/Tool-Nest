<script setup lang="ts">
import { computed } from 'vue';
import { NCard, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';

const { t } = useI18n();
const { copyToClipboard } = useCopy();

interface GitCommand {
  command: string;
  description: string;
}

const sections = computed<{ title: string; commands: GitCommand[] }[]>(() => [
  {
    title: t('tools.gitMemo.sections.configuration'),
    commands: [
      { command: 'git config --global user.name "[name]"', description: t('tools.gitMemo.commands.configUserName') },
      { command: 'git config --global user.email "[email]"', description: t('tools.gitMemo.commands.configUserEmail') },
    ],
  },
  {
    title: t('tools.gitMemo.sections.getStarted'),
    commands: [
      { command: 'git init', description: t('tools.gitMemo.commands.init') },
      { command: 'git clone [url]', description: t('tools.gitMemo.commands.clone') },
    ],
  },
  {
    title: t('tools.gitMemo.sections.snapshot'),
    commands: [
      { command: 'git status', description: t('tools.gitMemo.commands.status') },
      { command: 'git add [file]', description: t('tools.gitMemo.commands.addFile') },
      { command: 'git add .', description: t('tools.gitMemo.commands.addAll') },
      { command: 'git commit -am "[message]"', description: t('tools.gitMemo.commands.commitAll') },
      { command: 'git diff', description: t('tools.gitMemo.commands.diff') },
      { command: 'git diff --staged', description: t('tools.gitMemo.commands.diffStaged') },
    ],
  },
  {
    title: t('tools.gitMemo.sections.branchMerge'),
    commands: [
      { command: 'git branch', description: t('tools.gitMemo.commands.branchList') },
      { command: 'git branch [branch-name]', description: t('tools.gitMemo.commands.branchCreate') },
      { command: 'git checkout [branch-name]', description: t('tools.gitMemo.commands.checkout') },
      { command: 'git checkout -b [branch-name]', description: t('tools.gitMemo.commands.checkoutNew') },
      { command: 'git merge [branch]', description: t('tools.gitMemo.commands.merge') },
      { command: 'git branch -d [branch]', description: t('tools.gitMemo.commands.branchDelete') },
      { command: 'git branch -m master main', description: t('tools.gitMemo.commands.branchRename') },
    ],
  },
  {
    title: t('tools.gitMemo.sections.remote'),
    commands: [
      { command: 'git remote add [alias] [url]', description: t('tools.gitMemo.commands.remoteAdd') },
      { command: 'git fetch [remote]', description: t('tools.gitMemo.commands.fetch') },
      { command: 'git pull [remote] [branch]', description: t('tools.gitMemo.commands.pull') },
      { command: 'git push [remote] [branch]', description: t('tools.gitMemo.commands.push') },
    ],
  },
  {
    title: t('tools.gitMemo.sections.undo'),
    commands: [
      { command: 'git commit --amend', description: t('tools.gitMemo.commands.amendMessage') },
      { command: 'git commit --amend --no-edit', description: t('tools.gitMemo.commands.amendNoEdit') },
      { command: 'git reset HEAD~1', description: t('tools.gitMemo.commands.resetLast') },
      { command: 'git reset HEAD~N', description: t('tools.gitMemo.commands.resetN') },
      { command: 'git reset HEAD~1 --hard', description: t('tools.gitMemo.commands.resetLastHard') },
      { command: 'git fetch origin && git reset --hard origin/[branch]', description: t('tools.gitMemo.commands.resetToRemote') },
      { command: 'git revert [commit]', description: t('tools.gitMemo.commands.revert') },
    ],
  },
  {
    title: t('tools.gitMemo.sections.stash'),
    commands: [
      { command: 'git stash', description: t('tools.gitMemo.commands.stash') },
      { command: 'git stash pop', description: t('tools.gitMemo.commands.stashPop') },
      { command: 'git stash list', description: t('tools.gitMemo.commands.stashList') },
      { command: 'git stash drop', description: t('tools.gitMemo.commands.stashDrop') },
    ],
  },
  {
    title: t('tools.gitMemo.sections.logHistory'),
    commands: [
      { command: 'git log', description: t('tools.gitMemo.commands.log') },
      { command: 'git log --oneline', description: t('tools.gitMemo.commands.logOneline') },
      { command: 'git log --graph', description: t('tools.gitMemo.commands.logGraph') },
    ],
  },
]);

function copyCommand(command: string) {
  copyToClipboard(command);
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard
        v-for="section in sections"
        :key="section.title"
        :title="section.title"
        size="small"
      >
        <div class="command-list">
          <div
            v-for="cmd in section.commands"
            :key="cmd.command"
            class="command-row"
            @click="copyCommand(cmd.command)"
          >
            <code class="command-text">{{ cmd.command }}</code>
            <span class="command-desc">{{ cmd.description }}</span>
          </div>
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>

<style scoped>
.command-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.command-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.command-row:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.command-text {
  font-family: monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
}

.command-desc {
  font-size: 12px;
  color: var(--color-text-3);
}

:deep(.n-card-header) {
  padding-bottom: 8px !important;
}

:deep(.n-card__content) {
  padding-top: 4px !important;
}
</style>
