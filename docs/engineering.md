# Development and Releases

Read [ARCHITECTURE.md](../ARCHITECTURE.md) before changing the build or theme model.

## Development and verification

### Setup and automated checks

Use Bun 1.4.2, the version pinned in [package.json](../package.json), and Git LFS for PNG assets. Packaging Zed also needs system `tar`.

```sh
git lfs pull
bun install
bun run check
bun test
bun run build
```

`check` runs TypeScript without emitting files. Tests cover catalog rules, editor associations and packaged resources, preview generation, selected SVG rendering regressions, and early build failure preservation. They do not validate Markdown, launch editors, or run a complete external Zed schema validator.

The build produces both extensions under `dist/`, a VS Code review workspace, and root `preview.png`. Do not edit generated output to fix a theme; update its source and rebuild.

### Preview responsibilities

The [VS Code workspace generator](../src/preview.ts) creates real file, folder, and language samples. A development-only language support extension makes language examples available without installing every language extension. It is not part of the shipped theme.

The [PNG overview](../src/preview-image.ts) showcases common artwork, deduplicated by rendered appearance and ordered deterministically with defaults and folders first. It intentionally omits dark variants, so it cannot replace dark-mode review. Neither preview is an authored source.

### Visual review

For VS Code, press F5 in the repository. [The launch configuration](../.vscode/launch.json) builds first, opens `dist/preview/smile-icons.code-workspace`, and loads the theme and generated language support extension with other extensions disabled. Restart the debug session after edits.

Review unmatched files, named files, suffixes, languages, folders in both states, and workspace roots. Switch between light and dark color themes and inspect icons at normal explorer size.

For Zed, build first, choose **Install Dev Extension** on the extensions page, and select `dist/zed`. Use `icon theme selector: toggle` to select Smile Icons. Check both appearances and representative filenames, suffixes, and folder states in Zed itself; the VS Code preview cannot validate Zed matching.

Record actual manual acceptance with the change or release review. Automated success alone is not evidence that editor installation, matching, and visual checks have occurred.

## Packaging and releases

### Build artifacts

```sh
bun run package        # Build once, then package both editors
bun run package:vscode # Build both editors, then package VS Code only
bun run package:zed    # Build both editors, then package Zed only
```

Outputs use the root package version: `dist/smile-theme-<version>.vsix` and `dist/smile-icons-<version>.tar.gz`.

VSCE packages the static VS Code extension without build dependencies. System `tar` packages Zed's manifest, themes, icons, and brand PNG. These commands do not publish or install anything.

### Bundled documentation

The VS Code package copies both README editions, the changelog, and licensing, but does not include internal architecture documentation. README links to contributor documentation therefore use repository URLs so they also work outside the checkout. Other internal documents use relative links.

Keep README images as root PNG paths available in both the repository and extension package. Marketplace packaging restricts SVG presentation images and rewrites relative image URLs to repository locations; SVG theme assets themselves remain supported. See [VS Code publishing guidance](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).

### Release preparation

Root [CHANGELOG.md](../CHANGELOG.md) serves users of both editor packages, which share the root package version. Identify editor-specific outcomes instead of implying feature parity. VS Code bundles the changelog; Zed's archive does not. No current release script extracts a version section or publishes release notes.

When a release is explicitly authorized:

1. Confirm the version and shipping scope against the release branch and actual artifacts, including which editor each change affects.
2. Review `Unreleased` as a release summary. Merge overlapping outcomes and remove internal task details; move only shipping entries into the confirmed version section. Keep `Unreleased` first, empty or containing deferred entries. Use a release date only when confirmed.
3. If the release includes an authorized version update, keep root package metadata and release notes consistent; both editor manifests derive their version from the root package.
4. Run type checks, tests, and `bun run package`. Inspect package contents and perform the editor review above.
5. Review root `preview.png` and ensure Git LFS image content is available with the release. Keep code, documentation, and release notes on the same branch.

Version bumps, tags, Marketplace publishing, and Zed registry submission are separate authorized actions. There is no repository publishing command to run as part of routine documentation maintenance.
