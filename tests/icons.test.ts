import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { copyFile, mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { unzipSync, strFromU8 } from "fflate";
import { associations, parseAsset, readCatalog, validateCatalog } from "../src/catalog";
import { compileExtensions } from "../src/build";
import { root, source } from "../src/config";
import { exportPlan } from "../src/export-sketch";
import { vscodeTheme } from "../src/themes";
import { generatePreview } from "../src/preview";

const assets = (paths: string[]) => paths.map(parseAsset);
const basic = ["default/file.png", "default/folder.png"];

describe("resource naming and validation", () => {
  test("splits aliases, preserving dots and hidden filenames", () => {
    expect(parseAsset("extensions/png jpg jpeg.png").names).toEqual(["png", "jpg", "jpeg"]);
    expect(parseAsset("files/webpack.config.js.svg").names).toEqual(["webpack.config.js"]);
    expect(parseAsset("folders/.git_expanded.png").names).toEqual([".git_expanded"]);
  });
  test("rejects invalid layout, traversal, formats and default names", () => {
    for (const path of ["other/file.png", "default/unknown.png", "files/../file.png", "files/light/../x.png", "extensions/.js.png", "files/x.jpg", "files/.png"]) {
      expect(() => parseAsset(path)).toThrow();
    }
  });
  test("rejects exact duplicates and case conflicts between different assets", () => {
    for (const duplicate of [["extensions/js ts.png", "extensions/js.png"], ["files/README.svg", "files/readme.png"], ["files/license license.png"], ["files/README readme.svg", "files/readme.png"]]) {
      expect(() => validateCatalog(assets([...basic, ...duplicate]))).toThrow("Duplicate");
    }
  });
  test("allows explicit case aliases within one exported asset", () => {
    const a = assets([...basic, "files/license license.txt LICENSE.png"]);
    validateCatalog(a);
    expect(associations(a, false).files).toEqual({
      license: "files/license license.txt LICENSE.png",
      "license.txt": "files/license license.txt LICENSE.png",
      LICENSE: "files/license license.txt LICENSE.png",
    });
  });
  test("requires defaults and a common fallback for light assets", () => {
    expect(() => validateCatalog(assets(["default/file.png"]))).toThrow("Missing");
    expect(() => validateCatalog(assets([...basic, "languages/light/java.png"]))).toThrow("fallback");
  });
  test("overrides individual aliases and retains other common icons", () => {
    const a = assets([...basic, "extensions/js jsx.png", "extensions/light/js.png"]);
    validateCatalog(a);
    expect(associations(a, true).extensions).toEqual({ js: "extensions/light/js.png", jsx: "extensions/js jsx.png" });
    expect(associations(a, false).extensions.js).toBe("extensions/js jsx.png");
  });
  test("rejects Git LFS pointers before packaging broken icons", async () => {
    const directory = await mkdtemp(join(tmpdir(), "smile-lfs-test-"));
    try {
      await Bun.write(join(directory, "default/file.png"), "version https://git-lfs.github.com/spec/v1\noid sha256:missing\nsize 42\n");
      await copyFile(join(source, "default/folder.png"), join(directory, "default/folder.png"));
      await expect(readCatalog(directory)).rejects.toThrow("git lfs pull");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe("VS Code theme", () => {
  test("VS Code folds path aliases before light overrides, independent of alias order", () => {
    for (const names of ["license LICENSE", "LICENSE license"]) {
      const a = assets([...basic, `files/${names}.png`, "files/light/license.png",
        "folders/src SRC.png", "folders/light/src.png", "extensions/txt TXT.png", "extensions/light/txt.png"]);
      validateCatalog(a);
      const vscode = vscodeTheme(a);
      expect(vscode.fileNames).toEqual({ license: `files/${names}.png` });
      expect(vscode.light.fileNames).toEqual({ license: "files/light/license.png" });
      expect(vscode.light.folderNames).toEqual({ src: "folders/light/src.png" });
      expect(vscode.light.folderNamesExpanded).toEqual(vscode.light.folderNames);
      expect(vscode.light.fileExtensions).toEqual({ txt: "extensions/light/txt.png" });
    }
  });
  test("VS Code light mode replaces all supported categories", () => {
    const a = assets([...basic, "default/light/file.png", "default/project.png", "default/project_expanded.png",
      "languages/bat shellscript.png", "languages/light/bat shellscript.png", "languages/typescript.png",
      "extensions/hs lhs.png", "extensions/light/hs lhs.png", "files/yarn.lock.png", "files/light/yarn.lock.png",
      "folders/.git.png", "folders/.git_expanded.png", "folders/light/.git_expanded.png"]);
    validateCatalog(a);
    const t = vscodeTheme(a);
    expect(t.rootFolderExpanded).toBe("default/project_expanded.png");
    expect(t.light.file).toBe("default/light/file.png");
    expect(t.light.languageIds.shellscript).toBe("languages/light/bat shellscript.png");
    expect(t.light.languageIds.typescript).toBe(t.languageIds.typescript);
    expect(t.light.fileExtensions.hs).toBe("extensions/light/hs lhs.png");
    expect(t.light.fileNames["yarn.lock"]).toBe("files/light/yarn.lock.png");
    expect(t.light.folderNamesExpanded[".git"]).toBe("folders/light/.git_expanded.png");
    expect(t.light.folderNames[".git"]).toBe("folders/.git.png");
  });
  test("folder expansion falls back to the named closed icon", () => {
    const a = assets([...basic, "folders/src.png", "folders/light/src.png"]);
    expect(vscodeTheme(a).light.folderNamesExpanded.src).toBe("folders/light/src.png");
  });
});

describe("real project integration", () => {
  let destination: string;
  beforeAll(async () => {
    destination = await mkdtemp(join(tmpdir(), "smile-test-"));
    await compileExtensions(destination);
  });
  afterAll(async () => { await rm(destination, { recursive: true, force: true }); });

  test("Sketch export plan exactly matches the checked-in icon paths", async () => {
    const zip = unzipSync(new Uint8Array(await Bun.file(join(root, "design.sketch")).arrayBuffer()), {
      filter: file => /^pages\/[^/]+\.json$/.test(file.name),
    });
    const plan = exportPlan(Object.values(zip).map(bytes => JSON.parse(strFromU8(bytes))));
    expect(plan.map(item => item.path).sort()).toEqual((await readCatalog(source)).map(asset => asset.path).sort());
  });

  test("preview samples cover every icon association and both appearances", async () => {
    const directory = join(destination, "preview");
    const catalog = await readCatalog(source);
    const workspace = await Bun.file(join(directory, "smile-icons.code-workspace")).json();
    const support = await Bun.file(join(directory, "language-support/package.json")).json();
    expect(workspace.settings["workbench.iconTheme"]).toBe("smile-icons");
    expect(workspace.settings["files.exclude"]["**/.git"]).toBe(false);
    const exists = async (path: string) => expect(await Bun.file(join(directory, path)).exists(), path).toBe(true);
    await exists("defaults/unmatched.smile-preview-default");
    await exists("defaults/ordinary-folder/child.smile-preview-default");
    for (const asset of catalog) {
      for (const name of asset.names) {
        if (asset.category === "extensions") await exists(`extensions/sample.${name.toLowerCase()}`);
        if (asset.category === "files") await exists(`files/${name.toLowerCase()}`);
        if (asset.category === "folders") await exists(`folders/${name.toLowerCase().replace(/_expanded$/, "")}/child.smile-preview-default`);
        if (asset.category === "languages") {
          const filename = `language-${name}.smile-preview`;
          await exists(`languages/${filename}`);
          expect(workspace.settings["files.associations"][filename]).toBe(name);
          expect(support.contributes.languages).toContainEqual({ id: name, filenames: [filename] });
        }
      }
    }
    expect(workspace.folders.map((folder: { path: string }) => folder.path)).toEqual(["defaults", "extensions", "files", "folders", "languages"]);
    for (const folder of workspace.folders) {
      expect((await stat(join(directory, folder.path))).isDirectory()).toBe(true);
    }
  });

  test("preview regeneration removes stale samples", async () => {
    const directory = await mkdtemp(join(tmpdir(), "smile-preview-"));
    try {
      await generatePreview(assets([...basic, "extensions/old.png"]), directory);
      await generatePreview(assets([...basic, "extensions/new.png"]), directory);
      expect(await Bun.file(join(directory, "preview/extensions/sample.old")).exists()).toBe(false);
      expect(await Bun.file(join(directory, "preview/extensions/sample.new")).exists()).toBe(true);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("Sketch exports a single layer with case aliases to one resource", () => {
    const layer = (name: string) => ({ name, do_objectID: name.replace(/[^a-zA-Z0-9]/g, "-"), exportOptions: { exportFormats: [{}] } });
    const plan = exportPlan([
      { name: "默认图标 | extension/icons/default", do_objectID: "defaults", layers: [layer("file"), layer("folder")] },
      { name: "文件图标 | extension/icons/files", do_objectID: "files", layers: [layer("license license.txt LICENSE")] },
    ]);
    expect(plan.filter(item => item.path.startsWith("files/"))).toEqual([
      { id: "license-license-txt-LICENSE", path: "files/license license.txt LICENSE.png" },
    ]);
  });

  test("VS Code manifest contains only icons and every reference resolves inside the extension", async () => {
    expect((await readdir(destination)).sort()).toEqual(["preview", "vscode"]);
    const dir = join(destination, "vscode");
    const manifest = await Bun.file(join(dir, "package.json")).json();
    expect(`${manifest.publisher}.${manifest.name}`).toBe("oneo.smile-theme");
    expect(Object.keys(manifest.contributes)).toEqual(["iconThemes"]);
    const themePath = resolve(dir, manifest.contributes.iconThemes[0].path);
    const theme = await Bun.file(themePath).json();
    for (const definition of Object.values(theme.iconDefinitions) as { iconPath: string }[]) {
      const iconPath = resolve(dirname(themePath), definition.iconPath);
      expect(iconPath.startsWith(dir + "/")).toBe(true);
      expect(await Bun.file(iconPath).exists()).toBe(true);
    }
    function checkReferences(value: unknown) {
      if (typeof value === "string") expect(theme.iconDefinitions[value]).toBeDefined();
      else for (const nested of Object.values(value as object)) checkReferences(nested);
    }
    const { iconDefinitions, ...associations } = theme;
    checkReferences(associations);
    for (const id of ["powershell", "diff", "shaderlab", "shellscript", "bat"]) {
      expect(theme.light.languageIds[id]).toContain("/light/");
    }
    expect(theme.fileNames["yarn.lock"]).toBeDefined();
  });

  test("extension includes complete bilingual guides and every local documentation asset", async () => {
    const directory = join(destination, "vscode");
    const manifest = await Bun.file(join(directory, "package.json")).json();
    for (const path of ["README.md", "README.zh-CN.md", "CHANGELOG.md", "LICENSE", "extension/icon.png"]) {
      expect(await Bun.file(join(directory, path)).bytes()).toEqual(await Bun.file(join(root, path)).bytes());
      expect(manifest.files).toContain(path);
    }
    expect(await Bun.file(join(directory, manifest.icon)).exists()).toBe(true);
    expect(manifest.files).toContain("preview.png");
    for (const path of ["README.md", "README.zh-CN.md", "CHANGELOG.md"]) {
      const text = await Bun.file(join(directory, path)).text();
      for (const match of text.matchAll(/\]\(([^)]+)\)|src="([^"]+)"/g)) {
        const target = (match[1] ?? match[2])!;
        if (/^https?:\/\//.test(target) || target.startsWith("#")) continue;
        expect(await Bun.file(join(directory, target)).exists(), `${path}: ${target}`).toBe(true);
      }
    }
  });
});
