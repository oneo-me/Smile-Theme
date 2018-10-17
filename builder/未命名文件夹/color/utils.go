package color

import (
	"sort"
	"strconv"
	"strings"
)

func to16(f float64) string {
	r := strings.ToUpper(strconv.FormatInt(int64(f), 16))
	if len(r) == 1 {
		return "0" + r
	}
	if len(r) > 2 {
		panic(r + " 无法转换到十六进制")
	}
	return r
}

func to10(str string) float64 {
	r, err := strconv.ParseInt(str, 16, 10)
	if err != nil {
		panic(str + " 无法转换到十进制")
	}
	return float64(r)
}

func hex2rgba(hex string) (r, g, b, a float64) {
	hex = strings.Replace(strings.TrimSpace(hex), "#", "", -1)
	r = to10(hex[0:2])
	g = to10(hex[2:4])
	b = to10(hex[4:6])
	a = 100
	if len(hex) == 8 {
		a = to10(hex[6:8]) / 2.55
	}
	return
}

func rgba2hex(r, g, b, a float64) string {
	hex := "#"
	hex += to16(r)
	hex += to16(g)
	hex += to16(b)
	if a < 100 {
		hex += to16(a * 2.55)
	}
	return hex
}

func rgb2hsb(r, g, b float64) (h, s, hb float64) {
	rgb := []float64{r, g, b}
	sort.Float64s(rgb)
	max := rgb[2]
	min := rgb[0]

	hb = max / 255
	if max == 0 {
		s = 0
	} else {
		s = (max - min) / max
	}
	if r != g || r != b {
		if max == r && g >= b {
			h = (g-b)*60.0/(max-min) + 0.0
		} else if max == r && g < b {
			h = (g-b)*60.0/(max-min) + 360.0
		} else if max == g {
			h = (b-r)*60.0/(max-min) + 120.0
		} else if max == b {
			h = (r-g)*60.0/(max-min) + 240.0
		}
	}
	return
}

func hsb2rgb(h, s, hb float64) (r, g, b float64) {
	i := int64(h/60) % 6
	f := h/60 - float64(i)
	p := hb * (1 - s)
	q := hb * (1 - f*s)
	t := hb * (1 - (1-f)*s)
	switch i {
	case 0:
		r = hb
		g = t
		b = p
	case 1:
		r = q
		g = hb
		b = p
	case 2:
		r = p
		g = hb
		b = t
	case 3:
		r = p
		g = q
		b = hb
	case 4:
		r = t
		g = p
		b = hb
	case 5:
		r = hb
		g = p
		b = q
	}
	r *= 255
	g *= 255
	b *= 255
	return
}
