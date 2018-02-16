package file

import (
	"bufio"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

// Name 获取名称
func Name(p string) string {
	return filepath.Base(p)
}

// Ext 获取扩展名
func Ext(p string) string {
	return strings.Replace(filepath.Ext(p), ".", "", 1)
}

// NameNotExt 获取名称，不包含扩展名
func NameNotExt(p string) string {
	return strings.Replace(Name(p), "."+Ext(p), "", 1)
}

// Abs 获取绝对路径
func Abs(p string) string {
	abs, err := filepath.Abs(p)
	if err != nil {
		panic(err)
	}
	return abs
}

// Dir 获取目录
func Dir(p string) string {
	return filepath.Dir(p)
}

// Create 创建文件
func Create(p string) {
	file, err := os.Create(p)
	if err != nil {
		panic(err)
	}
	defer file.Close()
}

// Delete 删除文件或目录
func Delete(p string) {
	if err := os.RemoveAll(p); err != nil {
		panic(err)
	}
}

// ReadFile 读取文件
func ReadFile(p string) string {
	data, err := ioutil.ReadFile(p)
	if err != nil {
		panic(err)
	}
	return string(data)
}

// ReadLine 逐行读取文件
func ReadLine(p string, action func(string)) {
	f, err := os.Open(p)
	if err != nil {
		panic(err)
	}
	buf := bufio.NewReader(f)
	for {
		line, err := buf.ReadString('\n')
		action(line)
		if err != nil {
			if err == io.EOF {
				return
			}
			panic(err)
		}
	}
}

// SaveFile 保存文件
func SaveFile(data, p string) {
	write, err := os.Create(p)
	if err != nil {
		panic(err)
	}
	write.WriteString(data)
	write.Close()
}
