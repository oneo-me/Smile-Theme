package vscode

import (
	"os"
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
