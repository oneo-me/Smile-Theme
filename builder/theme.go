package main

import (
	"path"
)

import (
	"fmt"

	"github.com/1217950746/fastjson"
	"github.com/1217950746/fastpath"
)

// SmileColors 简化的配色
type SmileColors struct {
	Background string
	Foreground string
	Border     string
	Link       string
	Success    string
	Error      string
	Warning    string
	Info       string
}

// SmileTokenColors 简化的代码配色
type SmileTokenColors struct {
	Background string
	Foreground string
	Border     string
	Link       string
	Success    string
	Error      string
	Warning    string
	Info       string
}

// SmileTheme 简化的主题
type SmileTheme struct {
	Colors      SmileColors
	TokenColors SmileTokenColors
}

// GenThemes 生成主题
func GenThemes() {
	themes := path.Join(src, "themes")
	fastpath.ForEach(themes, false, func(file string, isFile bool) bool {
		if isFile {
			println(file)
			theme := SmileTheme{}
			if err := fastjson.LoadFile(file, &theme); err != nil {
				panic(err)
			}
			fastjson.Save(file, theme, true)
			fmt.Println(theme)
		}
		return false
	})
}
