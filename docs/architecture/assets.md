# Assets and Appearance

## Source ownership

Theme artwork lives in `icons/` as SVG. Its directory chooses the matching scope; its filename, without `.svg`, declares whitespace-separated aliases. This keeps coverage with the artwork rather than maintaining a second general-purpose mapping database.

Use `extensions/` for suffixes without a leading dot, `files/` for complete filenames, `folders/` for named directories, and `languages/` for VS Code language IDs. `default/` supplies unmatched file and folder artwork and optional expanded-folder and workspace-root artwork. A folder alias ending in `_expanded` describes its expanded state.

For example, `extensions/png jpg.svg` declares two suffixes, while `files/Cargo.toml.svg` targets a complete filename. Quote paths containing spaces in shell commands. Exact validation rules belong to [the catalog implementation](../../src/catalog.ts) and [its tests](../../tests/icons.test.ts), not a parallel documentation schema.

The parser also accepts PNG, but repository theme artwork is maintained as SVG. Root `icon.png` is a separate brand asset copied unchanged into both packages, not an association-bearing catalog entry. PNG files use [Git LFS](../../.gitattributes); SVG files are ordinary versioned text.

## Appearance and alias invariants

Common artwork lives directly under its category and must be legible on light and dark backgrounds. A category's `dark/` directory holds overrides for aliases that need a different treatment. Dark appearance overlays these variants on the common catalog; light appearance uses only common artwork.

Every dark alias requires an exact common alias. Overrides apply per alias rather than replacing every alias on the original file, so a variant can refine only part of a shared association.

Aliases cannot be claimed by different assets in the same category and appearance, even when only their case differs. A single asset may explicitly carry different case spellings. Conflict detection does not mean both editors perform case-insensitive matching: each adapter decides how to emit aliases.

Required common file and folder icons guarantee a fallback for unmatched items. Unsupported layouts, conflicting declarations, missing fallbacks, LFS pointers, and basic format failures stop catalog loading. Content checks are lightweight rather than a complete SVG validator; successful catalog loading does not prove every asset will render correctly.

## Visual direction

Use recognizable silhouettes, consistent rounded shapes, and language or tool brand colors. File artwork generally uses a rounded colored plate with a contrasting glyph; folders share a consistent folder shape. Maintain balanced padding and transparent backgrounds, and avoid decorative effects that obscure recognition at explorer sizes.

These are design goals, not automated accessibility guarantees. Check glyphs, outlines, clipping, and contrast in both appearances. File and folder names remain the primary textual identifiers; the theme supplements them.
