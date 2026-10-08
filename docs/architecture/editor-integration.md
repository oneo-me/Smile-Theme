# Editor Integration

Both adapters consume the same validated catalog and appearance model, but translate it into different editor contracts. See [Assets and appearance](assets.md) for shared source and fallback rules.

## VS Code

[The VS Code adapter](../../src/themes.ts) emits one icon theme: its base associations include dark overrides, while its light section uses common artwork. Path-based aliases are folded to lowercase before overrides. Language IDs retain their declared spelling.

Named folders without expanded artwork retain their collapsed icon when expanded. Optional workspace-root artwork falls back to ordinary folder artwork when absent; exact fallback precedence is defined in the adapter.

The extension preserves the published identity `oneo.smile-theme`, declares compatibility with VS Code `^1.80.0`, and contributes only an icon theme. VS Code understands language IDs and workspace roots directly; no runtime adapter is installed.

Contract reference: [VS Code file icon themes](https://code.visualstudio.com/api/extension-guides/file-icon-theme).

## Zed

[The Zed adapter](../../src/zed.ts) emits a family with dark and light themes under extension identity `smile-icons`. It preserves declared alias spelling rather than applying VS Code's lowercase transformation.

Zed resolves file icons through filename and suffix associations, not VS Code language IDs. An explicit adapter-owned mapping translates language artwork into those associations; absent artwork contributes no mapping. Review this mapping when adding or renaming a language icon. The catalog owns artwork declarations, while the adapter owns this compatibility translation.

Filename and suffix declarations must not assign the same key to different icons. Conflicts fail generation rather than silently choosing an icon. Named directories pair collapsed and expanded artwork, falling back to collapsed artwork when needed.

Zed has no workspace-root icon slot. The adapter includes all catalog definitions and copies all assets, even when no association reaches them. The build reports unreachable artwork; it does not prune it. This includes project-root artwork and the language-level skill icon, while `SKILL.md` is handled by its filename association.

The extension includes the shared brand PNG, but its manifest does not declare a brand-image field. Including that file does not establish that Zed will display it in the extension list.

The documented installation route uses the built directory as a development extension, not the extension registry. Its tar archive is not a registry publication.

Contract reference: [Zed icon theme schema](https://zed.dev/schema/icon_themes/v0.3.0.json).
