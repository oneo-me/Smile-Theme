import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { parseAsset } from "../src/catalog";
import { renderPreviewImage } from "../src/preview-image";

let directory: string;
beforeEach(async () => { directory = await mkdtemp(join(tmpdir(), "smile-preview-image-")); });
afterEach(async () => { await rm(directory, { recursive: true, force: true }); });

test("deduplicates decoded pixels and aliases, ignores dark variants, and preserves transparency", async () => {
  await mkdir(join(directory, "files/dark"), { recursive: true });
  const pixels = Buffer.from([255, 0, 0, 255, 0, 0, 0, 0]);
  const raw = { width: 2, height: 1, channels: 4 as const };
  await sharp(pixels, { raw }).png({ compressionLevel: 0 }).toFile(join(directory, "files/a alias.png"));
  const hiddenColour = Buffer.from(pixels);
  hiddenColour[4] = 255;
  await sharp(hiddenColour, { raw }).png({ compressionLevel: 9 }).toFile(join(directory, "files/b.png"));
  const paths = ["files/a alias.png", "files/b.png", "files/c.png", "files/dark/a.png"];
  await sharp({ create: { width: 2, height: 1, channels: 4, background: "blue" } }).png().toFile(join(directory, "files/c.png"));
  await sharp({ create: { width: 2, height: 1, channels: 4, background: "green" } })
    .png().toFile(join(directory, "files/dark/a.png"));
  const assets = paths.map(parseAsset);
  const preview = await renderPreviewImage(assets, directory);
  expect(await renderPreviewImage(assets.toReversed(), directory)).toEqual(preview);
  const { data, info } = await sharp(preview).raw().toBuffer({ resolveWithObject: true });
  expect(info.channels).toBe(4);
  const visible: number[][] = [];
  let transparent = 0;
  for (let offset = 0; offset < data.length; offset += 4) {
    if (data[offset + 3]) visible.push([...data.subarray(offset, offset + 4)]);
    else transparent++;
  }
  expect(visible).toEqual([[255, 0, 0, 255], [0, 0, 255, 255], [0, 0, 255, 255]]);
  expect(transparent).toBe(info.width * info.height - 3);
});

test("leads with the default and folder icons, then the remaining categories", async () => {
  const colours: [string, [number, number, number]][] = [
    ["files/zeta.png", [0, 0, 255]],
    ["folders/alpha.png", [0, 255, 0]],
    ["default/file.png", [255, 0, 0]],
    ["languages/beta.png", [255, 255, 0]],
  ];
  const assets = [];
  for (const [path, [r, g, b]] of colours) {
    await mkdir(dirname(join(directory, path)), { recursive: true });
    await sharp({ create: { width: 1, height: 1, channels: 4, background: { r, g, b, alpha: 1 } } })
      .png().toFile(join(directory, path));
    assets.push(parseAsset(path));
  }
  const { data, info } = await sharp(await renderPreviewImage(assets.toReversed(), directory))
    .raw().toBuffer({ resolveWithObject: true });
  const visible: number[][] = [];
  for (let offset = 0; offset < data.length; offset += 4) {
    if (data[offset + 3]) visible.push([...data.subarray(offset, offset + 4)]);
  }
  expect(visible).toEqual([[255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255], [255, 255, 0, 255]]);
  expect(info.width).toBe(4 * 112 + 88);
});

test("rejects a catalog without common icons", async () => {
  await expect(renderPreviewImage([], directory)).rejects.toThrow("No common icons");
});

test("lays out 15 icons per row and centers the final row", async () => {
  await mkdir(join(directory, "files"));
  const assets = [];
  for (let index = 0; index < 16; index++) {
    const path = `files/${String(index).padStart(2, "0")}.png`;
    await sharp({ create: { width: 1, height: 1, channels: 4, background: { r: index + 1, g: 0, b: 0, alpha: 1 } } })
      .png().toFile(join(directory, path));
    assets.push(parseAsset(path));
  }
  const { data, info } = await sharp(await renderPreviewImage(assets, directory))
    .raw().toBuffer({ resolveWithObject: true });
  expect(info.width).toBe(1768);
  expect(info.height).toBe(276);
  const positions: [number, number][] = [];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3]) positions.push([x, y]);
    }
  }
  expect(positions.slice(0, 15)).toEqual(Array.from({ length: 15 }, (_, index) => [99 + index * 112, 90]));
  expect(positions.slice(15)).toEqual([[883, 184]]);
});
