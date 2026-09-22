import { join } from "node:path";
import { build } from "./build";
import { metadata, output } from "./config";
import { zedExtensionId } from "./zed";

export async function packageZed(version = metadata.version) {
  const archive = join(output, `${zedExtensionId}-${version}.tar.gz`);
  // Zed installs a dev extension from the built directory; the archive mirrors the resources
  // the extension registry publishes from a git checkout.
  const child = Bun.spawn([
    "tar", "-czf", archive,
    "-C", join(output, "zed"),
    "extension.toml", "icon_themes", "icons", "icon.png",
  ], { stdout: "inherit", stderr: "inherit" });
  const code = await child.exited;
  if (code) throw new Error(`tar exited with ${code}`);
  console.log(`Packaged Zed extension → ${archive}`);
}

if (import.meta.main) {
  await build();
  await packageZed();
}
