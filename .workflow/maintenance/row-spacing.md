# Result-row spacing maintenance — 2026-10-11

User requested fixing touching result rows and authorized submission to master.

Plan and scope: audit shared text-panel parameter roots, reproduce missing gaps, add vertical spacing, verify representative pages, isolate and merge only this change. No calculation or action changes.

Implementation: ToolTextPanel params now uses flex column and spacing-sm (12px). Base: local master 832d0c9, which includes two existing authorized commits above fetched private/master 742c5e3. Existing dirty worktrees retained.

Acceptance evidence: actual browser geometry changed case-converter's seven gaps from 0px to 12px. Chinese/light desktop 1575x884 screenshots inspected: case-converter eight aligned rows/no overflow; HMAC secret/options separated and selectors remain horizontal; password four visible rows with three 12px gaps/no overflow. Evidence resides in primary checkout .scratch/row-spacing-visual/. Mobile and dark theme NOT RUN.

Review: focused shared-container health review inspected params slot consumers and nested horizontal layouts. No dependencies, abstractions, functionality or unrelated edits added. Isolated component is byte-identical to visually verified primary checkout version. No mirrored CSS unit test; browser geometry supplies meaningful regression evidence. Full test suite/build not repeated for this three-line presentation-only fix.

Publication: master merge is explicitly authorized. Remote master publication was not separately requested; preserve existing local-only master commits.

Isolated verification: node node_modules/vue-tsc/bin/vue-tsc.js --noEmit exit 0; node node_modules/eslint/bin/eslint.js src/components/ToolTextPanel.vue exit 0; git diff --check exit 0. Master concurrently advanced to 16eb4ea; ToolTextPanel unchanged between 832d0c9 and 16eb4ea. Final private fetch failed TLS unexpected EOF; remote publication deferred, local merge remains authorized.

Final integration verification after merging master 16eb4ea: typecheck exit 0; vitest 48 files/346 tests PASS. Final diff against master: shared CSS three lines plus this dedicated record only.
