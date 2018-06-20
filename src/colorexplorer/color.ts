export type Color = number[];
export type Color3 = [number,number,number];
export type Color2 = [number,number];
export type Color4 = [number,number,number,number];

export function randomColor3(): Color3 {
    return [Math.random(), Math.random(), Math.random()];
}

export interface ColorMapping<S extends Color, T extends Color> {
    (src: S|null): T| null;
}

/**
 * Convert a color to the sRGB colorspace
 *
 * Implementations may return null for out-of-gamut input, or may use a rendering intent to
 * ensure a non-null response
 *
 * @param color Input color
 * @returns an sRGB triple, or null if the color cannot be converted (e.g. if out of gamut)
 */
export interface sRGBtransform<C extends Color> {
    (color: C | null): Color3 | null;
}

export function inRange<C extends Color>(color: C) {
    return color.findIndex( (c) => c < 0 || 1 < c) < 0;
}

export function rgb2css(rgb: Color3): string {
    let r = Math.floor(rgb[0]*255),
        g = Math.floor(rgb[1]*255),
        b = Math.floor(rgb[2]*255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}