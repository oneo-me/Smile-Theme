package fast

import (
	"encoding/json"
	"io/ioutil"
)

// ReadJSONFile 读取 JSON 文件
func ReadJSONFile(file string, v interface{}) {
	data, err := ioutil.ReadFile(file)
	if err != nil {
		panic(err)
	}
	err = json.Unmarshal(data, v)
	if err != nil {
		panic(err)
	}
}
