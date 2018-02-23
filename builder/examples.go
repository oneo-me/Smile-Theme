package main

import (
	"path"

	"./file"
	"./vscode"
)

// GenExamples 生成示例文件
func GenExamples() {
	examples := file.Abs("./examples")
	file.Delete(examples)
	file.Mkdir(examples)
	file.Mkdir(path.Join(examples, "default"))
	file.Mkdir(path.Join(examples, "extensions"))
	file.Mkdir(path.Join(examples, "files"))
	file.Mkdir(path.Join(examples, "folders"))
	file.Mkdir(path.Join(examples, "languages"))

	file.Create(path.Join(examples, "default", "file"))
	file.Mkdir(path.Join(examples, "default", "folder"))

	file.Each(file.Abs("icons"), true, func(p string) {
		if file.Ext(p) == "png" {
			name := file.NameNotExt(p)
			switch file.Name(file.Dir(p)) {
			case "extensions":
				file.Create(path.Join(examples, "extensions", "ext."+name))
			case "files":
				file.Create(path.Join(examples, "files", name))
			case "folders":
				if file.Ext(name) != "expanded" {
					file.Mkdir(path.Join(examples, "folders", name))
				}
			}
		}
	})

	for _, exts := range vscode.GetExtensions() {
		for _, ext := range exts {
			file.Create(path.Join(examples, "languages", "ext."+ext))
		}
	}

	file.SaveFile(file.FormatJSON(`{
		"folders": [
			{
				"path": ".."
			},
			{
				"path": "./default"
			},
			{
				"path": "./extensions"
			},
			{
				"path": "./files"
			},
			{
				"path": "./folders"
			},
			{
				"path": "./languages"
			}
		],
		"settings": {
			"files.exclude": {
				"**/.git": false,
				"**/.svn": false,
				"**/.hg": false,
				"**/CVS": false,
				"**/.DS_Store": false
			},
			"terminal.integrated.cursorStyle": "block"
		}
	}`), path.Join(examples, "examples.code-workspace"))
}
