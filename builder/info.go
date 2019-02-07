package main

// GenInfo 生成信息
func GenInfo() {
	info.Name = "smile-theme"
	info.DisplayName = "Smile Theme"
	info.Description = "漂亮的图标与代码配色"
	info.Version = "2.0.0"
	info.Publisher = "oneo"

	info.Icon = "icon.png"
	info.Engines.VSCode = "^1.0.0"

	info.Repository.Type = "git"
	info.Repository.URL = "https://github.com/1217950746/Smile-Theme"
	info.Bugs.URL = "https://github.com/1217950746/Smile-Theme/issues"
	info.Bugs.Email = "oneo.me@outlook.com"

	info.Categories = append(info.Categories, "Themes")
}
