package main

import (
	"path"
	"strings"

	"./file"
)

// IconPathJSON JSONN
type IconPathJSON struct {
	IconPath string `json:"iconPath"`
}

// IconJSON JSON
type IconJSON struct {
	IconDefinitions     map[string]IconPathJSON `json:"iconDefinitions"`
	File                string                  `json:"file"`
	Folder              string                  `json:"folder"`
	FolderExpanded      string                  `json:"folderExpanded"`
	RootFolder          string                  `json:"rootFolder"`
	RootFolderExpanded  string                  `json:"rootFolderExpanded"`
	LanguageIds         map[string]string       `json:"languageIds"`
	FileExtensions      map[string]string       `json:"fileExtensions"`
	FileNames           map[string]string       `json:"fileNames"`
	FolderNames         map[string]string       `json:"folderNames"`
	FolderNamesExpanded map[string]string       `json:"folderNamesExpanded"`
}

// GenIconsJSON 生成图标 JSON 数据
func GenIconsJSON() {
	icons := file.Abs("./icons")
	iconsJSON := new(IconJSON)
	iconsJSON.IconDefinitions = make(map[string]IconPathJSON)
	iconsJSON.File = "file"
	iconsJSON.Folder = "folder"
	iconsJSON.FolderExpanded = "folder.expanded"
	iconsJSON.RootFolder = "project"
	iconsJSON.RootFolderExpanded = "project.expanded"
	iconsJSON.LanguageIds = make(map[string]string)
	iconsJSON.FileExtensions = make(map[string]string)
	iconsJSON.FileNames = make(map[string]string)
	iconsJSON.FolderNames = make(map[string]string)
	iconsJSON.FolderNamesExpanded = make(map[string]string)

	file.Each(icons, true, func(p string) {
		if file.Ext(p) == "png" {
			name := file.NameNotExt(p)
			dirName := file.Name(file.Dir(p))
			iconsJSON.IconDefinitions[name] = IconPathJSON{"./" + dirName + "/" + name + ".png"}
			switch dirName {
			case "extensions":
				iconsJSON.FileExtensions[name] = name
			case "files":
				iconsJSON.FileNames[name] = name
			case "folders":
				if file.Ext(name) == "expanded" {
					iconsJSON.FolderNamesExpanded[strings.Replace(name, ".expanded", "", 1)] = name
				} else {
					iconsJSON.FolderNames[name] = name
				}
			case "languages":
				iconsJSON.LanguageIds[name] = name
			}
		}
	})

	file.SaveJSONFile(iconsJSON, path.Join(icons, "icons.json"))

}
