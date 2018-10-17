package main

import (
	"strings"

	"./file"
)

// IconPath JSONN
type IconPath struct {
	IconPath string `json:"iconPath"`
}

// Icons 包括全部的图标（黑色、白色、高对比度）
type Icons struct {
	IconDefinitions     map[string]IconPath `json:"iconDefinitions,omitempty"`
	File                string              `json:"file,omitempty"`
	Folder              string              `json:"folder,omitempty"`
	FolderExpanded      string              `json:"folderExpanded,omitempty"`
	RootFolder          string              `json:"rootFolder,omitempty"`
	RootFolderExpanded  string              `json:"rootFolderExpanded,omitempty"`
	LanguageIds         map[string]string   `json:"languageIds,omitempty"`
	FileExtensions      map[string]string   `json:"fileExtensions,omitempty"`
	FileNames           map[string]string   `json:"fileNames,omitempty"`
	FolderNames         map[string]string   `json:"folderNames,omitempty"`
	FolderNamesExpanded map[string]string   `json:"folderNamesExpanded,omitempty"`

	Light *Icons `json:"light,omitempty"`
}

// NewIcons 初始化
func NewIcons() *Icons {
	icons := &Icons{
		IconDefinitions:     make(map[string]IconPath),
		LanguageIds:         make(map[string]string),
		FileExtensions:      make(map[string]string),
		FileNames:           make(map[string]string),
		FolderNames:         make(map[string]string),
		FolderNamesExpanded: make(map[string]string),
		Light: &Icons{
			LanguageIds:         make(map[string]string),
			FileExtensions:      make(map[string]string),
			FileNames:           make(map[string]string),
			FolderNames:         make(map[string]string),
			FolderNamesExpanded: make(map[string]string),
		},
	}
	return icons
}

// GenIconsJSON 生成图标 JSON 数据
func GenIconsJSON() {
	icons := NewIcons()

	// 暗色模式
	icons.File = "default/file"
	icons.Folder = "default/folder"
	icons.FolderExpanded = "default/folder.expanded"
	icons.RootFolder = "default/project"
	icons.RootFolderExpanded = "default/project.expanded"

	// 亮色模式
	icons.Light.File = "default/file_light"

	// 其余图标
	file.Each(file.Abs("./icons"), true, func(p string) {
		if file.Ext(p) == "png" {
			fileName := file.NameNotExt(p)
			dirName := file.Name(file.Dir(p))
			iconType := GetIconType(fileName)
			iconName := strings.Replace(fileName, iconType, "", -1)
			iconDefinition := dirName + "/" + fileName
			icons.IconDefinitions[dirName+"/"+fileName] = IconPath{dirName + "/" + fileName + ".png"}

			fileExtensions := icons.FileExtensions
			fileNames := icons.FileNames
			folderNamesExpanded := icons.FolderNamesExpanded
			folderNames := icons.FolderNames
			languageIds := icons.LanguageIds
			if iconType == "_light" {
				fileExtensions = icons.Light.FileExtensions
				fileNames = icons.Light.FileNames
				folderNamesExpanded = icons.Light.FolderNamesExpanded
				folderNames = icons.Light.FolderNames
				languageIds = icons.Light.LanguageIds
			}

			switch dirName {
			case "extensions":
				fileExtensions[iconName] = iconDefinition
			case "files":
				fileNames[iconName] = iconDefinition
			case "folders":
				if file.Ext(iconName) == "expanded" {
					folderNamesExpanded[strings.Replace(iconName, ".expanded", "", 1)] = iconDefinition
				} else {
					folderNames[iconName] = iconDefinition
				}
			case "languages":
				languageIds[iconName] = iconDefinition
			}
		}
	})

	// 亮色模式 LanguageIds 不存在的需要用默认的补充，不写图标不会显示
	for k, v := range icons.LanguageIds {
		if _, ok := icons.Light.LanguageIds[k]; !ok {
			icons.Light.LanguageIds[k] = v
		}
	}

	file.SaveJSONFile(icons, file.Abs("./icons/icons.json"))
}

// GetIconType 获取图标类型
func GetIconType(fileName string) string {
	if strings.Index(fileName, "_light") > 0 {
		return "_light"
	}
	return ""
}
