import { readdir } from "node:fs/promises";
import { extname, join } from "node:path";

export const categories = ["default", "extensions", "files", "folders", "languages"] as const;
export type Category = (typeof categories)[number];
export type Asset = { category: Category; light: boolean; names: string[]; path: string };
export type Associations = Record<Category, Record<string, string>>;
const defaults = ["file", "folder", "folder_expanded", "project", "project_expanded"];

export function parseAsset(path: string): Asset {
  const parts = path.split("/");
  const category = parts[0] as Category;
  const light = parts.length === 3 && parts[1] === "light";
  if (!categories.includes(category) || (parts.length !== 2 && !light)) {
    throw new Error(`Invalid icon path: ${path}`);
  }
  const filename = parts.at(-1)!;
  const ext = extname(filename);
  if (![".png", ".svg"].includes(ext)) throw new Error(`Unsupported icon format: ${path}`);
  const names = filename.slice(0, -ext.length).trim().split(/\s+/);
  if (names.some(name => !name || name === "." || name === ".." || /[\\\x00-\x1f]/.test(name))) {
    throw new Error(`Invalid icon name: ${path}`);
  }
  if (category === "default" && names.some(name => !defaults.includes(name))) {
    throw new Error(`Unknown default icon: ${path}`);
  }
  if (category === "extensions" && names.some(name => name.startsWith("."))) {
    throw new Error(`Extensions must omit the leading dot: ${path}`);
  }
  if (category === "folders" && names.some(name => name === "_expanded")) {
    throw new Error(`Expanded directory icon needs a directory name: ${path}`);
  }
  return { category, light, names, path };
}

export function associations(assets: Asset[], light: boolean, caseInsensitivePaths = false): Associations {
  const result = Object.fromEntries(categories.map(category => [category, Object.create(null)])) as Associations;
  for (const variant of light ? [false, true] : [false]) {
    const seen = new Map<string, Asset>();
    for (const asset of assets.filter(asset => asset.light === variant)) {
      const exactNames = new Set<string>();
      for (const name of asset.names) {
        const key = `${asset.category}/${name.toLowerCase()}`;
        if (exactNames.has(name) || (seen.has(key) && seen.get(key) !== asset)) {
          throw new Error(`Duplicate icon association (${variant ? "light" : "common"}): ${key}`);
        }
        exactNames.add(name);
        seen.set(key, asset);
        const associationName = caseInsensitivePaths && ["files", "folders", "extensions"].includes(asset.category)
          ? name.toLowerCase()
          : name;
        result[asset.category][associationName] = asset.path;
      }
    }
  }
  return result;
}

export function validateCatalog(assets: Asset[]) {
  const common = associations(assets, false);
  associations(assets, true);
  for (const name of ["file", "folder"]) {
    if (!common.default[name]) throw new Error(`Missing required default/${name} icon`);
  }
  for (const asset of assets.filter(asset => asset.light)) {
    for (const name of asset.names) {
      if (!common[asset.category][name]) throw new Error(`Light icon has no common fallback: ${asset.path} (${name})`);
    }
  }
}

export async function readCatalog(directory: string): Promise<Asset[]> {
  const paths: string[] = [];
  async function walk(relative = "") {
    for (const entry of await readdir(join(directory, relative), { withFileTypes: true })) {
      if ([".DS_Store", "Thumbs.db", ".gitkeep"].includes(entry.name)) continue;
      const path = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile()) paths.push(path);
      else throw new Error(`Unsupported icon entry: ${path}`);
    }
  }
  await walk();
  const assets = paths.sort().map(parseAsset);
  validateCatalog(assets);
  for (const asset of assets) {
    const file = Bun.file(join(directory, asset.path));
    const header = Buffer.from(await file.slice(0, 256).arrayBuffer());
    if (header.toString().startsWith("version https://git-lfs.github.com/spec/")) {
      throw new Error(`Git LFS pointer instead of an icon: ${asset.path}. Run git lfs pull.`);
    }
    if (asset.path.endsWith(".png")) {
      if (header.length < 24 || header.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
        throw new Error(`Invalid PNG icon: ${asset.path}`);
      }
    } else if (!/<svg[\s>]/.test(await file.text())) {
      throw new Error(`Invalid SVG icon: ${asset.path}`);
    }
  }
  return assets;
}
