package vscode

import (
	"os/user"

	"github.com/1217950746/fastpath"
)

func getVSCode() string {
	user, err := user.Current()
	if err != nil {
		panic(err)
	}
	return fastpath.Join(user.HomeDir, "Microsoft VS Code/Resources/app")
}
