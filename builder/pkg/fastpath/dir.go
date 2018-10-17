package fastpath

import (
	"io/ioutil"
	"os"
	"path/filepath"
)

// Create 创建目录
func Create(dir string) error {
	return os.MkdirAll(dir, os.ModePerm)
}

// IsDir 是目录
func IsDir(p string) bool {
	info, err := os.Stat(p)
	return err == nil && info.IsDir()
}

// GetExeDir 获取程序所在目录
func GetExeDir() (string, error) {
	exeFile, err := GetExeFile()
	if err == nil {
		return filepath.Dir(exeFile), nil
	}
	return "", err
}

// GetDirs 获取子目录
func GetDirs(dir string) []string {
	dirs := []string{}
	dir, err := filepath.Abs(dir)
	if err == nil && IsDir(dir) {
		infos, err := ioutil.ReadDir(dir)
		if err == nil {
			for _, info := range infos {
				if info.IsDir() {
					dirs = append(dirs, filepath.Join(dir, info.Name()))
				}
			}
		}
	}
	return dirs
}

// GetFiles 获取子文件
func GetFiles(dir string) []string {
	files := []string{}
	dir, err := filepath.Abs(dir)
	if err == nil && IsDir(dir) {
		infos, err := ioutil.ReadDir(dir)
		if err == nil {
			for _, info := range infos {
				if !info.IsDir() {
					files = append(files, filepath.Join(dir, info.Name()))
				}
			}
		}
	}
	return files
}

// GetList 获取子内容
func GetList(dir string, inckudeChild bool) []string {
	list := []string{}
	for _, fdir := range GetDirs(dir) {
		list = append(list, fdir)
		if inckudeChild {
			for _, l := range GetList(fdir, inckudeChild) {
				list = append(list, l)
			}
		}
	}
	for _, file := range GetFiles(dir) {
		list = append(list, file)
	}
	return list
}

// GetDirSize 获取目录大小
func GetDirSize(dir string) int64 {
	var size int64
	list := GetList(dir, true)
	for _, file := range list {
		info, err := os.Stat(file)
		if err == nil && !info.IsDir() {
			size += info.Size()
		}
	}
	return size
}

// ForEach 遍历目录，返回 true 跳出遍历
func ForEach(dir string, includeChid bool, action func(string, bool) bool) {
	list := GetList(dir, includeChid)
	for _, file := range list {
		info, err := os.Stat(file)
		if err == nil {
			if action(file, !info.IsDir()) {
				break
			}
		}
	}
}
