package file

import (
	"encoding/json"
	"strings"
)

// LoadJSONFile 加载 JSON 文件
func LoadJSONFile(v interface{}, p string) {
	str := ""
	ReadLine(p, func(line string) {
		if strings.Index(strings.TrimSpace(line), "// ") != 0 {
			str += line
		}
	})
	if err := json.Unmarshal([]byte(str), v); err != nil {
		panic(err)
	}
}

// SaveJSONFile 保存 JSON 文件
func SaveJSONFile(v interface{}, p string) {
	data, err := json.MarshalIndent(v, "", "    ")
	if err != nil {
		panic(err)
	}
	SaveFile(string(data), p)
}

// FormatJSON 格式化 JSON 字符串
func FormatJSON(jsonStr string) string {
	data, err := json.MarshalIndent(json.RawMessage(jsonStr), "", "    ")
	if err != nil {
		panic(err)
	}
	return string(data)
}
