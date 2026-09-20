# Smile Icons

为 **VS Code** 提供文件、目录图标，使用 **Bun + TypeScript** 构建，以 **VS Code** 为主要开发工具。2.0 只包含图标，不再提供编辑器配色主题。

设计源文件为 `design.sketch`。PNG 图标保存在 `extension/icons/`；开发、构建和打包均先从设计稿导出，需要 macOS + Sketch。

## 开发

安装 Bun 1.4.2 或更新版本，安装 Sketch，然后在 VS Code 中打开本项目：

```sh
bun install
bun run build
bun run check
bun test
```

通过 VS Code 的 Run Build Task 执行构建，或在终端运行以下命令：

```sh
bun run dev                 # 启动时导出并构建，监听 design.sketch 和构建源文件后自动重建
bun run export              # 从 design.sketch 重新导出图标，需要 macOS + Sketch
bun run build               # 导出设计稿，再生成 dist/vscode 扩展
bun run package:vscode      # 导出、构建并打包 dist/smile-theme-2.0.0.vsix
```

监听模式串行执行导出和构建，不监听生成的 `extension/icons/` 和 `dist/`，避免循环构建。导出失败时保留已有资源和扩展产物；修正后再次保存即可重试。更新磁盘产物后，VS Code 开发窗口需要 Reload Window。

## 目录结构

```text
design.sketch                Sketch 设计源文件
extension/
  icon.png                   VS Code 扩展展示图标
  icons/                     导出资源，纳入 Git LFS
    default/                 默认文件、目录、项目图标
    extensions/              文件后缀
    files/                   完整文件名
    folders/                 目录名
    languages/               VS Code 语言 ID
    <分类>/light/             该分类的浅色模式覆盖
src/
  catalog.ts                 命名解析、重复与回退检查
  themes.ts                  VS Code 图标主题生成
  export-sketch.ts            Sketch 导出
  build.ts                   先导出设计稿，再构建扩展清单与资源
  preview.ts                 按图标关联生成 VS Code 预览工作区
  dev.ts                     文件监听
  package-vscode.ts          VSIX 打包
.vscode/                     VS Code 扩展调试配置
tests/                       关联、回退、真实资源与开发流程测试
dist/                        自动生成，不提交
  preview/                   全部图标的调试样例、工作区及语言声明扩展
  vscode/                    VS Code 扩展根目录
```

## 图标命名

图标格式支持 `.png` 和 `.svg`，Sketch 自动导出使用 3× PNG。空格分隔多个关联名称，只移除最后的图片扩展名。同一张图允许声明仅大小写不同的别名，例如 `license license.txt LICENSE.png`；完全相同的别名不能重复。一个分类、一个模式内，不同图片的名称不能在忽略大小写后冲突，也不能同时用 PNG 和 SVG 定义同一个名称。

| 资源路径 | 作用 |
| --- | --- |
| `default/file.png` | 默认文件图标，必需 |
| `default/folder.png` | 默认目录图标，必需 |
| `default/folder_expanded.png` | 展开目录，缺省使用 folder |
| `default/project.png` | VS Code 工作区根目录，缺省使用 folder |
| `default/project_expanded.png` | 展开根目录，缺省使用 project 或目录图标 |
| `extensions/png jpg jpeg.png` | 匹配多个后缀；不写前导点 |
| `files/webpack.config.js.png` | 匹配完整文件名，保留文件名中的点 |
| `files/license license.txt LICENSE.png` | 一张图片关联三个明确的文件名，保留大小写 |
| `folders/.git.png` | 匹配目录 `.git` |
| `folders/.git_expanded.png` | 匹配展开的 `.git`，`_expanded` 是保留后缀 |
| `languages/bat shellscript.png` | 对应多个 VS Code 语言 ID |
| `languages/light/bat shellscript.png` | 仅浅色模式替换上述语言图标 |

**通用图标用于所有模式。** 每个分类中的 `light/` 仅覆盖其中列出的名称，未覆盖的名称继续使用通用版本。浅色图标必须有同名的通用关联；允许仅覆盖一组别名中的一部分，例如通用 `extensions/js jsx.png` 搭配 `extensions/light/js.png`。没有展开图标的具名目录使用其关闭图标。

VS Code 的文件名、目录名和后缀关联不区分大小写，构建时合并这些别名，再应用浅色覆盖。例如 `files/light/license.png` 会覆盖该文件名的所有大小写写法。Sketch 中只需将一个可导出图层命名为 `license license.txt LICENSE`。

## 从 Sketch 导出

继续使用设计稿现有的页面和图层命名方式：

- 页面名称：`默认图标 | extension/icons/default`，或其他四个分类的相应路径。
- 图层名称：`file`、`png jpg jpeg`、`.git_expanded` 等。
- 浅色图层：`light/file`、`light/bat shellscript` 等。
- 需要导出的图层必须在 Sketch 中配置 Export 格式。

`bun run export` 读取页面和可导出图层，通过图层 ID 调用 Sketch CLI，统一导出 3× PNG，再恢复分类和名称。导出和校验全部成功后，才整体替换 `extension/icons/`；已从设计稿删除的图标会从资源目录移除。手动放入的 SVG/PNG 若不在设计稿中，也会在重新导出时被移除。不要直接修改 `dist/`。

导出只处理这五类图标页面，忽略配色设计页、预览和扩展展示图标。原设计稿中的历史配色页面保留作为设计资料，不进入构建产物。

Sketch 安装在其他位置时：

```sh
SKETCHTOOL="/path/to/Sketch.app/Contents/Resources/sketchtool/bin/sketchtool" bun run export
bun run export ./another.sketch
```

## 在 VS Code 中验证

在本项目按 F5，会先导出并构建，再打开 `dist/preview/smile-icons.code-workspace`，同时加载 `dist/vscode/` 扩展和仅用于预览的语言声明扩展。工作区自动选择 **Smile Icons**，按以下目录展示样例：

- `defaults`：未匹配文件、普通目录；各工作区根目录用于检查项目图标。
- `extensions`：每个后缀的文件样例。
- `files`：完整文件名样例，大小写别名按 VS Code 的匹配规则合并。
- `folders`：每个具名目录及子文件，可展开、折叠检查两种状态；包括 `.git`、`.vscode` 和 `node_modules`。
- `languages`：每个语言 ID 的独立样例，避免文件名或后缀图标覆盖语言图标。预览扩展通过 [语言贡献点](https://code.visualstudio.com/api/references/contribution-points#contributes.languages) 注册这些样例，不需要另装语言扩展。

切换任意浅色、深色配色主题，检查浅色覆盖和通用图标；展开、折叠普通目录、具名目录及工作区根目录。图标显示、明暗切换和展开效果待用户验证。

`build` 和 `dev` 均同步更新预览工作区。该目录是生成产物，不要在其中保存自己的文件；重新构建后在开发窗口执行 Reload Window，新增语言声明时重新启动调试。预览样例和语言声明扩展不包含在 VSIX 中。

安装构建好的包：

```sh
bun run package:vscode
code --install-extension dist/smile-theme-2.0.0.vsix
```

扩展身份仍为 `oneo.smile-theme`，图标主题 ID 仍为 `smile-icons`，便于升级已安装的 1.2.0。如果此前使用 Smile 的配色主题，请选择其他配色主题；2.0 不再注册旧的 Smile Light/Dark 配色。

## 验证与参考

`bun test` 覆盖多名称解析、浅色覆盖、目录展开回退、真实 Sketch 与导出资源一致性、扩展资源引用、预览样例及自动导出构建流程。它不替代 VS Code 中的实际显示验收。

- [VS Code 文件图标主题](https://code.visualstudio.com/api/extension-guides/file-icon-theme)
