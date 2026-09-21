import { afterEach, beforeEach, expect, test } from "bun:test";
import { copyFile, cp, mkdtemp, rename, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { root } from "../src/config";

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "smile-workflow-"));
  for (const path of ["src", "package.json", "icons", "icon.svg", "LICENSE", "README.md", "README.zh-CN.md", "CHANGELOG.md"]) {
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
  const original = await Bun.file(join(directory, "icons/languages/java.svg")).bytes();
  const child = run("build");
  const errors = await new Response(child.stderr).text();
  expect(await child.exited, errors).toBe(0);
  const preview = await Bun.file(join(directory, "preview.png")).bytes();
  expect(await Bun.file(join(directory, "dist/vscode/preview.png")).bytes()).toEqual(preview);
  expect(await Bun.file(join(directory, "dist/vscode/icons/languages/java.svg")).bytes()).toEqual(original);
  await Bun.write(join(directory, "icons/languages/java.svg"), "broken");
  const failed = run("build");
  const failedError = await new Response(failed.stderr).text();
  expect(await failed.exited).not.toBe(0);
  expect(failedError).toContain("Invalid SVG");
  expect(await Bun.file(join(directory, "preview.png")).bytes()).toEqual(preview);
  expect(await Bun.file(join(directory, "dist/vscode/icons/languages/java.svg")).bytes()).toEqual(original);
});

test("dev rebuilds after atomic SVG saves without watching its generated output", async () => {
  const child = run("dev");
  let log = "";
  let errors = "";
  const stdout = (async () => { for await (const chunk of child.stdout) log += Buffer.from(chunk).toString(); })();
  const stderr = (async () => { for await (const chunk of child.stderr) errors += Buffer.from(chunk).toString(); })();
  const builds = () => (log.match(/Built \d+ icon assets/g) ?? []).length;
  async function waitForBuild(count: number) {
    const deadline = Date.now() + 5000;
    while (builds() < count && Date.now() < deadline) await Bun.sleep(50);
    expect(builds(), log + errors).toBe(count);
  }
  try {
    await waitForBuild(1);
    await Bun.sleep(1200);
    expect(builds()).toBe(1);
    await copyFile(join(directory, "icons/languages/java.svg"), join(directory, "replacement.svg"));
    await rename(join(directory, "replacement.svg"), join(directory, "icons/languages/java.svg"));
    await waitForBuild(2);
    await Bun.sleep(1200);
    expect(builds()).toBe(2);
    for (const [index, path] of ["README.md", "README.zh-CN.md", "CHANGELOG.md"].entries()) {
      const text = await Bun.file(join(directory, path)).text() + "\nUpdated contribution guide.\n";
      await Bun.write(join(directory, path), text);
      await waitForBuild(3 + index);
      expect(await Bun.file(join(directory, "dist/vscode", path)).text()).toBe(text.replaceAll('src="icon.svg"', 'src="extension/icon.png"'));
    }
  } finally {
    child.kill();
    await child.exited;
    await Promise.all([stdout, stderr]);
  }
}, 15000);
