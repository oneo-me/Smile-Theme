package color

import (
	"strconv"
)

func conv16(i int64) string {
	r := strconv.FormatInt(i, 16)
	if len(r) == 1 {
		return "0" + r
	}
	if len(r) > 2 {
		panic("这颜色值有问题")
	}
	return r
}

func conv10(str string) int64 {
	r, err := strconv.ParseInt(str, 16, 10)
	if err != nil {
		panic(err)
	}
	return r
}
