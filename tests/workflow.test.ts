import { afterEach, beforeEach, expect, test } from "bun:test";
import { cp, mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { root } from "../src/config";

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "smile-workflow-"));
  for (const path of ["src", "package.json", "icons", "icon.png", "LICENSE", "README.md", "README.zh-CN.md", "CHANGELOG.md"]) {
    await cp(join(root, path), join(directory, path), { recursive: true });
  }
  await symlink(join(root, "node_modules"), join(directory, "node_modules"));
});

afterEach(async () => { await rm(directory, { recursive: true, force: true }); });

function run(script: string) {
  return Bun.spawn([process.execPath, "run", script], {
    cwd: directory,
    env: { ...process.env, SKETCHTOOL: "/missing/sketchtool" },
    stdout: "pipe",
    stderr: "pipe",
  });
}

test("build uses SVG sources without Sketch and preserves output on invalid input", async () => {
  const icon = await Bun.file(join(directory, "icon.png")).bytes();
  const original = await Bun.file(join(directory, "icons/languages/java.svg")).bytes();
  const child = run("build");
  const errors = await new Response(child.stderr).text();
  expect(await child.exited, errors).toBe(0);
  const preview = await Bun.file(join(directory, "preview.png")).bytes();
  expect(await Bun.file(join(directory, "dist/vscode/preview.png")).bytes()).toEqual(preview);
  expect(await Bun.file(join(directory, "icon.png")).bytes()).toEqual(icon);
  expect(await Bun.file(join(directory, "dist/zed/icon.png")).bytes()).toEqual(icon);
  expect(await Bun.file(join(directory, "dist/vscode/icon.png")).bytes()).toEqual(icon);
  expect(await Bun.file(join(directory, "dist/vscode/icons/languages/java.svg")).bytes()).toEqual(original);
  await Bun.write(join(directory, "icons/languages/java.svg"), "broken");
  const failed = run("build");
  const failedError = await new Response(failed.stderr).text();
  expect(await failed.exited).not.toBe(0);
  expect(failedError).toContain("Invalid SVG");
  expect(await Bun.file(join(directory, "preview.png")).bytes()).toEqual(preview);
  expect(await Bun.file(join(directory, "icon.png")).bytes()).toEqual(icon);
  expect(await Bun.file(join(directory, "dist/vscode/icons/languages/java.svg")).bytes()).toEqual(original);
});
