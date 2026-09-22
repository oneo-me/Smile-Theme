import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { type Asset, parseAsset, readCatalog } from "../src/catalog";
import { compileZedExtension } from "../src/build";
import { source } from "../src/config";
import { unreferencedIcons, zedIconThemeFamily, zedIconThemePath, zedSchema } from "../src/zed";

const assets = (paths: string[]) => paths.map(parseAsset);
const basic = ["default/file.svg", "default/folder.svg", "default/folder_expanded.svg"];
const family = (paths: string[]) => zedIconThemeFamily(assets([...basic, ...paths]), "Smile Icons", "ONEO");

describe("Zed icon theme", () => {
  test("pairs a dark and a light theme into one family", () => {
    expect(family([])).toEqual({
      $schema: zedSchema,
      name: "Smile Icons",
      author: "ONEO",
      themes: [
        expect.objectContaining({ name: "Smile Icons Dark", appearance: "dark" }),
        expect.objectContaining({ name: "Smile Icons Light", appearance: "light" }),
      ],
    });
  });

  test("dark replaces the icons with a dark variant, light keeps the common ones", () => {
    const [dark, light] = family(["default/dark/file.svg", "languages/java.svg", "languages/dark/java.svg"]).themes!;
    expect(dark!.file_icons.default!.path).toBe("./icons/default/dark/file.svg");
    expect(light!.file_icons.default!.path).toBe("./icons/default/file.svg");
    expect(dark!.file_suffixes.java).toBe("languages/java");
    expect(light!.file_suffixes.java).toBe("languages/java");
    expect(dark!.file_icons["languages/java"]!.path).toBe("./icons/languages/dark/java.svg");
    expect(light!.file_icons["languages/java"]!.path).toBe("./icons/languages/java.svg");
  });

  test("every alias of an asset resolves to it", () => {
    const [dark] = family(["extensions/kt kts.svg", "extensions/dark/kt kts.svg"]).themes!;
    for (const suffix of ["kt", "kts"]) {
      expect(dark!.file_suffixes[suffix]).toBe(`extensions/${suffix}`);
      expect(dark!.file_icons[`extensions/${suffix}`]!.path).toBe("./icons/extensions/dark/kt kts.svg");
    }
  });

  test("file stems keep the exact file name", () => {
    const [dark] = family(["files/Cargo.lock Cargo.toml.svg", "files/.env .env.local.svg"]).themes!;
    expect(dark!.file_stems["Cargo.toml"]).toBe("files/Cargo.toml");
    expect(dark!.file_stems["Cargo.lock"]).toBe("files/Cargo.lock");
    expect(dark!.file_stems[".env.local"]).toBe("files/.env.local");
  });

  test("named directories pair collapsed and expanded icons and fall back to the collapsed one", () => {
    const [dark, light] = family([
      "folders/node_modules.svg", "folders/node_modules_expanded.svg", "folders/dark/node_modules.svg", "folders/.vscode.svg",
    ]).themes!;
    expect(dark!.named_directory_icons.node_modules).toEqual({
      collapsed: "./icons/folders/dark/node_modules.svg",
      expanded: "./icons/folders/node_modules_expanded.svg",
    });
    expect(light!.named_directory_icons["node_modules"]).toEqual({
      collapsed: "./icons/folders/node_modules.svg",
      expanded: "./icons/folders/node_modules_expanded.svg",
    });
    expect(light!.named_directory_icons[".vscode"]).toEqual({
      collapsed: "./icons/folders/.vscode.svg",
      expanded: "./icons/folders/.vscode.svg",
    });
  });

  test("rejects an association claimed by two icons", () => {
    expect(() => family(["extensions/js.svg", "languages/javascript.svg"])).toThrow("Duplicate Zed file suffix: js");
    expect(() => family(["files/Makefile.svg", "languages/makefile.svg"])).toThrow("Duplicate Zed file stem: Makefile");
  });
});

describe("real project integration", () => {
  let destination: string;
  let catalog: Asset[];

  beforeAll(async () => {
    destination = await mkdtemp(join(tmpdir(), "smile-zed-"));
    catalog = await readCatalog(source);
    await compileZedExtension(catalog, destination);
    destination = join(destination, "zed");
  });
  afterAll(async () => { await rm(destination, { recursive: true, force: true }); });

  test("writes a manifest, one theme family and the icon assets", async () => {
    expect((await readdir(destination)).sort()).toEqual(["extension.toml", "icon.png", "icon_themes", "icons"]);
    const manifest = await Bun.file(join(destination, "extension.toml")).text();
    for (const line of [
      `id = "smile-icons"`,
      `name = "Smile Icons"`,
      `schema_version = 1`,
      `authors = ["ONEO <x@oneo.me>"]`,
      `repository = "https://github.com/oneo-me/Smile-Theme"`,
      `icon_themes = ["icon_themes/smile-icons.json"]`,
    ]) expect(manifest).toContain(line);
    expect(await Bun.file(join(destination, zedIconThemePath)).exists()).toBe(true);
    for (const asset of catalog) expect(await Bun.file(join(destination, "icons", asset.path)).exists(), asset.path).toBe(true);
  });

  test("every theme reference resolves to a packaged icon", async () => {
    const directory = destination + "/";
    const family = await Bun.file(join(destination, zedIconThemePath)).json();
    expect(family.$schema).toBe(zedSchema);
    expect(family.themes.map((theme: { appearance: string }) => theme.appearance)).toEqual(["dark", "light"]);
    for (const theme of family.themes) {
      expect(theme.file_icons.default).toBeDefined();
      const icons = Object.values(theme.file_icons) as { path: string }[];
      for (const icon of [...Object.values(theme.file_stems), ...Object.values(theme.file_suffixes)] as string[]) {
        expect(theme.file_icons[icon], icon).toBeDefined();
      }
      const directoryIcons = [
        theme.directory_icons.collapsed, theme.directory_icons.expanded,
        ...Object.values(theme.named_directory_icons).flatMap((icons: unknown) => Object.values(icons as object)),
      ];
      for (const icon of [...icons.map(icon => icon.path), ...directoryIcons] as string[]) {
        const path = resolve(destination, icon);
        expect(path.startsWith(directory), icon).toBe(true);
        expect(await Bun.file(path).exists(), icon).toBe(true);
      }
    }
  });

  test("Zed resolves the dark variants only in the dark theme", async () => {
    const [dark, light] = (await Bun.file(join(destination, zedIconThemePath)).json()).themes;
    for (const suffix of ["java", "diff", "ps1", "shader", "sh", "txt"]) {
      expect(dark.file_icons[dark.file_suffixes[suffix]].path).toContain("/dark/");
      expect(light.file_icons[light.file_suffixes[suffix]].path).not.toContain("/dark/");
    }
    expect(dark.file_icons.default.path).toBe("./icons/default/dark/file.svg");
    expect(light.file_icons.default.path).toBe("./icons/default/file.svg");
  });

  test("reports the icons no file association can reach", async () => {
    const family = await Bun.file(join(destination, zedIconThemePath)).json();
    expect(unreferencedIcons(family.themes[0])).toEqual([
      "./icons/default/project.svg",
      "./icons/default/project_expanded.svg",
      "./icons/languages/skill.svg",
    ]);
    expect(unreferencedIcons(family.themes[1])).toEqual(unreferencedIcons(family.themes[0]));
  });
});
