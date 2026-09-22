import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Asset } from "./catalog";
import { readCatalog } from "./catalog";
import { metadata, output, root, source } from "./config";
import { vscodeTheme } from "./themes";
import { generatePreview } from "./preview";
import { renderPreviewImage } from "./preview-image";
import { unreferencedIcons, zedExtensionId, zedExtensionManifest, zedIconThemeFamily, zedIconThemePath } from "./zed";

const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";

export async function build(destination = output) {
  const assets = await compileExtensions(destination);
  await compileZedExtension(assets, destination);
  await copyFile(join(destination, "vscode/preview.png"), join(root, "preview.png"));
}

export async function compileExtensions(destination = output) {
  const assets = await readCatalog(source);
  const vscode = vscodeTheme(assets);
  const directory = join(destination, "vscode");
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
  for (const asset of assets) {
    const to = join(directory, "icons", asset.path);
    await mkdir(dirname(to), { recursive: true });
    await copyFile(join(source, asset.path), to);
  }
  for (const path of ["README.md", "README.zh-CN.md", "CHANGELOG.md", "LICENSE", "icon.png"]) {
    await copyFile(join(root, path), join(directory, path));
  }
  await Bun.write(join(directory, "preview.png"), await renderPreviewImage(assets, source));
  await Bun.write(join(destination, "vscode/package.json"), json({
    name: metadata.name,
    displayName: metadata.label,
    description: "SVG file and folder icons, with light mode variants.",
    version: metadata.version,
    publisher: metadata.publisher,
    license: "MIT",
    engines: { vscode: "^1.80.0" },
    categories: ["Themes"],
    icon: "icon.png",
    files: ["icons/**", "icons.json", "icon.png", "preview.png", "README.md", "README.zh-CN.md", "CHANGELOG.md", "LICENSE"],
    repository: { type: "git", url: metadata.repository },
    contributes: { iconThemes: [{ id: "smile-icons", label: metadata.label, path: "./icons.json" }] },
  }));
  await Bun.write(join(destination, "vscode/icons.json"), json(vscode));
  await generatePreview(assets, destination);
  console.log(`Built ${assets.length} icon assets for VS Code → ${destination}`);
  return assets;
}

export async function compileZedExtension(assets: Asset[], destination = output) {
  const directory = join(destination, "zed");
  await rm(directory, { recursive: true, force: true });
  await mkdir(join(directory, "icon_themes"), { recursive: true });
  await copyFile(join(root, "icon.png"), join(directory, "icon.png"));
  for (const asset of assets) {
    const to = join(directory, "icons", asset.path);
    await mkdir(dirname(to), { recursive: true });
    await copyFile(join(source, asset.path), to);
  }
  const family = zedIconThemeFamily(assets, metadata.label, metadata.author);
  await Bun.write(join(directory, zedIconThemePath), json(family));
  await Bun.write(join(directory, "extension.toml"), zedExtensionManifest({
    id: zedExtensionId,
    name: metadata.label,
    version: metadata.version,
    author: metadata.author,
    repository: metadata.repository,
  }, zedIconThemePath));
  const unreferenced = [...new Set(family.themes.flatMap(theme => unreferencedIcons(theme)))];
  console.log(`Built ${assets.length} icon assets for Zed → ${directory} (${unreferenced.length} unreferenced)`);
  for (const icon of unreferenced) console.log(`  not reachable from a file association: ${icon}`);
}

if (import.meta.main) await build();
