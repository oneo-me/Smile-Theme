import { createHash } from "node:crypto";
import { join } from "node:path";
import sharp from "sharp";
import type { Asset, Category } from "./catalog";

// The preview opens with the default and folder icons, which show the theme's style
// most directly; the remaining categories follow in their catalog order.
const leadingCategories: readonly Category[] = ["default", "folders"];
const previewOrder = (asset: Asset) => {
  const index = leadingCategories.indexOf(asset.category);
  return index === -1 ? leadingCategories.length : index;
};

export async function renderPreviewImage(assets: Asset[], source: string): Promise<Buffer> {
  const icons: { input: Buffer; width: number; height: number }[] = [];
  const seen = new Set<string>();
  const ordered = [...assets].sort((a, b) =>
    previewOrder(a) - previewOrder(b) || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  for (const asset of ordered) {
    if (asset.dark) continue;
    const { data, info } = await sharp(join(source, asset.path), { density: asset.path.endsWith(".svg") ? 216 : 72 })
      .toColourspace("srgb").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let offset = 0; offset < data.length; offset += 4) {
      if (data[offset + 3] === 0) data.fill(0, offset, offset + 3);
    }
    const hash = createHash("sha256").update(data).digest("hex");
    const key = `${info.width}x${info.height}:${hash}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const resized = await sharp(data, { raw: info })
      .resize(86, 58, { fit: "inside", withoutEnlargement: true })
      .png().toBuffer({ resolveWithObject: true });
    icons.push({ input: resized.data, width: resized.info.width, height: resized.info.height });
  }
  if (!icons.length) throw new Error("No common icons available for the preview image");

  const columns = Math.min(15, icons.length);
  const cellWidth = 112;
  const cellHeight = 94;
  const padding = 44;
  const width = columns * cellWidth + padding * 2;
  const height = Math.ceil(icons.length / columns) * cellHeight + padding * 2;
  const layers = icons.map((icon, index) => {
    const row = Math.floor(index / columns);
    const count = Math.min(columns, icons.length - row * columns);
    return {
      input: icon.input,
      left: padding + Math.floor((columns - count) * cellWidth / 2)
        + index % columns * cellWidth + Math.floor((cellWidth - icon.width) / 2),
      top: padding + row * cellHeight + Math.floor((cellHeight - icon.height) / 2),
    };
  });
  return sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers).png().toBuffer();
}
