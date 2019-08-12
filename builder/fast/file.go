package fast

import "io/ioutil"

// ReadFile 读取文件内容
func ReadFile(p string) string {
	bs, err := ioutil.ReadFile(p)
	if err != nil {
		panic(err)
	}
	return string(bs)
}
