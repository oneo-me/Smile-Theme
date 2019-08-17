package builder

import (
	"main/builder/log"
	"main/builder/vscode"
	"os"
)

// Run 运行
func Run() {

	// 检查参数
	args := os.Args
	log.Info("启动参数", args)
	if len(args) < 2 {
		log.Error("参数错误")
	}

	// 初始化 VSCode 包
	vscode.Init(args[1])
}
