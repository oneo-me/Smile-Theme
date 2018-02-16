package main

import (
	"path"
	"strings"

	"./file"
	"./vscode"
)

// Colors 颜色
type Colors struct {
	Background     string
	Foreground     string
	Border         string
	Shadow         string
	CodeForeground string
}

// GenTheme 生成主题
func GenTheme(filename string, dark bool, colors Colors) {
	// 每次编译都要抓取 VSCode 默认的代码配色
	// 为什么抓取默认的？
	// 自己一个个实现很麻烦，VSCode 默认的配色已经很完美了
	// 抓取的也只是配色方案，实际颜色也可以通过很简单的方式给替换掉
	var defTheme *vscode.Theme
	if dark {
		defTheme = vscode.GetDefaultDarkTheme()
	} else {
		defTheme = vscode.GetDefaultLightTheme()
	}
	templateTheme := vscode.LoadTheme(file.Abs("./other/theme.json"))
	// 获取默认配色
	templateTheme.TokenColors = defTheme.TokenColors
	// 替换界面颜色
	for k, v := range templateTheme.Colors {
		// 此处代码应该更美
		// 此处应该添加更多内容
		nv := v
		nv = strings.Replace(nv, "#1C1F26", colors.Background, -1)
		nv = strings.Replace(nv, "#8991A5", colors.Foreground, -1)

		// 想个办法计算出这个颜色，这个颜色实际计算方式（背景 + 前景15%透明度）即为边框颜色（因为有几个地方不能用透明的，所以需要一个实色的）
		nv = strings.Replace(nv, "#2C3039", colors.Border, -1)

		nv = strings.Replace(nv, "#00000026", colors.Shadow, -1)
		nv = strings.Replace(nv, "#D5D5D5", colors.CodeForeground, -1)
		templateTheme.Colors[k] = nv
	}
	// 替换代码颜色
	for _, v := range templateTheme.TokenColors {
		nv := v.Settings.Foreground
		if dark {
			// 未实现，暂时不管
		} else {
			// 未实现，暂时不管
		}
		v.Settings.Foreground = nv
	}
	// 保存
	file.SaveJSONFile(templateTheme, path.Join(file.Abs("./themes"), filename))
}

// GenThemes 生成全部主题
func GenThemes() {
	GenTheme("dark.json", true, Colors{
		Background:     "#1C1F26",
		Foreground:     "#8991A5",
		Border:         "#2C3039",
		Shadow:         "#00000026",
		CodeForeground: "#D5D5D5",
	})
	GenTheme("light.json", false, Colors{
		Background:     "#ffffff",
		Foreground:     "#333333",
		Border:         "#F6F6F6",
		Shadow:         "#00000026",
		CodeForeground: "#333333",
	})
}
