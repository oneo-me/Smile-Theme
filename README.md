<p align="center">
  <img src="icon.svg" alt="Smile Icons" width="128" height="128">
</p>

# Smile Icons

English | [简体中文](README.zh-CN.md)

File and folder icons for VS Code, maintained as SVG, with light mode variants. Version 2.0 includes icons only, without editor color themes.

![Smile Icons preview](preview.png)

## Installation

In VS Code, open the Extensions view, search for `oneo.smile-theme`, and install [Smile Icons](https://marketplace.visualstudio.com/items?itemName=oneo.smile-theme). Alternatively, run:

```sh
code --install-extension oneo.smile-theme
```

In VS Code, run **Preferences: File Icon Theme** from the Command Palette and select **Smile Icons**.

## Contributing

### Design and develop icons

Requires Bun 1.4.2 or later. Edit SVG files directly in `icons/<category>/`; filenames without `.svg` declare space-separated aliases, and `light/` contains light mode variants. Categories are `default`, `extensions`, `files`, `folders`, and `languages`. Builds use these SVGs directly and regenerate the transparent `preview.png`, showing unique common icons in rows of 15.

```sh
bun install
bun run build          # Build the extension in dist/vscode
bun run package:vscode # Build and package dist/smile-theme-2.0.2.vsix
```

For development, press F5 in VS Code to build and open the icon preview workspace. Run `bun run check` and `bun test` to validate the project.

### Report missing icons

If a file type, filename, folder, or language is missing an icon, check existing [Issues](https://github.com/oneo-me/Smile-Theme/issues) and open one if needed. Include example filenames or extensions, the folder name or VS Code language ID, and a link to the relevant project or an icon reference if available.

## Copyright

[MIT](LICENSE)
