package vscode

import (
	"path"
)

func getAppCore(code string) string {
	return filepath.Join(filepath.Dir(filepath.Dir(code)), "Resources", "app")
}
