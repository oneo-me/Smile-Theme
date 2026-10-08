![Smile Icons logo](icon.png)

# Smile Icons

English | [简体中文](README.zh-CN.md)

File and folder icons for VS Code and Zed, with SVG artwork and light and dark appearances. Smile Icons is an icon theme only; it does not include editor color themes.

![Smile Icons preview](preview.png)

## Installation

### VS Code

Install [Smile Icons](https://marketplace.visualstudio.com/items?itemName=oneo.smile-theme) from the Extensions view, or run:

```sh
code --install-extension oneo.smile-theme
```

Run **Preferences: File Icon Theme** from the Command Palette and select **Smile Icons**. The extension requires VS Code 1.80 or later.

### Zed

The Zed extension is not in the extension registry yet. Install from a local checkout using Bun 1.4.2 and Git LFS:

```sh
git lfs pull
bun install
bun run build
```

In Zed, choose **Install Dev Extension** on the extensions page, or run `zed: install dev extension`, and select `dist/zed`. Then run `icon theme selector: toggle` and select **Smile Icons**. The theme family provides light and dark variants for the editor appearance.

## Contributing

Use Bun 1.4.2 and Git LFS. After cloning, run `git lfs pull` and `bun install`. Edit SVG artwork directly in `icons/`; categories and filenames declare icon associations, and `dark/` subdirectories hold optional dark variants.

```sh
bun run build          # Build both extensions and regenerate previews
bun run check          # Type-check the build tools
bun test               # Run automated tests
bun run package        # Build and package both editors
```

For VS Code review, press F5 to build and open the generated icon preview workspace. Check both appearances in each editor before submitting artwork changes. Packaging uses VSCE for VS Code and requires system `tar` for Zed.

Before changing code, read [ARCHITECTURE.md](https://github.com/oneo-me/Smile-Theme/blob/main/ARCHITECTURE.md) for the system overview, then follow its Subjects table for asset conventions, editor differences, and development and release procedures.

### Report missing icons

Check existing [Issues](https://github.com/oneo-me/Smile-Theme/issues) before opening a new one. Include the affected editor, example filenames or suffixes, folder names or VS Code language IDs, and a relevant project or icon reference when available.

## License

[MIT](LICENSE)
