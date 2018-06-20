// Type definitions for color-space@1.16.0
// Project:  color-space types
// Definitions by: Spencer Bliven

// color convertor function type
export type colorConvertor = (source: number[]) => number[];

// 
export interface colorspace {
    name: string; //space name
    min: number[]; //channel minimums
    max: number[]; //channel maximums
    channel: string[]; //channel names
    alias: string[]; //alias space names
    rgb: colorConvertor;
	hsl: colorConvertor;
	hsv: colorConvertor;
	hsi: colorConvertor;
	hwb: colorConvertor;
	cmyk: colorConvertor;
	cmy: colorConvertor;
	xyz: colorConvertor;
	xyy: colorConvertor;
	yiq: colorConvertor;
	yuv: colorConvertor;
	ydbdr: colorConvertor;
	ycgco: colorConvertor;
	ypbpr: colorConvertor;
	ycbcr: colorConvertor;
	xvycc: colorConvertor;
	yccbccrc: colorConvertor;
	ucs: colorConvertor;
	uvw: colorConvertor;
	jpeg: colorConvertor;
	lab: colorConvertor;
	labh: colorConvertor;
	lms: colorConvertor;
	lchab: colorConvertor;
	luv: colorConvertor;
	lchuv: colorConvertor;
	hsluv: colorConvertor;
	hpluv: colorConvertor;
	cubehelix: colorConvertor;
	coloroid: colorConvertor;
	hcg: colorConvertor;
	hcy: colorConvertor;
	tsl: colorConvertor;
	yes: colorConvertor;
	osaucs: colorConvertor;
	hsp: colorConvertor;
}

// main spaces object
export const spaces: {
    rgb: colorspace,
	hsl: colorspace,
	hsv: colorspace,
	hsi: colorspace,
	hwb: colorspace,
	cmyk: colorspace,
	cmy: colorspace,
	xyz: colorspace,
	xyy: colorspace,
	yiq: colorspace,
	yuv: colorspace,
	ydbdr: colorspace,
	ycgco: colorspace,
	ypbpr: colorspace,
	ycbcr: colorspace,
	xvycc: colorspace,
	yccbccrc: colorspace,
	ucs: colorspace,
	uvw: colorspace,
	jpeg: colorspace,
	lab: colorspace,
	labh: colorspace,
	lms: colorspace,
	lchab: colorspace,
	luv: colorspace,
	lchuv: colorspace,
	hsluv: colorspace,
	hpluv: colorspace,
	cubehelix: colorspace,
	coloroid: colorspace,
	hcg: colorspace,
	hcy: colorspace,
	tsl: colorspace,
	yes: colorspace,
	osaucs: colorspace,
	hsp: colorspace
};
