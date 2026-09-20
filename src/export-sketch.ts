import { copyFile, mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { unzipSync, strFromU8 } from "fflate";
import { categories, parseAsset, readCatalog, validateCatalog } from "./catalog";
import { root, source } from "./config";

type Layer = {
  name: string;
  do_objectID: string;
  layers?: Layer[];
  exportOptions?: { exportFormats?: unknown[] };
};

export function exportPlan(pages: Layer[]) {
  const plan: { id: string; path: string }[] = [];
  for (const page of pages) {
    const destination = page.name.split("|").at(-1)?.trim();
    const category = categories.find(category => destination === `extension/icons/${category}`);
    if (!category) continue;
    function walk(layer: Layer) {
      if (layer.exportOptions?.exportFormats?.length) {
        const path = `${category}/${layer.name}.png`;
        parseAsset(path);
        if (!/^[A-Za-z0-9-]+$/.test(layer.do_objectID)) throw new Error(`Invalid Sketch layer ID: ${layer.name}`);
        plan.push({ id: layer.do_objectID, path });
      }
      for (const child of layer.layers ?? []) walk(child);
    }
    for (const layer of page.layers ?? []) walk(layer);
  }
  validateCatalog(plan.map(item => parseAsset(item.path)));
  return plan;
}

export async function exportSketch(document = resolve(root, "design.sketch")) {
  const sketchtool = process.env.SKETCHTOOL ?? "/Applications/Sketch.app/Contents/Resources/sketchtool/bin/sketchtool";
  if (!(await Bun.file(sketchtool).exists())) throw new Error("Sketch CLI not found. Install Sketch on macOS or set SKETCHTOOL to its executable path.");
  const zip = unzipSync(new Uint8Array(await Bun.file(document).arrayBuffer()), {
    filter: file => /^pages\/[^/]+\.json$/.test(file.name),
  });
  const plan = exportPlan(Object.keys(zip).sort().map(key => JSON.parse(strFromU8(zip[key]!)) as Layer));
  const scratch = await mkdtemp(join(tmpdir(), "smile-sketch-"));
  const staging = await mkdtemp(join(root, "extension/.icons-export-"));
  try {
    const command = Bun.spawn([
      sketchtool, "export", "layers", document,
      `--items=${plan.map(item => item.id).join(",")}`,
      `--output=${scratch}`, "--formats=png", "--scales=3",
      "--use-id-for-name=YES", "--overwriting=YES",
    ], { stdout: "pipe", stderr: "inherit" });
    const log = await new Response(command.stdout).text();
    if (await command.exited !== 0) throw new Error(`Sketch export failed; existing icons were preserved.\n${log}`);
    for (const item of plan) {
      const scaled = join(scratch, `${item.id}@3x.png`);
      const exported = await Bun.file(scaled).exists() ? scaled : join(scratch, `${item.id}.png`);
      const bytes = new Uint8Array(await Bun.file(exported).arrayBuffer());
      if (bytes.length < 24 || Buffer.from(bytes.subarray(0, 8)).toString("hex") !== "89504e470d0a1a0a") {
        throw new Error(`Sketch produced an invalid PNG: ${item.path}`);
      }
      await mkdir(dirname(join(staging, item.path)), { recursive: true });
      await copyFile(exported, join(staging, item.path));
    }
    await readCatalog(staging);
    const backup = `${staging}-previous`;
    await rename(source, backup);
    try {
      await rename(staging, source);
    } catch (error) {
      await rename(backup, source);
      throw error;
    }
    await rm(backup, { recursive: true });
    console.log(`Exported ${plan.length} icons from ${document}.`);
  } finally {
    await rm(scratch, { recursive: true, force: true });
    await rm(staging, { recursive: true, force: true });
  }
}

if (import.meta.main) await exportSketch(resolve(root, process.argv[2] ?? "design.sketch"));
