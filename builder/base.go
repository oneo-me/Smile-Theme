package main

import (
	"github.com/1217950746/fastpath"
)

// GenBase 生成必要的内容
func GenBase() {
	for _, name := range []string{
		"icons", "previews",
		"icon.png", "preview.png", "README.png",
	} {
		if err := fastpath.Copy(fastpath.Join(src, name), fastpath.Join(public, name)); err != nil {
			panic(err)
		}
	}
}
