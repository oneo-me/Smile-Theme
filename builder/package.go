package main

// Engines 引擎
type Engines struct {
	VSCode string `json:"vscode"`
}

// Repository 存储库
type Repository struct {
	Type string `json:"type"`
	URL  string `json:"url"`
}

// Bugs 反馈
type Bugs struct {
	URL   string `json:"url"`
	Email string `json:"email"`
}

// IconTheme 图标主题
type IconTheme struct {
	ID    string `json:"id"`
	Lable string `json:"lable"`
	Path  string `json:"path"`
}

// Theme 界面主题
type Theme struct {
	ID      string `json:"id"`
	Lable   string `json:"lable"`
	UITheme string `json:"uiTheme"`
	Path    string `json:"path"`
}

// Contributes 配置
type Contributes struct {
	IconThemes []IconTheme `json:"iconThemes"`
	Themes     []Theme     `json:"themes"`
}

// Package Package 配置
type Package struct {
	Name        string      `json:"name"`
	DisplayName string      `json:"displayName"`
	Description string      `json:"description"`
	Version     string      `json:"version"`
	Publisher   string      `json:"publisher"`
	Engines     Engines     `json:"engines"`
	Icon        string      `json:"icon"`
	Repository  Repository  `json:"repository"`
	Bugs        Bugs        `json:"bugs"`
	Categories  []string    `json:"categories"`
	Contributes Contributes `json:"contributes"`
}

// NewPackage 初始化 Package
func NewPackage() *Package {
	result := &Package{}
	result.Categories = []string{}
	result.Contributes.IconThemes = []IconTheme{}
	result.Contributes.Themes = []Theme{}
	return result
}
