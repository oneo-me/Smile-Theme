# Project Instructions

Smile Icons provides static file and folder icon themes for VS Code and Zed from a shared SVG catalog. It does not provide editor color themes or executable extension features.

## Before changing code

Read [ARCHITECTURE.md](ARCHITECTURE.md) in full before coding, then read the relevant subject documents linked from its Subjects table. Use [the development guide](docs/engineering.md) for build, verification, and release procedures. Keep substantial design subjects in `docs/architecture/`; use the overview's Subjects table for navigation rather than separate directory index pages.

## Working constraints

- Maintain theme artwork in `icons/` as SVG and the shared brand image in root `icon.png`. Builds must not rewrite these inputs. Do not introduce a separate design export pipeline.
- Keep directory and filename declarations as the catalog's source of truth. Put catalog validation in [src/catalog.ts](src/catalog.ts), not separately in each consumer.
- Every dark alias needs an exact common fallback. Review artwork on both light and dark backgrounds; automated checks do not establish visual acceptance.
- Preserve `oneo.smile-theme` as the VS Code extension identity and `smile-icons` as the Zed extension identity. Both packages remain icon-only.
- When changing language coverage, review the explicit Zed mappings in [src/zed.ts](src/zed.ts). Do not assume VS Code language IDs work in Zed.
- Preserve the existing early-validation boundary: catalog failures must leave previous output intact. Do not describe the complete build as transactional.
- Treat `dist/` and the preview workspace as generated output. Regenerate root `preview.png` when artwork changes; do not hand-edit it.
- Keep root PNG images available through Git LFS. README images must resolve both in the repository and in the packaged VS Code extension.
- Use the existing Bun scripts. Run `bun run check` and `bun test` for code or asset changes; also validate packaging when package contents or bundled documentation change.

## Documentation and releases

- Write `AGENTS.md`, `ARCHITECTURE.md`, `docs/`, `README.md`, and `CHANGELOG.md` in English. Write `README.zh-CN.md` in Simplified Chinese and keep both README editions aligned.
- Keep README content at onboarding depth. Architecture documents explain responsibilities, boundaries, and important constraints, not source inventories or implementation diaries.
- Update only affected subjects, the overview, navigation, or usage instructions when reader-needed facts change. An implementation edit alone does not require prose changes.
- Root [CHANGELOG.md](CHANGELOG.md) owns release notes for both editor packages, which share the root package version. Identify the affected editor for platform-specific outcomes.
- Maintain concise, outcome-level `Unreleased` entries alongside completed user-visible changes. Merge related outcomes; omit internal refactors, tests, build maintenance, and routine documentation changes.
- Keep published release notes stable except for factual corrections. Before an authorized release, review shipping scope, move shipping entries into the confirmed version, and retain `Unreleased` with deferred entries or an empty body.
- Keep documentation on the same branch as code. Feature branches edit their own current definitions; merges reconcile documentation, links, and verification claims with the merged implementation.
- Check relative links, Subjects coverage, language parity, and agreement with implementation after documentation changes. No repository-owned documentation checker currently exists; `bun run check` checks TypeScript, not Markdown.
