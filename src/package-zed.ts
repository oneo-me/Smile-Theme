import { join } from "node:path";
import { build } from "./build";
import { metadata, output } from "./config";
import { zedExtensionId } from "./zed";

await build();
const archive = join(output, `${zedExtensionId}-${metadata.version}.tar.gz`);
// Zed installs a dev extension from the built directory; the archive mirrors the resources
// the extension registry publishes from a git checkout.
const child = Bun.spawn([
  "tar", "-czf", archive,
  "-C", join(output, "zed"),
  "extension.toml", "icon_themes", "icons", "icon.png",
], { stdout: "inherit", stderr: "inherit" });
process.exitCode = await child.exited;
if (!process.exitCode) console.log(`Packaged Zed extension → ${archive}`);
