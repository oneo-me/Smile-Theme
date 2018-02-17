package color

import (
	"strings"
)

// RGBA 颜色
type RGBA struct {
	// R 0 - 255
	R int64
	// G 0 - 255
	G int64
	// B 0 - 255
	B int64
	// A 0 - 100
	A float64
}

// NewRGBA 初始化颜色
func NewRGBA(r, g, b int64, a float64) *RGBA {
	rgba := new(RGBA)
	rgba.R = r
	rgba.G = g
	rgba.B = b
	rgba.A = a
	return rgba
}

// NewHEX 初始化颜色
func NewHEX(hex string) *RGBA {
	rgba := new(RGBA)
	switch len(hex) {
	case 6, 8:
		hex = "#" + hex
	case 7, 9:
		if strings.Index(hex, "#") != 0 {
			panic("这个颜色值有猫饼")
		}
	default:
		panic("这个颜色值有猫饼")
	}
	rgba.R = conv10(hex[1:3])
	rgba.G = conv10(hex[3:5])
	rgba.B = conv10(hex[5:7])
	if len(hex) == 9 {
		rgba.A = float64(conv10(hex[7:9])) / 2.55
	} else {
		rgba.A = 100
	}
	return rgba
}

// HEX 十六进制颜色
func (rgba *RGBA) HEX() string {
	r := "#"
	r += conv16(rgba.R)
	r += conv16(rgba.G)
	r += conv16(rgba.B)
	r += conv16(int64(rgba.A * 2.55))
	return strings.ToUpper(r)
}

// Add 添加颜色
func (rgba *RGBA) Add(color *RGBA) *RGBA {
	r1 := float64(rgba.R)
	g1 := float64(rgba.G)
	b1 := float64(rgba.B)
	a1 := rgba.A / 100
	r2 := float64(color.R)
	g2 := float64(color.G)
	b2 := float64(color.B)
	a2 := color.A / 100

	r := r1*a1 + r2*a2*(1-a1)
	g := g1*a1 + g2*a2*(1-a1)
	b := b1*a1 + b2*a2*(1-a1)
	a := 1 - (1-a1)*(1-a2)
	r = r / a
	g = g / a
	b = b / a

	return NewRGBA(int64(r), int64(g), int64(b), a*100)
}
