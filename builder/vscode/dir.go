package vscode

import "path"

// GetDir 获取 VSCode 的目录
func GetDir(p string) string {
	return path.Join(dir, p)
}
