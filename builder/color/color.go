package color

// Color 颜色
type Color struct {
	// R 0 - 255
	R float64
	// G 0 - 255
	G float64
	// B 0 - 255
	B float64
	// A 0 - 100
	A float64
}

// HEX 初始化颜色
func HEX(hex string) *Color {
	r, g, b, a := hex2rgba(hex)
	return &Color{r, g, b, a}
}

// RGBA 初始化颜色
func RGBA(r, g, b, a float64) *Color {
	return &Color{r, g, b, a}
}

// HSBA 初始化颜色
func HSBA(h, s, hb, a float64) *Color {
	r, g, b := hsb2rgb(h, s, hb)
	return &Color{r, g, b, a}
}

// HEX 十六进制颜色
func (color *Color) HEX() string {
	return rgba2hex(color.R, color.G, color.B, color.A)
}

// Brightness 不考虑透明度获取亮度 0 - 100
func (color *Color) Brightness() float64 {
	return (0.2126*color.R + 0.7152*color.G + 0.0722*color.B) / 2.55
}

// AlphaBlend 透明度混合
func (color *Color) AlphaBlend(color2 *Color) *Color {
	// 前景
	r1 := color2.R
	g1 := color2.G
	b1 := color2.B
	a1 := color2.A / 100

	// 背景
	r2 := color.R
	g2 := color.G
	b2 := color.B
	a2 := color.A / 100

	// 合并
	r := r1*a1 + r2*a2*(1-a1)
	g := g1*a1 + g2*a2*(1-a1)
	b := b1*a1 + b2*a2*(1-a1)
	a := 1 - (1-a1)*(1-a2)

	// 合并
	r = r / a
	g = g / a
	b = b / a

	return &Color{r, g, b, a * 100}
}

// Opacity 修改不透明度
func (color *Color) Opacity(a float64) *Color {
	return &Color{color.R, color.G, color.B, a}
}

// Lighten 增亮，百分比
func (color *Color) Lighten(amount float64) *Color {
	h, s, hb := rgb2hsb(color.R, color.G, color.B)
	hb *= 1 + amount
	if hb > 1 {
		hb = 1
	} else if hb < 0 {
		hb = 0
	}
	r, g, b := hsb2rgb(h, s, hb)
	return &Color{r, g, b, color.A}
}

// Darken 变暗，百分比
func (color *Color) Darken(amount float64) *Color {
	h, s, hb := rgb2hsb(color.R, color.G, color.B)
	hb *= 1 - amount
	if hb > 1 {
		hb = 1
	} else if hb < 0 {
		hb = 0
	}
	r, g, b := hsb2rgb(h, s, hb)
	return &Color{r, g, b, color.A}
}

// Hue 色相 0 - 360
func (color *Color) Hue(h float64) *Color {
	_, s, hb := rgb2hsb(color.R, color.G, color.B)
	r, g, b := hsb2rgb(h, s, hb)
	return &Color{r, g, b, color.A}
}
