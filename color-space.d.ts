// Type definitions for color-space@1.16.0
// Project:  color-space types
// Definitions by: Spencer Bliven

// color convertor function type
export type colorConvertor = (source: number[] | null) => number[] | null;

// 
export type colorspace = {
    name: string; //space name
    min: number[]; //channel minimums
    max: number[]; //channel maximums
    channel: string[]; //channel names
    alias: string[]; //alias space names
    // Require conversions to RGB and XYZ
    rgb: colorConvertor;
	xyz: colorConvertor;
} & {
    // Other conversions can be accessed by name
    [name:string] : colorConvertor;
}

// main module properties
export const rgb: colorspace;
export const hsl: colorspace;
export const hsv: colorspace;
export const hsi: colorspace;
export const hwb: colorspace;
export const cmyk: colorspace;
export const cmy: colorspace;
export const xyz: colorspace;
export const xyy: colorspace;
export const yiq: colorspace;
export const yuv: colorspace;
export const ydbdr: colorspace;
export const ycgco: colorspace;
export const ypbpr: colorspace;
export const ycbcr: colorspace;
export const xvycc: colorspace;
export const yccbccrc: colorspace;
export const ucs: colorspace;
export const uvw: colorspace;
export const jpeg: colorspace;
export const lab: colorspace;
export const labh: colorspace;
export const lms: colorspace;
export const lchab: colorspace;
export const luv: colorspace;
export const lchuv: colorspace;
export const hsluv: colorspace;
export const hpluv: colorspace;
export const cubehelix: colorspace;
export const coloroid: colorspace;
export const hcg: colorspace;
export const hcy: colorspace;
export const tsl: colorspace;
export const yes: colorspace;
export const osaucs: colorspace;
export const hsp: colorspace;
