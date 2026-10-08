# Architecture

Smile Icons builds static file and folder icon themes for VS Code and Zed from one SVG catalog. Users install a theme and select it in their editor; the editor resolves icon associations and appearance locally. Neither extension runs application code, downloads icons, or supplies editor color themes.

## System boundaries

- **Authored assets:** [icons/](icons/) contains theme artwork and its association declarations. Root [icon.png](icon.png) is the shared brand image. Both are inputs, not build outputs.
- **Shared catalog:** [the catalog reader](src/catalog.ts) validates naming, aliases, required fallbacks, and basic file content before consumers generate editor-specific output.
- **Editor adapters:** [VS Code](src/themes.ts) and [Zed](src/zed.ts) translate the catalog into their respective theme contracts. They share artwork and appearance semantics, not identical matching behavior.
- **Build and review:** [the build](src/build.ts) assembles static extensions and derives a VS Code preview workspace and PNG overview from the same catalog.
- **Distribution:** packaging wraps `dist/vscode` as a VSIX and `dist/zed` as a tar archive. Both use the version in [package.json](package.json); packaging does not publish either extension.

The build toolchain is Bun and TypeScript. Sharp renders the overview, VSCE packages VS Code, and system `tar` packages Zed. Installed themes do not require these tools.

## Core flow

```text
icons/ → validated catalog → VS Code theme + static extension
                          → Zed theme family + static extension
                          → VS Code review workspace + PNG overview
icon.png ─────────────────→ both extension directories
extension directories ────→ VSIX / tar.gz
```

The build copies artwork without rewriting it. It copies the generated VS Code overview back to root `preview.png` for the README. The brand PNG remains unchanged.

Catalog validation and VS Code association generation happen before the previous VS Code output is removed. Failures at that stage preserve existing output. Later rendering, copying, or Zed generation failures may leave partially updated directories: the build is not atomic across outputs. Resolve the failure and complete a successful build before reviewing or packaging.

## Important constraints

Common icons serve light appearance and are also the dark fallback; `dark/` provides overrides only where needed. Every dark alias must have a common counterpart. Artwork must remain recognizable at explorer sizes, not just in the overview image.

VS Code retains the published identity `oneo.smile-theme` and declares compatibility with VS Code `^1.80.0`. Zed uses `smile-icons` and requires explicit filename/suffix mappings for language artwork. It has no dedicated workspace-root icon slot, so coverage differs by editor.

The documented Zed distribution route is local development installation, not the extension registry. Automated checks cover generated associations, resource paths, selected rendering regressions, and build behavior. They do not establish in-editor visual acceptance or complete Zed schema compliance.

## Subjects

| Document | When to read it |
| --- | --- |
| [Assets and appearance](docs/architecture/assets.md) | Adding artwork or aliases; understanding source ownership, dark fallbacks, and visual constraints. |
| [Editor integration](docs/architecture/editor-integration.md) | Changing theme generation, matching behavior, or cross-editor coverage. |
| [Development and releases](docs/engineering.md) | Building, testing, reviewing previews, packaging, or preparing a release. |

User setup is in [README.md](README.md) and [README.zh-CN.md](README.zh-CN.md). [AGENTS.md](AGENTS.md) defines contributor automation rules; [CHANGELOG.md](CHANGELOG.md) owns user-facing release history.
