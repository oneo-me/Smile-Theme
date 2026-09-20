<p align="center">
  <img src="extension/icon.png" alt="Smile Icons" width="128" height="128">
</p>

# Smile Icons

English | [简体中文](README.zh-CN.md)

File and folder icons for VS Code, designed in Sketch, with light mode variants. Version 2.0 includes icons only, without editor color themes.

![Smile Icons preview](preview.png)

## Installation

In VS Code, open the Extensions view, search for `oneo.smile-theme`, and install [Smile Icons](https://marketplace.visualstudio.com/items?itemName=oneo.smile-theme). Alternatively, run:

```sh
code --install-extension oneo.smile-theme
```

In VS Code, run **Preferences: File Icon Theme** from the Command Palette and select **Smile Icons**.

## Contributing

### Design and develop icons

Requires macOS, Sketch, and Bun 1.4.2 or later. Edit `design.sketch` to add or improve icons, following the existing page and layer naming conventions, and enable export for new icon layers. Builds automatically export icons and regenerate the transparent `preview.png`, showing unique common icons in rows of 15. Edit the Sketch source rather than the exported images, which are replaced during builds.

```sh
bun install
bun run build          # Build the extension in dist/vscode
bun run package:vscode # Build and package dist/smile-theme-2.0.0.vsix
```

For development, run `bun run dev` to watch for changes, or press F5 in VS Code to build and open the icon preview workspace. Run `bun run check` and `bun test` to validate the project.

### Report missing icons

If a file type, filename, folder, or language is missing an icon, check existing [Issues](https://github.com/oneo-me/Smile-Theme/issues) and open one if needed. Include example filenames or extensions, the folder name or VS Code language ID, and a link to the relevant project or an icon reference if available.

## Copyright

[MIT](LICENSE)
