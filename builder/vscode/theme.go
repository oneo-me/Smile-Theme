package vscode

import (
	"main/builder/fast"
	"path"
	"strings"
)

// Theme 主题
type Theme struct {
	Schema      string            `json:"$schema,omitempty"`
	Colors      map[string]string `json:"colors,omitempty"`
	TokenColors []*TokenColor     `json:"tokenColors,omitempty"`
}

// TokenColor 代码高亮配色方案
type TokenColor struct {
	Scope    interface{}        `json:"scope,omitempty"`
	Settings TokenColorSettings `json:"settings,omitempty"`
}

// TokenColorSettings 代码高亮设置
type TokenColorSettings struct {
	Foreground string `json:"foreground,omitempty"`
	FontStyle  string `json:"fontStyle,omitempty"`
}

// NewTheme 初始化主题
func NewTheme() *Theme {
	t := new(Theme)
	t.Schema = "vscode://schemas/color-theme"
	t.Colors = make(map[string]string)
	return t
}

func loadTheme(fs ...string) *Theme {
	r := NewTheme()
	for _, f := range fs {
		t := new(Theme)
		fast.ReadJSONFile(f, t)
		for k, v := range t.Colors {
			r.Colors[k] = strings.ToUpper(v)
		}
		for _, s := range t.TokenColors {
			s.Settings.Foreground = strings.ToUpper(s.Settings.Foreground)
			r.TokenColors = append(r.TokenColors, s)
		}
	}
	return r
}

func loadDefTheme(ns ...string) *Theme {
	d := getCodeDir("extensions/theme-defaults/themes")
	ds := []string{}
	for _, n := range ns {
		ds = append(ds, path.Join(d, n))
	}
	return loadTheme(ds...)
}

// GetDefaultDarkTheme 获取默认的黑色主题
func GetDefaultDarkTheme() *Theme {
	return loadDefTheme("dark_defaults.json", "dark_vs.json", "dark_plus.json")
}

// GetDefaultLightTheme 获取默认的白色主题
func GetDefaultLightTheme() *Theme {
	return loadDefTheme("light_defaults.json", "light_vs.json", "light_plus.json")
}
