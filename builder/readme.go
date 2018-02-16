package main

import (
	"path"

	"./file"
)

// GenREADME 生成 README 文件
func GenREADME() {
	readme := ""
	readme += file.ReadFile(file.Abs("./other/readme_header.md")) + "\n\n"

	repository := "https://github.com/1217950746/Smile-Theme/raw/master/icons"

	getMarkdown := func(title, dirName string) {
		readme += "### " + title + "\n\n"
		file.Each(path.Join(file.Abs("./icons"), dirName), false, func(f string) {
			readme += `<img title="` + file.NameNotExt(f) + `" width="38" src="` + repository + "/" + dirName + "/" + file.Name(f) + `">`
		})
		readme += "\n\n"
	}

	getMarkdown("默认图标", "default")
	getMarkdown("语言图标", "languages")
	getMarkdown("目录图标", "folders")
	getMarkdown("文件图标", "files")
	getMarkdown("扩展图标", "extensions")

	readme += file.ReadFile(file.Abs("./other/readme_footer.md"))

	file.SaveFile(readme, file.Abs("./README.md"))
}
