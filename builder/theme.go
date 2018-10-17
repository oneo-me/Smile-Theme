package main

// SmileColors 简化的配色
type SmileColors struct {
	Background string
	Foreground string
	Border     string
	Link       string
	Success    string
	Error      string
	Warning    string
	Info       string
}

// SmileTokenColors 简化的代码配色
type SmileTokenColors struct {
	Background string
	Foreground string
	Border     string
	Link       string
	Success    string
	Error      string
	Warning    string
	Info       string
}

// SmileTheme 简化的主题
type SmileTheme struct {
	Colors      SmileColors
	TokenColors SmileTokenColors
}

// GenThemes 生成主题
func GenThemes() {

}
