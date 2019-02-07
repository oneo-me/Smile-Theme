package vscode

import (
	"regexp"
	"strings"

	"github.com/1217950746/fastpath"
)

// GetExtensions 获取 VSCode 官方支持的所有语言的扩展名
func GetExtensions() map[string][]string {
	vscode := GetDir("extensions")
	regID := regexp.MustCompile(`"id": ".*"`)
	regExt := regexp.MustCompile(`"\.[a-zA-z]+\b"`)
	extensions := make(map[string][]string)
	fastpath.ForEach(vscode, true, func(f string, isFile bool) {
		if fastpath.Dir(fastpath.Dir(f)) == vscode && fastpath.Name(f) == "package.json" {
			str := fastpath.ReadFileStr(f)
			id := strings.Replace(strings.Replace(regID.FindString(str), `"id": "`, "", -1), `"`, "", -1)
			exts := regExt.FindAllString(str, -1)
			for i, ext := range exts {
				exts[i] = strings.Replace(strings.Replace(ext, `"`, "", -1), ".", "", 1)
			}
			for _, ext := range exts {
				extensions[id] = append(extensions[id], ext)
			}
		}

		return false
	})
	return extensions
}
