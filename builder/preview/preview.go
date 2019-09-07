package preview

import (
	"image"
	"image/draw"
	"image/png"
	"io/ioutil"
	"main/builder/log"
	"main/builder/old/app"
	"math"
	"os"
	"path"
	"path/filepath"
)

// GenPreview 生成预览图
func GenPreview() {
	dir := app.GetAppDir("icons")
	previews := app.GetAppDir("previews")
	infos, err := ioutil.ReadDir(dir)
	log.Error(err)

	for _, info := range infos {
		if !info.IsDir() {
			continue
		}

		previewName := "preview_" + info.Name() + ".png"
		previewFile := filepath.Join(previews, previewName)

		files, err := ioutil.ReadDir(filepath.Join(dir, info.Name()))
		log.Error(err)

		fileCount := len(files)

		num := 15
		s := 6
		width := 36 * s
		height := 24 * s
		space := 6 * s

		react := image.Rect(0, 0, num*width+space, int(math.Ceil(float64(fileCount)/float64(num)))*(height+space)+space)
		img := image.NewRGBA(react)

		write, err := os.Create(previewFile)
		log.Error(err)

		for i, file := range files {
			if file.IsDir() {
				continue
			}

			line := i / num
			index := i % num
			x := index * width
			y := line*(height+space) + space
			read, err := os.Open(path.Join(dir, info.Name(), file.Name()))
			log.Error(err)
			icon, _, err := image.Decode(read)
			log.Error(err)
			read.Close()
			draw.Draw(img, image.Rectangle{image.Point{x, y}, image.Point{x + width, y + height}}, icon, image.Point{0, 0}, draw.Src)
		}

		png.Encode(write, img)
		write.Close()
	}
}
