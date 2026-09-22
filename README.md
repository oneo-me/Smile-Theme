<p align="center">
  <img src="icon.png" alt="Smile Icons" width="128" height="128">
</p>

# Smile Icons

English | [简体中文](README.zh-CN.md)

File and folder icons for VS Code and Zed, maintained as SVG, with light mode variants. Version 2.0 includes icons only, without editor color themes.

![Smile Icons preview](preview.png)

## Installation

### VS Code

In VS Code, open the Extensions view, search for `oneo.smile-theme`, and install [Smile Icons](https://marketplace.visualstudio.com/items?itemName=oneo.smile-theme). Alternatively, run:

```sh
code --install-extension oneo.smile-theme
```

In VS Code, run **Preferences: File Icon Theme** from the Command Palette and select **Smile Icons**.

### Zed

Smile Icons is not in the Zed extension registry yet, so it is installed from a local build. Build a checkout first, which requires Bun 1.4.2 or later:

```sh
bun install
bun run build
```

In Zed, open the extensions page and click **Install Dev Extension**, or run `zed: install dev extension` from the Command Palette, and select `dist/zed`. Then run `icon theme selector: toggle` and select **Smile Icons**; the dark and light variants follow the editor appearance.

## Contributing

### Design and develop icons

Requires Bun 1.4.2 or later. Edit SVG files directly in `icons/<category>/`; filenames without `.svg` declare space-separated aliases. Categories are `default`, `extensions`, `files`, `folders`, and `languages`, and `dark/` holds dark mode variants.

```sh
bun install
bun run build          # Build both extensions in dist/
bun run package        # Build and package both extensions into dist/
bun run package:vscode # Build and package the VS Code extension into dist/
bun run package:zed    # Build and package the Zed icon theme into dist/
```

For development, press F5 in VS Code to build and open the icon preview workspace. Run `bun run check` and `bun test` to validate the project.

### Report missing icons

If a file type, filename, folder, or language is missing an icon, check existing [Issues](https://github.com/oneo-me/Smile-Theme/issues) and open one if needed. Include example filenames or extensions, the folder name or VS Code language ID, and a link to the relevant project or an icon reference if available.

## Copyright

[MIT](LICENSE)
