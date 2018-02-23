package main

import (
	"path"

	. "./color"
	"./file"
	"./vscode"
)

// Theme 主题
type Theme struct {
	File        string
	Colors      map[string]*Color
	TokenColors map[string]*Color
}

// HasUIColor 存在这个 UI 颜色
func (t Theme) HasUIColor(color string) bool {
	for k := range t.Colors {
		if k == color {
			return true
		}
	}
	return false
}

// HasCodeColor 存在这个 Code 颜色
func (t Theme) HasCodeColor(color string) bool {
	for k := range t.TokenColors {
		if k == color {
			return true
		}
	}
	return false
}

// Themes 全部主题
var Themes = []Theme{
	Theme{
		File: "dark.json",
		Colors: map[string]*Color{
			"背景颜色":        HEX("1C1F26"),
			"文本颜色":        HEX("8991A5"),
			"文本颜色_次要":     HEX("8991A5").Opacity(50),
			"边框颜色":        HEX("8991A5").Opacity(20),
			"组件背景颜色":      HEX("1C1F26").AlphaBlend(HEX("8991A5").Opacity(20)),
			"边框颜色_不透明":    HEX("1C1F26").AlphaBlend(HEX("8991A5").Opacity(20)),
			"选择文本背景颜色_选择": HEX("8991A5").Opacity(30),
			"链接颜色":        HEX("54D0FF"),
			"正确颜色":        HEX("1FA032"),
			"正确颜色_透明":     HEX("1FA032").Opacity(15),
			"错误颜色":        HEX("D24741"),
			"错误颜色_透明":     HEX("D24741").Opacity(15),
			"警告颜色":        HEX("D29C23"),
			"信息颜色":        HEX("4985BD"),
			"信息文本颜色":      HEX("FFFFFF"),
			"选项卡移入背景颜色":   HEX("8991A5").Opacity(4),
			"选项卡选中背景颜色":   HEX("8991A5").Opacity(7),
			"阴影颜色":        HEX("000000").Opacity(10),
			"文本颜色_代码":     HEX("D4D4D4"),
		},
		TokenColors: map[string]*Color{
			"#D4D4D4": HEX("D4D4D4"),
			"#608B4E": HEX("608B4E"),
			"#C586C0": HEX("C586C0"),
			"#4EC9B0": HEX("4EC9B0"),
			"#CE9178": HEX("CE9178"),
			"#B5CEA8": HEX("B5CEA8"),
			"#D7BA7D": HEX("D7BA7D"),
			"#808080": HEX("D4D4D4").Opacity(50),
			"#D16969": HEX("D16969"),
			"#6796E6": HEX("569CD6"),
			"#DCDCAA": HEX("DCDCAA"),
			"#569CD6": HEX("569CD6"),
			"#9CDCFE": HEX("9CDCFE"),
			"#000080": HEX("000080"),
			"#646695": HEX("646695"),
			"#F44747": HEX("F44747"),
		},
	},
	Theme{
		File: "light.json",
		Colors: map[string]*Color{
			"背景颜色":        HEX("FFFFFF"),
			"文本颜色":        HEX("5F6573"),
			"文本颜色_次要":     HEX("5F6573").Opacity(50),
			"边框颜色":        HEX("5F6573").Opacity(20),
			"组件背景颜色":      HEX("FFFFFF").Darken(0.03),
			"边框颜色_不透明":    HEX("FFFFFF").AlphaBlend(HEX("5F6573").Opacity(20)),
			"选择文本背景颜色_选择": HEX("5F6573").Opacity(30),
			"链接颜色":        HEX("109FD7"),
			"正确颜色":        HEX("1FA032"),
			"正确颜色_透明":     HEX("1FA032").Opacity(15),
			"错误颜色":        HEX("D24741"),
			"错误颜色_透明":     HEX("D24741").Opacity(15),
			"警告颜色":        HEX("D29C23"),
			"信息颜色":        HEX("4985BD"),
			"信息文本颜色":      HEX("FFFFFF"),
			"选项卡移入背景颜色":   HEX("5F6573").Opacity(4),
			"选项卡选中背景颜色":   HEX("5F6573").Opacity(7),
			"阴影颜色":        HEX("000000").Opacity(10),
			"文本颜色_代码":     HEX("333333"),
		},
		TokenColors: map[string]*Color{
			"#D4D4D4": HEX("333333"),
			"#608B4E": HEX("2B6E0F"),
			"#C586C0": HEX("9A4293"),
			"#4EC9B0": HEX("119479"),
			"#CE9178": HEX("A65736"),
			"#B5CEA8": HEX("4E8D2D"),
			"#D7BA7D": HEX("AC7B15"),
			"#808080": HEX("333333").Opacity(50),
			"#D16969": HEX("972424"),
			"#6796E6": HEX("1F6096"),
			"#DCDCAA": HEX("8B8B13"),
			"#569CD6": HEX("1F6096"),
			"#9CDCFE": HEX("137DB5"),
			"#000080": HEX("000080"),
			"#646695": HEX("646695"),
			"#F44747": HEX("F44747"),
		},
	},
}

// GenThemes 生成主题
func GenThemes() {
	for _, theme := range Themes {
		// 模版
		templateTheme := vscode.LoadTheme(file.Abs("./other/theme.json"))
		templateTheme.TokenColors = vscode.GetDefaultDarkTheme().TokenColors
		// 修改
		for k, v := range theme.Colors {
			for tk, tv := range templateTheme.Colors {
				if tv == k {
					templateTheme.Colors[tk] = v.HEX()
				}
			}
		}
		for k, v := range theme.TokenColors {
			for _, tv := range templateTheme.TokenColors {
				if tv.Settings.Foreground == k {
					tv.Settings.Foreground = v.HEX()
				}
			}
		}
		// 保存
		file.SaveJSONFile(templateTheme, path.Join(file.Abs("./themes"), theme.File))
	}
}
