<p align="center">
  <img src="extension/icon.png" alt="Smile Icons" width="128" height="128">
</p>

# Smile Icons

[English](README.md) | 简体中文

为 VS Code 提供文件和目录图标，使用 Sketch 设计，支持浅色模式图标。2.0 仅包含图标，不提供编辑器配色主题。

![Smile Icons 预览](preview.png)

## 安装

按下方[参与开发](#参与开发)中的方法生成 VSIX，然后安装：

```sh
code --install-extension dist/smile-theme-2.0.0.vsix
```

在 VS Code 命令面板中运行 **首选项: 文件图标主题**（Preferences: File Icon Theme），选择 **Smile Icons**。

## 参与开发

### 设计与开发

需要 macOS、Sketch 和 Bun 1.4.2 或更新版本。在 `design.sketch` 中新增或完善图标，遵循现有页面与图层命名方式，并为新增图标图层配置导出格式。构建时会自动导出图标，并重新生成透明背景的 `preview.png`，通用图标去重后每行展示 15 个。请修改 Sketch 源文件，直接修改导出的图片会在构建时被覆盖。

```sh
bun install
bun run build          # 构建扩展到 dist/vscode
bun run package:vscode # 构建并打包 dist/smile-theme-2.0.0.vsix
```

开发时运行 `bun run dev` 监听变更，或在 VS Code 中按 F5 构建并打开图标预览工作区。运行 `bun run check` 和 `bun test` 检查项目。

### 反馈缺失图标

发现尚未支持的文件类型、文件名、目录或语言图标时，先查看已有 [Issues](https://github.com/oneo-me/Smile-Theme/issues)，没有相关反馈即可新建。请提供文件名或后缀示例、目录名或 VS Code 语言 ID；如有相关项目链接或图标参考，也可一并附上。

## 版权

[MIT](LICENSE)
