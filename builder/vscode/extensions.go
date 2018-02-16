package vscode

import (
	"regexp"
	"strings"

	"../file"
)

// GetExtensions 获取 VSCode 官方支持的所有语言的扩展名
func GetExtensions() map[string][]string {
	vscode := GetDir("extensions")
	regID := regexp.MustCompile(`"id": ".*"`)
	regExt := regexp.MustCompile(`"\.[a-zA-z]+\b"`)
	extensions := make(map[string][]string)
	if info := file.Exists(vscode); info != nil && info.IsDir() {
		file.Each(vscode, true, func(f string) {
			if file.Dir(file.Dir(f)) == vscode && file.Name(f) == "package.json" {
				str := file.ReadFile(f)
				id := strings.Replace(strings.Replace(regID.FindString(str), `"id": "`, "", -1), `"`, "", -1)
				exts := regExt.FindAllString(str, -1)
				for i, ext := range exts {
					exts[i] = strings.Replace(strings.Replace(ext, `"`, "", -1), ".", "", 1)
				}
				for _, ext := range exts {
					extensions[id] = append(extensions[id], ext)
				}
			}
		})
	}
	return extensions
}
