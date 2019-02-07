package vscode

import "github.com/1217950746/fastpath"

// GetDir 获取 VSCode 下的目录
func GetDir(p string) string {
	return fastpath.Join(getVSCode(), p)
}
