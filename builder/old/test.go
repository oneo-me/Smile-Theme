package main

import (
	"fmt"
	"path"
	"strings"

	"./file"
	"./vscode"
)

// Test 内容测试
func Test() {

	fmt.Println("🌃", "", "检查主题颜色是否替换")
	{
		fmt.Println()
		uiColors := vscode.LoadTheme(file.Abs("./other/theme.json")).GetColorsHex()
		codeColors := vscode.GetDefaultDarkTheme().GetTokenColorsHex()
		for _, theme := range Themes {
			fmt.Println(theme.File)
			for _, color := range uiColors {
				if !theme.HasUIColor(color) {
					fmt.Println(color)
				}
			}
			for _, color := range codeColors {
				if !theme.HasCodeColor(color) {
					switch color {
					case "#D4D4D4":
						fmt.Println(color, "等同于 文本颜色_代码")
					case "#608B4E":
						fmt.Println(color, "注释")
					case "#C586C0":
						fmt.Println(color, "关键字")
					case "#4EC9B0":
						fmt.Println(color, "类型")
					case "#CE9178":
						fmt.Println(color, "字符串")
					case "#B5CEA8":
						fmt.Println(color, "数值")
					case "#D7BA7D":
						fmt.Println(color, "转义符")
					case "#808080":
						fmt.Println(color, "HTML标签 < >")
					case "#D16969":
						fmt.Println(color, "正则表达式")
					case "#6796E6":
						fmt.Println(color, "Markdown 列表符号")
					case "#DCDCAA":
						fmt.Println(color, "方法名称")
					case "#569CD6":
						fmt.Println(color, "方法关键字")
					case "#9CDCFE":
						fmt.Println(color, "变量")
					default:
						fmt.Println(color, "未知位置")
					}
				}
			}
		}
		fmt.Println()
	}

	extensions := vscode.GetExtensions()
	icons := make(map[string][]string)
	for _, dirName := range []string{"default", "languages", "files", "folders", "extensions"} {
		file.Each(path.Join(file.Abs("./icons"), dirName), false, func(p string) {
			icons[dirName] = append(icons[dirName], file.NameNotExt(p))
		})
	}

	fmt.Println("🌠", "", "检查是否有必要的图标没有覆盖")
	{
		fmt.Println()

		noIcons := make(map[string][]string)

		// 默认的几个是否存在
		for _, icon := range []string{"file", "folder", "folder.expanded", "project", "project.expanded"} {
			has := false
			for _, n := range icons["default"] {
				if n == icon {
					has = true
					break
				}
			}
			if !has {
				noIcons["default"] = append(noIcons["default"], icon)
			}
		}

		// 语言图标是否存在
		for k := range extensions {
			has := false
			for _, n := range icons["languages"] {
				if n == k {
					has = true
					break
				}
			}
			if !has {
				noIcons["languages"] = append(noIcons["languages"], k+".png")
			}
		}

		// 输出
		for k, vs := range noIcons {
			fmt.Println(k)
			fmt.Println(strings.Join(vs, " "))
			fmt.Println()
		}

		fmt.Println()
	}

	fmt.Println("🏞", "", "检查被覆盖的图标（相当于替换了语言的通用图标）")
	{
		fmt.Println()

		coverIcons := make(map[string][]string)

		for k, vs := range extensions {
			for _, v := range vs {
				for _, n := range []string{"files", "folders", "extensions"} {
					for _, i := range icons[n] {
						if i == v {
							coverIcons[k] = append(coverIcons[k], n+"/"+i+".png")
						}
					}
				}
			}
		}
		for k, vs := range coverIcons {
			fmt.Println(k)
			fmt.Println(strings.Join(vs, " "))
			fmt.Println()
		}

		fmt.Println()
	}
}
