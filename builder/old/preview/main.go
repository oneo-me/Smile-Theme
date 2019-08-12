package main

import (
	"fmt"
	"image"
	"image/draw"
	"image/png"
	"io/ioutil"
	"math"
	"os"
	"path"
	"path/filepath"
)

func main() {
	dir, err := filepath.Abs("../../icons")
	if err != nil {
		panic(err)
	}

	bin, err := filepath.Abs("./bin")
	if err != nil {
		panic(err)
	}

	s := 5
	num := 15

	width := 36 * s
	height := 24 * s
	space := 6 * s

	if infos, err := ioutil.ReadDir(dir); err == nil {
		fmt.Println("开始生成预览图", "...")
		for _, info := range infos {
			if info.IsDir() {
				var previewName = "preview_" + info.Name() + ".png"
				var previewFile = filepath.Join(bin, previewName)
				fmt.Println("正在生成", previewName, "...")
				if err := os.RemoveAll(previewFile); err != nil {
					panic(err)
				}
				write, err := os.Create(previewFile)
				if err != nil {
					panic(err)
				}
				if files, err := ioutil.ReadDir(path.Join(dir, info.Name())); err == nil {
					var m *image.RGBA
					fileNum := len(files)
					m = image.NewRGBA(image.Rect(0, 0, num*width+space, int(math.Ceil(float64(fileNum)/float64(num)))*(height+space)+space))
					for i, file := range files {
						if !file.IsDir() {
							line := i / num
							index := i % num
							x := index * width
							y := line*(height+space) + space
							read, err := os.Open(path.Join(dir, info.Name(), file.Name()))
							if err != nil {
								panic(err)
							}
							img, _, err := image.Decode(read)
							if err != nil {
								panic(err)
							}
							read.Close()
							draw.Draw(m, image.Rectangle{image.Point{x, y}, image.Point{x + width, y + height}}, img, image.Point{0, 0}, draw.Src)
						}
					}
					png.Encode(write, m)
					write.Close()
				}
			}
		}
		fmt.Println("预览图生成完成", "...")
	}
}
