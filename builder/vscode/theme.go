package vscode

import (
	"path"
	"strings"

	"../file"
)

// Theme 主题
type Theme struct {
	Schema      string            `json:"$schema,omitempty"`
	Colors      map[string]string `json:"colors,omitempty"`
	TokenColors []*TokenColor     `json:"tokenColors,omitempty"`
}

// GetColorsHex 获取全部界面颜色
func (t *Theme) GetColorsHex() []string {
	r := []string{}
	for _, color := range t.Colors {
		if color != "#00000000" && color != "" {
			has := false
			for _, c := range r {
				if c == color {
					has = true
					break
				}
			}
			if !has {
				r = append(r, color)
			}
		}
	}
	return r
}

// GetTokenColorsHex 获取全部代码颜色
func (t *Theme) GetTokenColorsHex() []string {
	r := []string{}
	for _, v := range t.TokenColors {
		color := v.Settings.Foreground
		if color != "#00000000" && color != "" {
			has := false
			for _, c := range r {
				if c == color {
					has = true
					break
				}
			}
			if !has {
				r = append(r, color)
			}
		}
	}
	return r
}

// TokenColor 代码高亮配色方案
type TokenColor struct {
	Scope    interface{} `json:"scope,omitempty"`
	Settings Settings    `json:"settings,omitempty"`
}

// GetScope 获取 TokenColor Scope 的确切内容
func (tc *TokenColor) GetScope() []string {
	r := []string{}
	switch vs := tc.Scope.(type) {
	case []interface{}:
		for _, v := range vs {
			r = append(r, v.(string))
		}
	case string:
		r = append(r, tc.Scope.(string))
	}
	return r
}

// HasScope 是否存在某个 Scope
func (tc *TokenColor) HasScope(scope string) bool {
	for _, s := range tc.GetScope() {
		if s == scope {
			return true
		}
	}
	return false
}

// Settings 代码高亮设置
type Settings struct {
	Foreground string `json:"foreground,omitempty"`
	FontStyle  string `json:"fontStyle,omitempty"`
}

// LoadTheme 加载主题
func LoadTheme(fs ...string) *Theme {
	r := NewTheme()
	for _, f := range fs {
		t := new(Theme)
		file.LoadJSONFile(t, f)
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

func getDefaultTheme(ns ...string) *Theme {
	d := GetDir("extensions/theme-defaults/themes")
	ds := []string{}
	for _, n := range ns {
		ds = append(ds, path.Join(d, n))
	}
	return LoadTheme(ds...)
}

// GetDefaultDarkTheme 获取默认的黑色主题
func GetDefaultDarkTheme() *Theme {
	return getDefaultTheme("dark_defaults.json", "dark_vs.json", "dark_plus.json")
}

// GetDefaultLightTheme 获取默认的白色主题
func GetDefaultLightTheme() *Theme {
	return getDefaultTheme("light_defaults.json", "light_vs.json", "light_plus.json")
}

// NewTheme 初始化主题
func NewTheme() *Theme {
	t := new(Theme)
	t.Schema = "vscode://schemas/color-theme" // 加上这个便于错误检查
	t.Colors = make(map[string]string)
	return t
}
