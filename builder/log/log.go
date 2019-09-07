package log

import "fmt"

// Info 信息
func Info(a ...interface{}) {
	fmt.Println(a...)
}

// Error 错误
func Error(err interface{}) {
	if err != nil {
		panic(err)
	}
}
