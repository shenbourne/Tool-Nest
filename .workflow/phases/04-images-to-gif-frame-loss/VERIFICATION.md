# Engineering verification

- Branch: `fix/images-to-gif-frame-loss`, cut from local `master` `fcbc617`
- Commits: `72d5e70` (fix + unit tests), plus the phase records in a second commit — both recorded in `STATE.md`
- Date: 2026-09-29
- Review: self-review of every diff line, plus one independently dispatched reviewer agent (recorded below).

## Remote synchronization

`git fetch origin` **fails on this machine** — `fatal: unable to access 'https://git.shenb.net/shenbourne/tool-nest.git/': TLS connect error: error:0A000126:SSL routines::unexpected eof while reading` — and fails identically with `git -c http.sslVerify=false`, so the connection is being cut rather than rejected on certificate grounds. The base could therefore not be re-confirmed against the real remote; the comparison below uses the local remote-tracking ref only. No push was attempted, and none is claimed. This is a recorded blocker, not a synchronization.

| Item | Value |
| --- | --- |
| Remote / base | `origin` (`https://git.shenb.net/shenbourne/tool-nest.git`) / `master` |
| Local base | `master` = `origin/master` = `fcbc617` (stale: last successful fetch predates this session) |
| Ahead / behind (`git rev-list --left-right --count master...origin/master`) | `0 0` |
| Branch upstream | none (new branch) |
| Divergence | unknown — fetch unreachable |

## Defect mechanism

Reproduced and measured against the app's own core artifact, downloaded from the CDN URL the app uses (`@ffmpeg/core@0.12.6`, 32,129,114 bytes) and executed in Node. For three images at `d = 0.5`:

- The demuxer is **not** at fault and the earlier guess that the core ignores the list's trailing `duration` is **wrong**: the core reports `Input #0, concat … Duration: 00:00:01.50` and `3 packets read … 3 frames decoded`.
- Frames enter the `fps` filter at `pts_time` 0, 0.52, 1. So the `fps` filter's end-of-stream boundary — computed from the terminal frame's own timestamp plus the image2 demuxer's default 1/25 s frame duration, not from the container duration — lands on the output slot that carries the third image: `Read frame with in pts 25, out pts 2` → `EOF is at pts 2` → `Dropping frame with pts 2` → `2 frames encoded`.
- Result: the last image never appears. Measured centre colours of the pre-fix output: red, green — blue gone.
- FFmpeg 9.0.2 does not drop that frame, which is why the CLI disagreed with the browser in phase 03 and why the CLI alone cannot verify this class of change.

Fix: repeat the final entry in the list (the dropped boundary frame becomes the harmless duplicate), plus `-frames:v <n>` so a core that honours the terminal duration cannot emit the duplicate. Verified to agree exactly on 5.1.4 and 9.0.2.

## Gates

`bash scripts/verify` (default commands), run after the final code change:

| Check | Command | Result | Evidence / limitation |
| --- | --- | --- | --- |
| Tests | `pnpm test` | PASS | web 165 passed / 28 files (158 existing + 7 new `image-slideshow.test.ts`); server 52 passed / 8 files |
| Lint | `pnpm lint` | FAIL (pre-existing baseline, unchanged) | `apps/web`: 231 errors / 88 files of 532 — identical to the baseline recorded in `STATE.md` before this phase. Nothing in this change contributed one: the two new files report 0 problems, and `ImagesToGif.vue` reports the same 5 `no-undef` errors on `ref` before and after, with an identical rule set (only the line numbers shift by one for the added import) |
| Type check | `pnpm type-check` | PASS | `packages/shared`, `apps/server` (`tsc --noEmit`), `apps/web` (`vue-tsc --noEmit`) |
| Build | `pnpm build` | PASS | `apps/web` built in 23.59 s, `apps/server` done |

Differential lint commands (the repo's prescribed method, since `pnpm lint` runs `--fix` and fails repo-wide):

```
cd apps/web
npx eslint --stdin --stdin-filename src/tools/images-to-gif/ImagesToGif.vue < src/tools/images-to-gif/ImagesToGif.vue   # 5 problems
git show HEAD:./src/tools/images-to-gif/ImagesToGif.vue | npx eslint --stdin --stdin-filename src/tools/images-to-gif/ImagesToGif.vue   # 5 problems
npx eslint --stdin --stdin-filename src/utils/image-slideshow.ts < src/utils/image-slideshow.ts          # clean
npx eslint --stdin --stdin-filename src/utils/image-slideshow.test.ts < src/utils/image-slideshow.test.ts # clean
```

## Behavioural verification

`.scratch/frame-loss-evidence/verify-cross-version.mjs` (untracked) builds the command with the **real** helper module and runs it on both implementations:

- 20 cases (`n = 1,2,3,5` × `d = 0.1,0.5,1,3,10`): the core and the CLI 9.0.2 agree on frame count, per-frame delays, total duration and per-frame centre colours, except the single-image stored delay noted below.
- Regression guard on the cap: with the duplicate entry but **no** `-frames:v`, CLI 9.0.2 emits 4 frames (blue twice, 2.000 s) while the core emits 3 — the cap is what makes the two versions produce the same file, and it is what makes the fix safe across a core upgrade.
- The old command shape, run in the real browser against the already-loaded shared core, reproduces the reported defect: 2 frames, delays `[0.5,0.5]`, colours red, green.

Browser runs (Chrome DevTools MCP, dev server `:3000`, `/images-to-gif`): fixtures injected into the live `<input type="file">` from the dev server's `/@fs/` route, duration set through the actual `NInputNumber`, result read from `setupState.resultData` and decoded with `ImageDecoder`. Results are in `ACCEPTANCE.md` (A-5, A-6, A-7).

## Independent review

A general-purpose reviewer agent was given the diff (`apps/web/src/utils/image-slideshow.ts`, `image-slideshow.test.ts`, the `ImagesToGif.vue` change), the measured evidence, and the intent, and asked to judge the mechanism, hunt for edge-case holes, check for duplicated logic, assess whether the tests assert real contracts, and look for regression risk in the component. Outcome:

| Finding | Disposition |
| --- | --- |
| The repeat-plus-cap pair is sound and jointly necessary: neither alone works (5.1.4 without the repeat → `n-1` frames; 9.0.2 without the cap → `n+1`), and no simpler formulation is clearly safer (`-t n × d` reintroduces sensitivity to the same boundary rounding) | Confirmed, no action |
| Empty `inputNames` would emit `file 'undefined'` and `-frames:v 0` | Not reachable — the component returns early when `files.length` is 0 (`ImagesToGif.vue:39`). Guarding an impossible input would be speculative; kept as is |
| `frameDuration` may be `null` when the `NInputNumber` is cleared → `duration null` / `fps=Infinity` | Pre-existing, unchanged by this refactor and excluded by the phase boundary; recorded as a follow-up in `STATE.md` |
| The concat `file '…'` pattern is duplicated with `VideoMerge.vue` / `AudioMerge.vue` | Intentional, and those tools merge self-describing media rather than stills with synthetic durations; the phase boundary records why sharing a builder is not worthwhile here |
| The test pins the literal `fps=0.3333333333333333` | Kept deliberately: it pins the phase-03 contract that the rate is `1/d` and not rounded, which is exactly the arithmetic a future refactor could quietly reintroduce |
| Component regression surface clean — the `generation` overwrite guard, the error path, `runFFmpegTask`'s temp-file cleanup and the download path are untouched; only construction was extracted | Confirmed, no action |

Verdict from the review: safe to merge as delivered, with the `null` `frameDuration` case carried as a pre-existing follow-up rather than folded into this fix.

## Known limitations and residual issues

1. **A one-frame GIF stores the encoder's default hold, not `d`.** Not fixable through any command shape on FFmpeg 5.1.4 (tested: bare still input, `-framerate 1/d`, and concat with `-t`, `-frames:v` or neither — all store 0.1 s), and 5.1.4's `gif` encoder exposes no `delay` option. Invisible in practice (a one-frame GIF never advances). Recorded in `ACCEPTANCE.md`.
2. **`frameDuration` can be `null` when the user clears the number field** (`NInputNumber`), which would emit `duration null` and `fps=Infinity`. Pre-existing, unrelated to this defect, and not made worse by this change — out of scope for this phase and left as a follow-up.
3. **The remote could not be fetched** (see above), so the branch is local-only and the base could not be re-confirmed.
4. `.scratch/frame-loss-evidence/` is untracked scratch evidence (fixtures, the real core artifact, the harness scripts and raw logs), deliberately not committed, following the `.scratch/speed-evidence/` precedent from phase 03.
