package app

import (
	"main/builder/log"
	"os"
	"path/filepath"
)

var root string

// Init 初始化
func Init() {
	dir, err := os.Getwd()
	if err != nil {
		log.Error(err)
	}
	root = dir
}

// GetAppDir 获取目录
func GetAppDir(name string) string {
	dir := filepath.Join(root, name)
	if _, err := os.Stat(dir); err != nil {
		log.Error(err)
	}
	return dir
}
