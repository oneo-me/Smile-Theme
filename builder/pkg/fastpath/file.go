package fastpath

import (
	"crypto/md5"
	"fmt"
	"io/ioutil"
	"os"
)

// IsFile 是文件
func IsFile(p string) bool {
	info, err := os.Stat(p)
	return err == nil && !info.IsDir()
}

// ReadFile 读取
func ReadFile(p string) ([]byte, error) {
	return ioutil.ReadFile(p)
}

// SaveFile 保存
func SaveFile(p string, data []byte) error {
	return ioutil.WriteFile(p, data, os.ModePerm)
}

// GetFileMd5 获取文件 MD5
func GetFileMd5(file string) (string, error) {
	data, err := ioutil.ReadFile(file)
	if err == nil {
		return fmt.Sprintf("%x", md5.Sum(data)), nil
	}
	return "", err
}

// GetFileSize 获取文件大小
func GetFileSize(file string) int64 {
	info, err := os.Stat(file)
	if err == nil {
		return info.Size()
	}
	return 0
}

// GetExeFile 获取程序文件路径
func GetExeFile() (string, error) {
	return os.Executable()
}
