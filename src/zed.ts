import { associations, type Asset, type Associations } from "./catalog";

export const zedSchema = "https://zed.dev/schema/icon_themes/v0.3.0.json";
// Zed identifies the extension by this id, which matches the icon theme id and label.
export const zedExtensionId = "smile-icons";
export const zedIconThemePath = "icon_themes/smile-icons.json";

// Zed reads file icons from the active theme alone: it matches a file name against
// `file_stems`, then strips leading dot segments and matches `file_suffixes`, and finally
// falls back to the `default` key. VS Code language IDs never reach it, so every language
// icon declares the suffixes and stems it covers. Entries are keyed by the language ID in
// the icon file name; `.gitignore` stays with the `extensions` icon. A language icon that
// the catalog does not ship simply contributes no association.
const languageAssociations: Record<string, { stems?: string[]; suffixes?: string[] }> = {
  bat: { suffixes: ["bat", "cmd"] },
  shellscript: { suffixes: ["sh", "bash", "zsh", "fish", "ksh"] },
  c: { suffixes: ["c", "h"] },
  clojure: { suffixes: ["clj", "cljs", "cljc", "edn"] },
  coffeescript: { suffixes: ["coffee", "litcoffee"] },
  cpp: { suffixes: ["cc", "cpp", "cxx", "c++", "hh", "hpp", "hxx", "h++", "inl", "ipp", "ixx", "tpp"] },
  "cuda-cpp": { suffixes: ["cu", "cuh"] },
  csharp: { suffixes: ["cs", "csx"] },
  css: { suffixes: ["css", "pcss", "postcss"] },
  diff: { suffixes: ["diff", "patch", "rej"] },
  dockerfile: { stems: ["Dockerfile", "Containerfile"] },
  fsharp: { suffixes: ["fs", "fsi", "fsx", "fsproj"] },
  "git-commit": { stems: ["COMMIT_EDITMSG", "MERGE_MSG"] },
  "git-rebase": { stems: ["git-rebase-todo"] },
  go: { suffixes: ["go", "mod", "sum", "work"] },
  groovy: { suffixes: ["groovy", "gvy", "gy", "gsh"] },
  handlebars: { suffixes: ["hbs", "handlebars"] },
  hlsl: { suffixes: ["hlsl", "fx", "fxh", "hlsli"] },
  html: { suffixes: ["html", "htm", "xhtml"] },
  ignore: { suffixes: ["npmignore", "dockerignore", "eslintignore", "prettierignore", "stylelintignore", "hgignore"] },
  ini: { suffixes: ["ini", "cfg", "conf"] },
  jade: { suffixes: ["jade", "pug"] },
  java: { suffixes: ["java"] },
  javascript: { suffixes: ["js", "mjs", "cjs"] },
  javascriptreact: { suffixes: ["jsx"] },
  json: { suffixes: ["json", "jsonc", "geojson"] },
  jsonl: { suffixes: ["jsonl", "ndjson"] },
  less: { suffixes: ["less"] },
  log: { suffixes: ["log"] },
  lua: { suffixes: ["lua", "luau"] },
  makefile: { stems: ["Makefile", "makefile", "GNUmakefile"], suffixes: ["mk", "make"] },
  markdown: { suffixes: ["md", "markdown", "mdown", "mkd", "mdx"] },
  "objective-c": { suffixes: ["m"] },
  "objective-cpp": { suffixes: ["mm"] },
  perl: { suffixes: ["pl", "pm", "pod"] },
  php: { suffixes: ["php", "php3", "php4", "php5", "phtml"] },
  plaintext: { suffixes: ["txt", "text"] },
  powershell: { suffixes: ["ps1", "psm1", "psd1"] },
  properties: { suffixes: ["properties"] },
  python: { suffixes: ["py", "pyi", "pyw", "pyx"] },
  r: { suffixes: ["r"] },
  raku: { suffixes: ["raku", "p6", "pm6", "pl6", "nqp"] },
  razor: { suffixes: ["razor", "cshtml"] },
  ruby: { suffixes: ["rb", "erb", "rake", "gemspec", "ru", "rbi"] },
  rust: { suffixes: ["rs"] },
  sass: { suffixes: ["sass"] },
  scss: { suffixes: ["scss"] },
  shaderlab: { suffixes: ["shader"] },
  sql: { suffixes: ["sql", "psql", "mysql"] },
  swift: { suffixes: ["swift"] },
  typescript: { suffixes: ["ts", "cts", "mts"] },
  typescriptreact: { suffixes: ["tsx"] },
  vb: { suffixes: ["vb", "vbs", "bas", "cls", "frm"] },
  xml: { suffixes: ["xml", "xsl", "xslt", "xsd", "dtd", "plist"] },
  xquery: { suffixes: ["xq", "xquery", "xqy"] },
  yaml: { suffixes: ["yaml", "yml"] },
};

export type ZedIconDefinition = { path: string };
export type ZedDirectoryIcons = { collapsed: string; expanded: string };
export type ZedIconTheme = {
  name: string;
  appearance: "dark" | "light";
  directory_icons: ZedDirectoryIcons;
  named_directory_icons: Record<string, ZedDirectoryIcons>;
  file_stems: Record<string, string>;
  file_suffixes: Record<string, string>;
  file_icons: Record<string, ZedIconDefinition>;
};
export type ZedIconThemeFamily = {
  $schema: string;
  name: string;
  author: string;
  themes: ZedIconTheme[];
};

const path = (asset: string) => `./icons/${asset}`;
const key = (category: string, name: string) => `${category}/${name}`;

function required<T>(entries: Record<string, T>, name: string): T {
  const value = entries[name];
  if (value === undefined) throw new Error(`Missing Zed icon association: ${name}`);
  return value;
}

function merge(associations: Record<string, string>, entries: [string, string][], kind: string) {
  for (const [name, icon] of entries) {
    if (associations[name] && associations[name] !== icon) throw new Error(`Duplicate Zed ${kind}: ${name}`);
    associations[name] = icon;
  }
}

// Theme family with one theme per appearance, mirroring VS Code: the dark theme applies
// the `dark/` variants over the common icons, the light theme uses the common icons only.
export function zedIconThemeFamily(assets: Asset[], name: string, author: string): ZedIconThemeFamily {
  const themes = ([["Dark", "dark"], ["Light", "light"]] as const)
    .map(([label, appearance]) => zedIconTheme(assets, `${name} ${label}`, appearance));
  return { $schema: zedSchema, name, author, themes };
}

function zedIconTheme(assets: Asset[], name: string, appearance: "dark" | "light"): ZedIconTheme {
  const theme = associations(assets, appearance === "dark");
  const icons: Record<string, ZedIconDefinition> = {};
  for (const [category, entries] of Object.entries(theme)) {
    for (const [alias, asset] of Object.entries(entries)) icons[key(category, alias)] = { path: path(asset) };
  }
  icons.default = { path: path(required(theme.default, "file")) };

  const stems: Record<string, string> = {};
  const suffixes: Record<string, string> = {};
  merge(stems, Object.keys(theme.files).map(name => [name, key("files", name)]), "file stem");
  merge(suffixes, Object.keys(theme.extensions).map(name => [name, key("extensions", name)]), "file suffix");
  for (const [id, association] of Object.entries(languageAssociations)) {
    const icon = key("languages", id);
    if (!icons[icon]) continue;
    merge(stems, (association.stems ?? []).map(name => [name, icon]), "file stem");
    merge(suffixes, (association.suffixes ?? []).map(name => [name, icon]), "file suffix");
  }

  const named: Record<string, ZedDirectoryIcons> = {};
  for (const [alias, asset] of Object.entries(theme.folders)) {
    if (alias.endsWith("_expanded")) continue;
    const expanded = theme.folders[`${alias}_expanded`] ?? asset;
    named[alias] = { collapsed: path(asset), expanded: path(expanded) };
  }

  return {
    name,
    appearance,
    directory_icons: {
      collapsed: path(required(theme.default, "folder")),
      expanded: path(theme.default.folder_expanded ?? required(theme.default, "folder")),
    },
    named_directory_icons: named,
    file_stems: stems,
    file_suffixes: suffixes,
    file_icons: icons,
  };
}

export function zedExtensionManifest(
  metadata: { id: string; name: string; version: string; author: string; repository: string },
  iconThemePath: string,
): string {
  return [
    `id = "${metadata.id}"`,
    `name = "${metadata.name}"`,
    `version = "${metadata.version}"`,
    `schema_version = 1`,
    `authors = ["${metadata.author}"]`,
    `description = "SVG file and folder icons, with light mode variants."`,
    `repository = "${metadata.repository}"`,
    `icon_themes = ["${iconThemePath}"]`,
  ].join("\n") + "\n";
}

// Icons Zed cannot reference: it has no root folder slot, and a language icon without a
// file association is reached through the icon of another category.
export function unreferencedIcons(theme: ZedIconTheme): string[] {
  const referenced = new Set([
    required(theme.file_icons, "default").path,
    theme.directory_icons.collapsed,
    theme.directory_icons.expanded,
  ]);
  for (const icon of [...Object.values(theme.file_stems), ...Object.values(theme.file_suffixes)]) {
    if (theme.file_icons[icon]) referenced.add(theme.file_icons[icon].path);
  }
  for (const directory of Object.values(theme.named_directory_icons)) {
    referenced.add(directory.collapsed);
    referenced.add(directory.expanded);
  }
  const paths = new Set(Object.values(theme.file_icons).map(definition => definition.path));
  return [...paths].filter(path => !referenced.has(path));
}
