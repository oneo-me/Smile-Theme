import { associations, type Asset, type Associations } from "./catalog";

const path = (asset: string) => `./icons/${asset}`;

function vscodeAssociations(a: Associations) {
  const closed = Object.fromEntries(Object.entries(a.folders).filter(([name]) => !name.endsWith("_expanded")));
  const expanded = { ...closed };
  for (const [name, asset] of Object.entries(a.folders)) {
    if (name.endsWith("_expanded")) expanded[name.slice(0, -9)] = asset;
  }
  return {
    file: a.default.file,
    folder: a.default.folder,
    folderExpanded: a.default.folder_expanded ?? a.default.folder,
    rootFolder: a.default.project ?? a.default.folder,
    rootFolderExpanded: a.default.project_expanded ?? a.default.project ?? a.default.folder_expanded ?? a.default.folder,
    fileExtensions: a.extensions,
    fileNames: a.files,
    languageIds: a.languages,
    folderNames: closed,
    folderNamesExpanded: expanded,
  };
}

export function vscodeTheme(assets: Asset[]) {
  // VS Code uses the base associations for dark themes and the `light` block for light themes.
  return {
    iconDefinitions: Object.fromEntries(assets.map(asset => [asset.path, { iconPath: path(asset.path) }])),
    ...vscodeAssociations(associations(assets, true, true)),
    light: vscodeAssociations(associations(assets, false, true)),
  };
}
