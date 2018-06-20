import {Color3, sRGBtransform} from "../color";

function mathmod(x:number,b:number) {
    let q = x % b;
    return q >= 0 ? q : q+b;
}
export let hsl2rgb: sRGBtransform<Color3> = function(hsl: Color3|null): Color3|null {
    if(hsl == null) return null;
    let h = hsl[0], s = hsl[1], l = hsl[2];
    let chroma = (1 - Math.abs(2*l - 1))*s;
    let quadrant = mathmod(h,1)*6;
    let x = chroma*(1-Math.abs(quadrant%2 - 1))
    let rgb: Color3;
    if( quadrant < 1) {
        rgb = [chroma, x, 0];
    } else if( quadrant < 2) {
        rgb = [x, chroma, 0];
    } else if( quadrant < 3) {
        rgb = [0, chroma, x];
    } else if( quadrant < 4) {
        rgb = [0, x, chroma];
    } else if( quadrant < 5) {
        rgb = [x, 0, chroma];
    } else {
        rgb = [chroma, 0, x];
    }
    let m = l - chroma/2;
    return [rgb[0] + m, rgb[1] + m, rgb[2] + m];
}

export let rgb2hsl: sRGBtransform<Color3> = function(rgb: Color3|null): Color3|null {
    if(rgb == null) return null
    let r = rgb[0],
        g = rgb[1],
        b = rgb[2],
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        delta = max - min,
        h, s, l;

	if (max === min) {
		h = 0;
	}
	else if (r === max) {
		h = (g - b) / delta;
	}
	else if (g === max) {
		h = 2 + (b - r) / delta;
	}
	else { // b === max
		h = 4 + (r - g)/ delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	}
	else if (l <= 0.5) {
		s = delta / (max + min);
	}
	else {
		s = delta / (2 - max - min);
	}

	return [h/360., s, l];

}