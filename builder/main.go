package main

import (
	"path"
	"path/filepath"

	"./pkg/fastjson"
)

var (
	src    = ""
	public = ""
	info   = NewPackage()
)

func main() {
	src, err := filepath.Abs("./")
	if err != nil {
		panic(err)
	}
	public = filepath.Join(src, "public")
	println(src)
	println(public)

	info.Name = "smile-theme"
	info.DisplayName = "Smile Theme"
	info.Description = "漂亮的图标与代码配色"
	info.Version = "1.28.1"

	// 检测图标覆盖率
	// 检测主题覆盖率
	// 生成图标
	// 生成主题
	GenThemes()
	// 生成预览图
	// 复制必要的文件
	// build 模式，构建插件

	fastjson.Save(path.Join(public, "package.json"), info, true)
}
