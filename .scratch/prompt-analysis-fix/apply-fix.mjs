import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = "d:/Users/Projects/SelfProgram/tool-nest/.scratch/prompt-analysis-fix";
const staging = path.join(root, "staging");
const target = "C:/Users/ROG/.qoder/skills/prompt-analysis";

// 1. Back up the original SKILL.md once.
const backup = path.join(staging, "original-SKILL.md");
if (!existsSync(backup)) {
  copyFileSync(path.join(target, "SKILL.md"), backup);
  console.log("backup ->", backup);
}

// 2. Copy the new SKILL.md and reference files into the user-level skill.
copyFileSync(path.join(staging, "SKILL.md"), path.join(target, "SKILL.md"));
const refTarget = path.join(target, "references");
mkdirSync(refTarget, { recursive: true });
const copied = [];
for (const name of readdirSync(path.join(staging, "references"))) {
  copyFileSync(path.join(staging, "references", name), path.join(refTarget, name));
  copied.push(name);
}

// 3. Report line counts (count of \n-terminated lines).
const lineCount = (file) => {
  const text = readFileSync(file, "utf8");
  return text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
};
console.log("SKILL.md lines:", lineCount(path.join(target, "SKILL.md")));
console.log("backup lines:", lineCount(backup));
for (const name of copied) {
  console.log(`references/${name} lines:`, lineCount(path.join(refTarget, name)));
}
