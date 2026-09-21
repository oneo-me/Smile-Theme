import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { root } from "./config";

// Polling detects Sketch's atomic saves without watching generated assets.
async function fingerprint() {
  const entries: string[] = [];
  async function visit(path: string): Promise<void> {
    try {
      const info = await stat(path);
      if (info.isDirectory()) {
        for (const name of (await readdir(path)).sort()) {
          if (name !== ".DS_Store" && name !== "Thumbs.db") await visit(join(path, name));
        }
      } else {
        entries.push(`${path}:${info.ino}:${info.size}:${info.mtimeMs}:${info.ctimeMs}`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  for (const path of [join(root, "design.sketch"), join(root, "extension/icon.png"), join(root, "src"), join(root, "package.json"), join(root, "LICENSE"), join(root, "README.md"), join(root, "README.zh-CN.md"), join(root, "CHANGELOG.md")]) {
    await visit(path);
  }
  return entries.join("\n");
}

async function rebuild() {
  const child = Bun.spawn([process.execPath, "src/build.ts"], { cwd: root, stdout: "inherit", stderr: "inherit" });
  if (await child.exited !== 0) console.error("Build failed; fix the error and save to retry.");
}

let previous = await fingerprint();
await rebuild();
console.log("Watching design.sketch and build sources. Reload the VS Code development window after changes.");
while (true) {
  await Bun.sleep(500);
  const current = await fingerprint();
  if (current !== previous) {
    previous = current;
    await rebuild();
  }
}
