package vscode

import (
	"path"
)

func getAppCore(code string) string {
	return path.Join(path.Dir(path.Dir(code)), "Resources", "app")
}
