import { afterEach, beforeEach, expect, test } from "bun:test";
import { chmod, copyFile, cp, mkdtemp, rename, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { root } from "../src/config";

let directory: string;
let sketchtool: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "smile-workflow-"));
  for (const path of ["src", "package.json", "design.sketch", "extension", "LICENSE"]) {
    await cp(join(root, path), join(directory, path), { recursive: true });
  }
  await symlink(join(root, "node_modules"), join(directory, "node_modules"));
  sketchtool = join(directory, "sketchtool");
  await Bun.write(sketchtool, `#!${process.execPath}
import { mkdir, copyFile } from "node:fs/promises";
import { join } from "node:path";
if (await Bun.file(join(import.meta.dir, "fail-export")).exists()) process.exit(1);
const args = process.argv.slice(2);
const output = args.find(arg => arg.startsWith("--output=")).slice(9);
const items = args.find(arg => arg.startsWith("--items=")).slice(8).split(",");
await mkdir(output, { recursive: true });
for (const id of items) await copyFile(join(import.meta.dir, "extension/icons/default/file.png"), join(output, id + "@3x.png"));
`);
  await chmod(sketchtool, 0o755);
});

afterEach(async () => { await rm(directory, { recursive: true, force: true }); });

function run(script: string) {
  return Bun.spawn([process.execPath, "run", script], {
    cwd: directory,
    env: { ...process.env, SKETCHTOOL: sketchtool },
    stdout: "pipe",
    stderr: "pipe",
  });
}

test("build exports before compilation and preserves output when export fails", async () => {
  const child = run("build");
  const log = await new Response(child.stdout).text();
  const errors = await new Response(child.stderr).text();
  expect(await child.exited, errors).toBe(0);
  expect(log.indexOf("Exported 104 icons")).toBeGreaterThanOrEqual(0);
  expect(log.indexOf("Built 104 icon assets")).toBeGreaterThan(log.indexOf("Exported 104 icons"));
  const original = await Bun.file(join(directory, "extension/icons/default/file.png")).bytes();
  expect(await Bun.file(join(directory, "dist/vscode/icons/languages/java.png")).bytes()).toEqual(original);
  await Bun.write(join(directory, "fail-export"), "fail");
  const failed = run("build");
  const failedLog = await new Response(failed.stdout).text();
  const failedError = await new Response(failed.stderr).text();
  expect(await failed.exited).not.toBe(0);
  expect(failedError).toContain("Sketch export failed");
  expect(failedLog).not.toContain("Built");
  expect(await Bun.file(join(directory, "extension/icons/languages/java.png")).bytes()).toEqual(original);
  expect(await Bun.file(join(directory, "dist/vscode/icons/languages/java.png")).bytes()).toEqual(original);
});

test("dev rebuilds after atomic Sketch saves without watching its generated output", async () => {
  const child = run("dev");
  let log = "";
  let errors = "";
  const stdout = (async () => { for await (const chunk of child.stdout) log += Buffer.from(chunk).toString(); })();
  const stderr = (async () => { for await (const chunk of child.stderr) errors += Buffer.from(chunk).toString(); })();
  const builds = () => log.split("Built 104 icon assets").length - 1;
  async function waitForBuild(count: number) {
    const deadline = Date.now() + 5000;
    while (builds() < count && Date.now() < deadline) await Bun.sleep(50);
    expect(builds(), log + errors).toBe(count);
  }
  try {
    await waitForBuild(1);
    await Bun.sleep(1200);
    expect(builds()).toBe(1);
    await copyFile(join(directory, "design.sketch"), join(directory, "replacement.sketch"));
    await rename(join(directory, "replacement.sketch"), join(directory, "design.sketch"));
    await waitForBuild(2);
    await Bun.sleep(1200);
    expect(builds()).toBe(2);
    expect(log.split("Exported 104 icons").length - 1).toBe(2);
  } finally {
    child.kill();
    await child.exited;
    await Promise.all([stdout, stderr]);
  }
}, 15000);
