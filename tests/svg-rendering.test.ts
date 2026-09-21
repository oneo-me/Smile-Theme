import { expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { source } from "../src/config";

test("env and license retain visible dashes and gaps along the top border", async () => {
  const files = await readdir(join(source, "files"));
  for (const prefix of [".env ", "license "]) {
    const file = files.find(name => name.startsWith(prefix))!;
    const { data, info } = await sharp(join(source, "files", file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const alpha = Array.from({ length: 24 }, (_, index) => data[(2 * info.width + 34 + index) * 4 + 3]!);
    expect(alpha.filter(value => value > 100).length, file).toBeGreaterThan(10);
    expect(alpha.filter(value => value === 0).length, file).toBeGreaterThan(3);
  }
});

test("node gem highlights stay inside the hexagon despite their transforms", async () => {
  const svg = await Bun.file(join(source, "files/.node-version.svg")).text();
  const defs = svg.match(/<defs>[\s\S]*?<\/defs>/)![0];
  const background = svg.match(/<path\b[^>]*id="Mask"[^>]*><\/path>/)![0];
  const baseline = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="48">${defs}${background}</svg>`;
  const rendered = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer();
  const expected = await sharp(Buffer.from(baseline)).ensureAlpha().raw().toBuffer();
  for (let y = 0; y < 48; y++) {
    for (let x = 0; x < 72; x++) {
      if (x >= 29 && x <= 55 && y >= 9 && y <= 39) continue;
      const offset = (y * 72 + x) * 4;
      expect(rendered.subarray(offset, offset + 4), `outside gem at ${x},${y}`).toEqual(expected.subarray(offset, offset + 4));
    }
  }
  expect(rendered.equals(expected)).toBe(false);
});
