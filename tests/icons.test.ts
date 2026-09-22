import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { copyFile, mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { associations, parseAsset, readCatalog, validateCatalog } from "../src/catalog";
import { compileExtensions } from "../src/build";
import { root, source } from "../src/config";
import { vscodeTheme } from "../src/themes";
import { generatePreview } from "../src/preview";

const assets = (paths: string[]) => paths.map(parseAsset);
const basic = ["default/file.svg", "default/folder.svg"];

describe("resource naming and validation", () => {
  test("splits aliases, preserving dots and hidden filenames", () => {
    expect(parseAsset("extensions/png jpg jpeg.svg").names).toEqual(["png", "jpg", "jpeg"]);
    expect(parseAsset("files/webpack.config.js.svg").names).toEqual(["webpack.config.js"]);
    expect(parseAsset("folders/.git_expanded.svg").names).toEqual([".git_expanded"]);
  });
  test("rejects invalid layout, traversal, formats and default names", () => {
    for (const path of ["other/file.svg", "default/unknown.svg", "files/../file.svg", "files/dark/../x.svg", "extensions/.js.svg", "files/x.jpg", "files/.svg", "languages/light/java.svg"]) {
      expect(() => parseAsset(path)).toThrow();
    }
  });
  test("rejects exact duplicates and case conflicts between different assets", () => {
    for (const duplicate of [["extensions/js ts.svg", "extensions/js.svg"], ["files/README.svg", "files/readme.svg"], ["files/license license.svg"], ["files/README readme.svg", "files/readme.svg"]]) {
      expect(() => validateCatalog(assets([...basic, ...duplicate]))).toThrow("Duplicate");
    }
  });
  test("allows explicit case aliases within one exported asset", () => {
    const a = assets([...basic, "files/license license.txt LICENSE.svg"]);
    validateCatalog(a);
    expect(associations(a, false).files).toEqual({
      license: "files/license license.txt LICENSE.svg",
      "license.txt": "files/license license.txt LICENSE.svg",
      LICENSE: "files/license license.txt LICENSE.svg",
    });
  });
  test("requires defaults and a common fallback for dark assets", () => {
    expect(() => validateCatalog(assets(["default/file.svg"]))).toThrow("Missing");
    expect(() => validateCatalog(assets([...basic, "languages/dark/java.svg"]))).toThrow("fallback");
  });
  test("overrides individual aliases and retains other common icons", () => {
    const a = assets([...basic, "extensions/js jsx.svg", "extensions/dark/js.svg"]);
    validateCatalog(a);
    expect(associations(a, true).extensions).toEqual({ js: "extensions/dark/js.svg", jsx: "extensions/js jsx.svg" });
    expect(associations(a, false).extensions.js).toBe("extensions/js jsx.svg");
  });
  test("rejects Git LFS pointers before packaging broken icons", async () => {
    const directory = await mkdtemp(join(tmpdir(), "smile-lfs-test-"));
    try {
      await Bun.write(join(directory, "default/file.svg"), "version https://git-lfs.github.com/spec/v1\noid sha256:missing\nsize 42\n");
      await copyFile(join(source, "default/folder.svg"), join(directory, "default/folder.svg"));
      await expect(readCatalog(directory)).rejects.toThrow("git lfs pull");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe("VS Code theme", () => {
  test("VS Code folds path aliases before dark overrides, independent of alias order", () => {
    for (const names of ["license LICENSE", "LICENSE license"]) {
      const a = assets([...basic, `files/${names}.svg`, "files/dark/license.svg",
        "folders/src SRC.svg", "folders/dark/src.svg", "extensions/txt TXT.svg", "extensions/dark/txt.svg"]);
      validateCatalog(a);
      const vscode = vscodeTheme(a);
      expect(vscode.fileNames).toEqual({ license: "files/dark/license.svg" });
      expect(vscode.folderNames).toEqual({ src: "folders/dark/src.svg" });
      expect(vscode.fileExtensions).toEqual({ txt: "extensions/dark/txt.svg" });
      expect(vscode.light.fileNames).toEqual({ license: `files/${names}.svg` });
      expect(vscode.light.folderNames).toEqual({ src: "folders/src SRC.svg" });
      expect(vscode.light.folderNamesExpanded).toEqual(vscode.light.folderNames);
      expect(vscode.light.fileExtensions).toEqual({ txt: "extensions/txt TXT.svg" });
    }
  });
  test("VS Code dark mode replaces all supported categories", () => {
    const a = assets([...basic, "default/dark/file.svg", "default/project.svg", "default/project_expanded.svg",
      "languages/bat shellscript.svg", "languages/dark/bat shellscript.svg", "languages/typescript.svg",
      "extensions/hs lhs.svg", "extensions/dark/hs lhs.svg", "files/yarn.lock.svg", "files/dark/yarn.lock.svg",
      "folders/.git.svg", "folders/.git_expanded.svg", "folders/dark/.git_expanded.svg"]);
    validateCatalog(a);
    const t = vscodeTheme(a);
    expect(t.rootFolderExpanded).toBe("default/project_expanded.svg");
    expect(t.file).toBe("default/dark/file.svg");
    expect(t.languageIds.shellscript).toBe("languages/dark/bat shellscript.svg");
    expect(t.languageIds.typescript).toBe("languages/typescript.svg");
    expect(t.fileExtensions.hs).toBe("extensions/dark/hs lhs.svg");
    expect(t.fileNames["yarn.lock"]).toBe("files/dark/yarn.lock.svg");
    expect(t.folderNamesExpanded[".git"]).toBe("folders/dark/.git_expanded.svg");
    expect(t.folderNames[".git"]).toBe("folders/.git.svg");
    expect(t.light.file).toBe("default/file.svg");
    expect(t.light.languageIds.shellscript).toBe("languages/bat shellscript.svg");
    expect(t.light.languageIds.typescript).toBe(t.languageIds.typescript);
    expect(t.light.fileExtensions.hs).toBe("extensions/hs lhs.svg");
    expect(t.light.fileNames["yarn.lock"]).toBe("files/yarn.lock.svg");
    expect(t.light.folderNamesExpanded[".git"]).toBe("folders/.git_expanded.svg");
  });
  test("folder expansion falls back to the named closed icon", () => {
    const a = assets([...basic, "folders/src.svg", "folders/dark/src.svg"]);
    expect(vscodeTheme(a).folderNamesExpanded.src).toBe("folders/dark/src.svg");
  });
});

describe("real project integration", () => {
  let destination: string;
  beforeAll(async () => {
    destination = await mkdtemp(join(tmpdir(), "smile-test-"));
    await compileExtensions(destination);
  });
  afterAll(async () => { await rm(destination, { recursive: true, force: true }); });

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
      await generatePreview(assets([...basic, "extensions/old.svg"]), directory);
      await generatePreview(assets([...basic, "extensions/new.svg"]), directory);
      expect(await Bun.file(join(directory, "preview/extensions/sample.old")).exists()).toBe(false);
      expect(await Bun.file(join(directory, "preview/extensions/sample.new")).exists()).toBe(true);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
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
      expect(iconPath.endsWith(".svg")).toBe(true);
      expect(await Bun.file(iconPath).exists()).toBe(true);
    }
    function checkReferences(value: unknown) {
      if (typeof value === "string") expect(theme.iconDefinitions[value]).toBeDefined();
      else for (const nested of Object.values(value as object)) checkReferences(nested);
    }
    const { iconDefinitions, ...associations } = theme;
    checkReferences(associations);
    for (const id of ["powershell", "diff", "shaderlab", "shellscript", "bat"]) {
      expect(theme.languageIds[id]).toContain("/dark/");
      expect(theme.light.languageIds[id]).not.toContain("/dark/");
    }
    expect(theme.fileNames["yarn.lock"]).toBeDefined();
  });

  test("extension includes complete bilingual guides and every local documentation asset", async () => {
    const directory = join(destination, "vscode");
    const manifest = await Bun.file(join(directory, "package.json")).json();
    for (const path of ["README.md", "README.zh-CN.md", "CHANGELOG.md", "LICENSE"]) {
      expect(await Bun.file(join(directory, path)).text()).toBe((await Bun.file(join(root, path)).text()).replaceAll('src="icon.svg"', 'src="icon.png"'));
      expect(manifest.files).toContain(path);
    }
    expect(await Bun.file(join(directory, manifest.icon)).exists()).toBe(true);
    expect(manifest.files).toContain("preview.png");
    expect(manifest.files).toContain("icon.png");
    expect(await Bun.file(join(root, "icon.png")).exists()).toBe(true);
    for (const path of ["README.md", "README.zh-CN.md"]) {
      expect(await Bun.file(join(directory, path)).text()).not.toMatch(/src="[^"]+\.svg"/);
    }
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
