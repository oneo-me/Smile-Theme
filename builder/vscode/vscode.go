package vscode

import (
	"os"
	"path/filepath"
)

var root string

// Init 初始化
func Init(code string) {
	if root != "" {
		panic("请不要重复初始化")
	}
	vscode := getAppCore(code)
	info, err := os.Stat(vscode)
	if err != nil {
		panic(err)
	}
	if !info.IsDir() {
		panic("获取到的路径不是目录")
	}
	root = vscode
}

func getCodeDir(name string) string {
	dir := filepath.Join(root, name)
	if _, err := os.Stat(dir); err != nil {
		panic(err)
	}
	return dir
}
