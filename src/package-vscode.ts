import { join } from "node:path";
import { build } from "./build";
import { metadata, output, root } from "./config";

await build();
const child = Bun.spawn([
  process.execPath, join(root, "node_modules/@vscode/vsce/vsce"),
  "package", "--no-dependencies",
  "--out", join(output, `smile-theme-${metadata.version}.vsix`),
], { cwd: join(output, "vscode"), stdout: "inherit", stderr: "inherit" });
process.exitCode = await child.exited;
