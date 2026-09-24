<script setup lang="ts">
import { NCard, NSpace, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

interface GitCommand {
  command: string;
  description: string;
}

const sections: { title: string; commands: GitCommand[] }[] = [
  {
    title: 'Configuration',
    commands: [
      { command: 'git config --global user.name "[name]"', description: 'Set the name associated with your commits' },
      { command: 'git config --global user.email "[email]"', description: 'Set the email associated with your commits' },
    ],
  },
  {
    title: 'Get Started',
    commands: [
      { command: 'git init', description: 'Create a git repository' },
      { command: 'git clone [url]', description: 'Clone an existing git repository' },
    ],
  },
  {
    title: 'Snapshot',
    commands: [
      { command: 'git status', description: 'Show the status of files in the working directory and staging area' },
      { command: 'git add [file]', description: 'Stage a file for commit' },
      { command: 'git add .', description: 'Stage all changes for commit' },
      { command: 'git commit -am "[message]"', description: 'Commit all staged changes with a message' },
      { command: 'git diff', description: 'Show unstaged changes' },
      { command: 'git diff --staged', description: 'Show staged changes' },
    ],
  },
  {
    title: 'Branch & Merge',
    commands: [
      { command: 'git branch', description: 'List all local branches' },
      { command: 'git branch [branch-name]', description: 'Create a new branch' },
      { command: 'git checkout [branch-name]', description: 'Switch to a branch' },
      { command: 'git checkout -b [branch-name]', description: 'Create and switch to a new branch' },
      { command: 'git merge [branch]', description: 'Merge a branch into the current branch' },
      { command: 'git branch -d [branch]', description: 'Delete a branch' },
      { command: 'git branch -m master main', description: 'Rename the local master branch to main' },
    ],
  },
  {
    title: 'Remote',
    commands: [
      { command: 'git remote add [alias] [url]', description: 'Add a remote repository' },
      { command: 'git fetch [remote]', description: 'Fetch from a remote' },
      { command: 'git pull [remote] [branch]', description: 'Pull from a remote branch' },
      { command: 'git push [remote] [branch]', description: 'Push to a remote branch' },
    ],
  },
  {
    title: 'Undo',
    commands: [
      { command: 'git commit --amend', description: 'Change last commit message' },
      { command: 'git commit --amend --no-edit', description: 'Add modifications to last commit without changing message' },
      { command: 'git reset HEAD~1', description: 'Undo most recent commit and keep changes' },
      { command: 'git reset HEAD~N', description: 'Undo the N most recent commits and keep changes' },
      { command: 'git reset HEAD~1 --hard', description: 'Undo most recent commit and discard changes' },
      { command: 'git fetch origin && git reset --hard origin/[branch]', description: 'Reset branch to remote state' },
      { command: 'git revert [commit]', description: 'Create a new commit that undoes a previous commit' },
    ],
  },
  {
    title: 'Stash',
    commands: [
      { command: 'git stash', description: 'Temporarily save uncommitted changes' },
      { command: 'git stash pop', description: 'Restore the most recently stashed changes' },
      { command: 'git stash list', description: 'List all stashed changes' },
      { command: 'git stash drop', description: 'Discard the most recently stashed changes' },
    ],
  },
  {
    title: 'Log & History',
    commands: [
      { command: 'git log', description: 'View commit history' },
      { command: 'git log --oneline', description: 'View compact commit history' },
      { command: 'git log --graph', description: 'View commit history as a graph' },
    ],
  },
];

function copyCommand(command: string) {
  navigator.clipboard.writeText(command);
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
