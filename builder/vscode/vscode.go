package vscode

import (
	"main/builder/log"
	"os"
	"path/filepath"
)

var root string

// Init 初始化
func Init(code string) {
	if root != "" {
		log.Error("请不要重复初始化")
	}
	vscode := getAppCore(code)
	info, err := os.Stat(vscode)
	if err != nil {
		log.Error(err)
	}
	if !info.IsDir() {
		log.Error("获取到的路径不是目录")
	}
	root = vscode
}

func getCodeDir(name string) string {
	dir := filepath.Join(root, name)
	if _, err := os.Stat(dir); err != nil {
		log.Error(err)
	}
	return dir
}
