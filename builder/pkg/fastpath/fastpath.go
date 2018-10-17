package fastpath

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

// Delete 删除文件或目录
func Delete(p string) error {
	return os.RemoveAll(p)
}

// Move 移动
func Move(src, dst string) error {
	err := Copy(src, dst)
	if err == nil {
		return Delete(src)
	}
	return err
}

// Copy 复制
func Copy(src, dst string) error {
	src, err := filepath.Abs(src)
	if err != nil {
		return err
	}
	dst, err = filepath.Abs(dst)
	if err != nil {
		return err
	}
	if IsFile(src) {
		data, err := ioutil.ReadFile(src)
		if err != nil {
			return err
		}
		err = ioutil.WriteFile(dst, data, os.ModePerm)
		if err != nil {
			return err
		}
	} else {

	}
	list := GetList(src, true)
	for _, file := range list {
		dstfile := strings.Replace(file, src, dst, -1)
		info, err := os.Stat(file)
		if err != nil {
			return err
		}
		if info.IsDir() {
			err := Create(dstfile)
			if err != nil {
				return err
			}
		} else {
			return Copy(file, dstfile)
		}
	}
	return nil
}
