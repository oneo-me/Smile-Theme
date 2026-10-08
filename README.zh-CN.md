![Smile Icons 图标](icon.png)

# Smile Icons

[English](README.md) | 简体中文

为 VS Code 和 Zed 提供文件与文件夹图标，使用 SVG 资源，支持浅色与深色外观。Smile Icons 仅提供图标主题，不包含编辑器配色主题。

![Smile Icons 预览](preview.png)

## 安装

### VS Code

在扩展面板安装 [Smile Icons](https://marketplace.visualstudio.com/items?itemName=oneo.smile-theme)，或运行：

```sh
code --install-extension oneo.smile-theme
```

在命令面板运行 **首选项: 文件图标主题**（Preferences: File Icon Theme），选择 **Smile Icons**。扩展需要 VS Code 1.80 或更新版本。

### Zed

Zed 扩展尚未上架扩展市场，需要从本地仓库构建安装。准备 Bun 1.4.2 和 Git LFS，克隆仓库后运行：

```sh
git lfs pull
bun install
bun run build
```

在 Zed 扩展面板选择 **Install Dev Extension**，或运行 `zed: install dev extension`，选择 `dist/zed`。随后运行 `icon theme selector: toggle` 并选择 **Smile Icons**。主题族提供适配编辑器外观的浅色与深色变体。

## 参与开发

使用 Bun 1.4.2 和 Git LFS。克隆仓库后运行 `git lfs pull` 和 `bun install`。直接编辑 `icons/` 中的 SVG；分类目录与文件名声明图标关联，`dark/` 子目录存放可选的深色变体。

```sh
bun run build          # 构建两个扩展并重新生成预览
bun run check          # 检查构建工具的 TypeScript 类型
bun test               # 运行自动化测试
bun run package        # 构建并打包两个编辑器的扩展
```

在 VS Code 中按 F5 可构建并打开生成的图标预览工作区。提交图标变更前，请在两个编辑器中分别检查浅色与深色外观。VS Code 使用 VSCE 打包，Zed 打包需要系统提供 `tar`。

修改代码前，请完整阅读英文 [ARCHITECTURE.md](https://github.com/oneo-me/Smile-Theme/blob/main/ARCHITECTURE.md) 了解系统概览，再通过其中的 Subjects 表阅读资源约定、编辑器差异及开发与发布流程。

### 反馈缺失图标

新建反馈前请先查看已有 [Issues](https://github.com/oneo-me/Smile-Theme/issues)。请提供受影响的编辑器、文件名或后缀示例、目录名或 VS Code 语言 ID；如有相关项目或图标参考，也可一并附上。

## 许可证

[MIT](LICENSE)
