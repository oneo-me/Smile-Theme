import { join } from "node:path";
import { build } from "./build";
import { metadata, output, root } from "./config";

export async function packageVscode(version = metadata.version) {
  const archive = join(output, `smile-theme-${version}.vsix`);
  const child = Bun.spawn([
    process.execPath, join(root, "node_modules/@vscode/vsce/vsce"),
    "package", "--no-dependencies",
    "--out", archive,
  ], { cwd: join(output, "vscode"), stdout: "inherit", stderr: "inherit" });
  const code = await child.exited;
  if (code) throw new Error(`vsce package exited with ${code}`);
  console.log(`Packaged VS Code extension → ${archive}`);
}

if (import.meta.main) {
  await build();
  await packageVscode();
}
