package main

import (
	"fmt"
	"os"
)

func main() {
	if len(os.Args) > 1 && os.Args[1] == "test" {
		Test()
	} else {
		Test()

		fmt.Println("---------------------------------------------")

		fmt.Println("生成 icons.json", "...")
		GenIconsJSON()

		fmt.Println("生成 themes", "...")
		GenThemes()

		fmt.Println("生成 examples", "...")
		GenExamples()

		fmt.Println("生成 readme", "...")
		GenREADME()
	}
}
