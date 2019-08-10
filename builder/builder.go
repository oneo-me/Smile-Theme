package builder

import (
	"fmt"
	"main/builder/vscode"
	"os"
)

// Run 运行
func Run() {

	// 检查参数
	args := os.Args
	fmt.Println("Args:", args)
	if len(args) < 2 {
		panic("参数错误")
	}

	// 初始化 VSCode 包
	vscode.Init(args[1])
}
