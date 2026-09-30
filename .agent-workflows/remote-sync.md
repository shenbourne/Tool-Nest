# Remote repository synchronization

Use this at the start of development and again after development, immediately before pushing completed work. Determine the intended remote (usually `origin`), remote base branch, current branch, and upstream from the repository configuration; do not assume `main` exists or choose a different remote without evidence. Never use `git pull` blindly, reset away work, or force-push.

## Before development

1. Inspect `git status --short --branch`, `git remote -v`, `git branch -vv`, and recent commits. Preserve local and untracked changes.
2. Run `git fetch <remote> --prune`. Fetch updates remote-tracking refs; it does not alter working files. If fetch fails, stop before claiming the local base is current and record the cause.
3. Compare the local base with `<remote>/<base>` using `git rev-list --left-right --count <local-base>...<remote>/<base>` and inspect the differing commits (`git log --oneline --left-right ...`). Compare the feature branch with its upstream the same way if one exists. Verify the intended base and branch are the ones being compared.
4. For a new phase, create its branch/worktree from the fetched remote base (for example, `git switch -c feature/phase-01-foundation <remote>/<base>`). For an existing branch, integrate relevant remote updates deliberately by merge or rebase as appropriate for its published history and team policy; resolve conflicts and rerun affected checks. Do not rewrite a shared branch. If the choice affects other contributors, record the blocker or seek direction.
5. Record remote, base SHA, branch upstream, ahead/behind counts, and any unresolved divergence in STATE.md before coding.

## After development

1. Commit completed work after review and verification. Do not include unrelated edits or secrets.
2. Fetch the remote again. Compare both the remote base and the feature upstream, if present. If the base or feature branch advanced, reconcile safely; inspect the new changes and rerun checks affected by integration. If unresolved divergence or conflicts remain, do not push or claim the branch is current.
3. Push only the intended feature branch: `git push -u <remote> HEAD:refs/heads/<feature-branch>` for its first push, or `git push <remote> HEAD:refs/heads/<feature-branch>` thereafter. Do not push directly to the protected base or use force flags. A normal push rejection means fetch, compare, reconcile, and verify again.
4. Confirm the remote branch points to the intended commit (for example, `git ls-remote --heads <remote> <feature-branch>` compared with `git rev-parse HEAD`). Record the remote branch and commit in STATE.md and report any failure honestly. A later remote change can still occur after this check; repeat the comparison before a subsequent merge.

If no remote, network, or authorization is available, record the exact limitation and leave a resumable next action. Remote synchronization does not itself authorize merging to the base branch.
