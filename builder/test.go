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

	fmt.Println("🏖 ", "界面可替换颜色")
	{
		fmt.Println()
		fmt.Println(strings.Join(vscode.LoadTheme(file.Abs("./other/theme.json")).GetColorsHex(), " "))
		fmt.Println()
	}
	fmt.Println("🌃 ", "暗色界面可替换代码颜色")
	{
		fmt.Println()
		fmt.Println(strings.Join(vscode.GetDefaultDarkTheme().GetTokenColorsHex(), " "))
		fmt.Println()
	}
	fmt.Println("🌇 ", "亮色界面可替换代码颜色")
	{
		fmt.Println()
		fmt.Println(strings.Join(vscode.GetDefaultLightTheme().GetTokenColorsHex(), " "))
		fmt.Println()
	}

	extensions := vscode.GetExtensions()
	icons := make(map[string][]string)
	{
		getIcons := func(dirName string) {
			file.Each(path.Join(file.Abs("./icons"), dirName), false, func(p string) {
				icons[dirName] = append(icons[dirName], file.NameNotExt(p))
			})
		}
		getIcons("default")
		getIcons("languages")
		getIcons("folders")
		getIcons("files")
		getIcons("extensions")
	}

	fmt.Println("🦁 ", "检查是否有必要的图标没有覆盖")
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

	fmt.Println("🌋 ", "检查被覆盖的图标（相当于替换了语言的通用图标）")
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

	fmt.Println("🐤 ", "检查重复的图标（完全不能重复）")
	{
		fmt.Println()

		// 文件名 => 目录
		errorIcons := make(map[string][]string)

		for k, ns := range icons {
			for _, n := range ns {
				for ck, cns := range icons {
					if ck != k {
						for _, cn := range cns {
							if cn == n {
								errorIcons[n] = append(errorIcons[n], ck)
							}
						}
					}
				}
			}
		}
		for k, vs := range errorIcons {
			fmt.Println(k + ".png")
			fmt.Println(strings.Join(vs, " "))
			fmt.Println()
		}

		fmt.Println()
	}
}
