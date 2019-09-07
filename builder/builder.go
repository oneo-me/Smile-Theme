package builder

import (
	"main/builder/log"
	"main/builder/old/app"
	"main/builder/preview"
	"main/builder/vscode"
	"os"
)

// Run 运行
func Run() {

	// 检查参数
	args := os.Args
	if len(args) < 2 {
		log.Error("参数错误")
	}

	// 初始化环境
	app.Init()
	vscode.Init(args[1])

	preview.GenPreview()
}
