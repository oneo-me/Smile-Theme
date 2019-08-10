package vscode

import "path"

func getAppCore(code string) string {
	return path.Join(path.Dir(code), "resources", "app")
}
