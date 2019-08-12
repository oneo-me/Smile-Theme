package vscode

import (
	"main/builder/fast"
	"path/filepath"
	"regexp"
	"strings"
)

// GetExtensions 获取 VSCode 所支持的扩展名
func GetExtensions() map[string][]string {
	dir := getCodeDir("extensions")
	regID := regexp.MustCompile(`"id": ".*"`)
	regExt := regexp.MustCompile(`"\.[a-zA-z]+\b"`)
	extensions := make(map[string][]string)
	fast.Each(dir, true, func(f string, isFile bool) bool {
		if !isFile {
			return false
		}
		if filepath.Base(f) != "package.json" {
			return false
		}
		str := fast.ReadFile(f)
		id := strings.Replace(strings.Replace(regID.FindString(str), `"id": "`, "", -1), `"`, "", -1)
		exts := regExt.FindAllString(str, -1)
		for i, ext := range exts {
			exts[i] = strings.Replace(strings.Replace(ext, `"`, "", -1), ".", "", 1)
		}
		for _, ext := range exts {
			extensions[id] = append(extensions[id], ext)
		}

		return false
	})
	return extensions
}
