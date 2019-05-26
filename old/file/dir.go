package file

import (
	"io/ioutil"
	"os"
	"path"
)

// Exists 存在
func Exists(p string) os.FileInfo {
	if info, err := os.Stat(p); err == nil {
		return info
	}
	return nil
}

// Each 遍历目录
func Each(dir string, includeChild bool, action func(string)) {
	if info := Exists(dir); info != nil && info.IsDir() {
		if files, err := ioutil.ReadDir(dir); err == nil {
			for _, file := range files {
				p := path.Join(dir, file.Name())
				if file.IsDir() {
					if includeChild {
						Each(p, true, action)
					}
				} else {
					if action != nil && Name(p) != ".DS_Store" {
						action(p)
					}
				}
			}
		}
	}
}

// Mkdir 创建目录
func Mkdir(p string) {
	if err := os.MkdirAll(p, os.ModePerm); err != nil {
		panic(err)
	}
}
