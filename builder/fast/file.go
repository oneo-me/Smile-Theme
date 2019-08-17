package fast

import (
	"io/ioutil"
	"main/builder/log"
)

// ReadFile 读取文件内容
func ReadFile(p string) string {
	bs, err := ioutil.ReadFile(p)
	if err != nil {
		log.Error(err)
	}
	return string(bs)
}
