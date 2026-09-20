import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { associations, type Asset } from "./catalog";

export async function generatePreview(assets: Asset[], destination: string) {
  const directory = join(destination, "preview");
  await rm(directory, { recursive: true, force: true });
  const groups = ["defaults", "extensions", "files", "folders", "languages"];
  for (const group of groups) await mkdir(join(directory, group), { recursive: true });
  const sample = async (path: string) => { await Bun.write(join(directory, path), ""); };
  await sample("defaults/unmatched.smile-preview-default");
  await sample("defaults/ordinary-folder/child.smile-preview-default");

  const common = associations(assets, false, true);
  for (const extension of Object.keys(common.extensions)) await sample(`extensions/sample.${extension}`);
  // VS Code matches filenames without case; one sample covers all case aliases.
  for (const name of Object.keys(common.files)) await sample(`files/${name}`);
  const folders = new Set(Object.keys(common.folders).map(name => name.replace(/_expanded$/, "")));
  for (const name of folders) await sample(`folders/${name}/child.smile-preview-default`);

  const languages = Object.keys(common.languages).map(id => ({ id, filenames: [`language-${id}.smile-preview`] }));
  for (const language of languages) await sample(`languages/${language.filenames[0]}`);
  const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
  await Bun.write(join(directory, "language-support/package.json"), json({
    name: "smile-preview-languages",
    publisher: "oneo",
    version: "0.0.0",
    engines: { vscode: "^1.80.0" },
    contributes: { languages },
  }));
  await Bun.write(join(directory, "smile-icons.code-workspace"), json({
    folders: groups.map(path => ({ path })),
    settings: {
      "workbench.iconTheme": "smile-icons",
      "explorer.compactFolders": false,
      "explorer.excludeGitIgnore": false,
      "files.exclude": {
        "**/.git": false, "**/.svn": false, "**/.hg": false,
        "**/.DS_Store": false, "**/Thumbs.db": false, "**/node_modules": false, "**/CVS": false,
      },
      "files.associations": Object.fromEntries(languages.map(language => [language.filenames[0], language.id])),
    },
  }));
}
