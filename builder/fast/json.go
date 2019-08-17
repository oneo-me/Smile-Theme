package fast

import (
	"encoding/json"
	"io/ioutil"
	"main/builder/log"
)

// ReadJSONFile 读取 JSON 文件
func ReadJSONFile(file string, v interface{}) {
	data, err := ioutil.ReadFile(file)
	if err != nil {
		log.Error(err)
	}
	err = json.Unmarshal(data, v)
	if err != nil {
		log.Error(err)
	}
}
