package main

import (
	"fmt"
	"path"

	"github.com/1217950746/fastjson"
	"github.com/1217950746/fastpath"
)

var (
	src    = ""
	public = ""
	info   = NewPackage()
)

func main() {
	current, err := fastpath.Abs("..")
	if err != nil {
		panic(err)
	}
	src = current
	public = fastpath.Join(current, "public")
	if err := fastpath.Delete(public); err != nil {
		panic(err)
	}
	if err := fastpath.Create(public); err != nil {
		panic(err)
	}

	fmt.Println("生成基本信息...")
	GenInfo()

	fmt.Println("检测图标覆盖率...")

	fmt.Println("检测主题覆盖率...")

	fmt.Println("生成图标...")

	fmt.Println("生成主题...")

	fmt.Println("生成预览图...")

	fmt.Println("生成必要的内容...")
	GenBase()

	fmt.Println("生成信息文件...")
	fastjson.Save(path.Join(public, "package.json"), info, true)
}
