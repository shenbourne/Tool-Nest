import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const cli = "C:/Users/ROG/.qoder-cn/plugins/cache/qoder-bundler/better-harness/scripts/better-harness.mjs";
const label = process.argv[2] ?? "before";
const outDir = "d:/Users/Projects/SelfProgram/tool-nest/.scratch/prompt-analysis-fix";
mkdirSync(outDir, { recursive: true });

const result = spawnSync(process.execPath, [
  cli, "coding-agent-practices", "asset-baseline", "qoder",
  "--workspace", "d:/Users/Projects/SelfProgram/tool-nest",
  "--language", "zh-CN", "--json",
], { encoding: "buffer", maxBuffer: 128 * 1024 * 1024 });

if (result.error) throw result.error;
writeFileSync(path.join(outDir, `baseline-${label}.json`), result.stdout);
if (result.stderr?.length) {
  writeFileSync(path.join(outDir, `baseline-${label}.stderr.txt`), result.stderr);
}
console.log("exit", result.status, "bytes", result.stdout.length, "label", label);
