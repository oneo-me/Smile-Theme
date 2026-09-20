import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { readCatalog } from "./catalog";
import { metadata, output, root, source } from "./config";
import { vscodeTheme } from "./themes";
import { exportSketch } from "./export-sketch";
import { generatePreview } from "./preview";

export async function build(destination = output) {
  await exportSketch();
  await compileExtensions(destination);
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
  await copyFile(join(root, "LICENSE"), join(directory, "LICENSE"));
  await Bun.write(join(directory, "README.md"), `# Smile Icons\n\nFile and folder icons for VS Code, designed in Sketch. Includes common and light icons. No color themes.\n\nSource and development guide: ${metadata.repository}\n`);
  await copyFile(join(root, "extension/icon.png"), join(destination, "vscode/icon.png"));
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
    icon: "icon.png",
    files: ["icons/**", "icons.json", "icon.png", "README.md", "LICENSE"],
    repository: { type: "git", url: metadata.repository },
    contributes: { iconThemes: [{ id: "smile-icons", label: metadata.label, path: "./icons.json" }] },
  }));
  await Bun.write(join(destination, "vscode/icons.json"), json(vscode));
  await generatePreview(assets, destination);
  console.log(`Built ${assets.length} icon assets for VS Code → ${destination}`);
}

if (import.meta.main) await build();
