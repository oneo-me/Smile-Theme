package vscode

import (
	"path/filepath"
)

func getAppCore(code string) string {
	return filepath.Join(filepath.Dir(filepath.Dir(code)), "Resources", "app")
}
