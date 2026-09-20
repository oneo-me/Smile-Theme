import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { readCatalog } from "./catalog";
import { metadata, output, root, source } from "./config";
import { vscodeTheme } from "./themes";
import { exportSketch } from "./export-sketch";
import { generatePreview } from "./preview";
import { renderPreviewImage } from "./preview-image";

export async function build(destination = output) {
  await exportSketch();
  await compileExtensions(destination);
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
  await mkdir(join(directory, "extension"), { recursive: true });
  for (const path of ["README.md", "README.zh-CN.md", "LICENSE", "extension/icon.png"]) {
    await copyFile(join(root, path), join(directory, path));
  }
  await Bun.write(join(directory, "preview.png"), await renderPreviewImage(assets, source));
  const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
  await Bun.write(join(destination, "vscode/package.json"), json({
    name: metadata.name,
    displayName: metadata.label,
    description: "File and folder icons designed in Sketch, with light mode variants.",
    version: metadata.version,
    publisher: metadata.publisher,
    license: "MIT",
    engines: { vscode: "^1.80.0" },
    categories: ["Themes"],
    icon: "extension/icon.png",
    files: ["icons/**", "icons.json", "extension/icon.png", "preview.png", "README.md", "README.zh-CN.md", "LICENSE"],
    repository: { type: "git", url: metadata.repository },
    contributes: { iconThemes: [{ id: "smile-icons", label: metadata.label, path: "./icons.json" }] },
  }));
  await Bun.write(join(destination, "vscode/icons.json"), json(vscode));
  await generatePreview(assets, destination);
  console.log(`Built ${assets.length} icon assets for VS Code → ${destination}`);
}

if (import.meta.main) await build();
