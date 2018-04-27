export type Color = number[];
export type Color3 = [number,number,number];
export type Color2 = [number,number];
export type Color4 = [number,number,number,number];

export function randomColor3(): Color3 {
    return [Math.random(), Math.random(), Math.random()];
}

export interface ColorMapping<S extends Color, T extends Color> {
    (src: S): T;
}

export function inRange<C extends Color>(color: C) {
    return color.findIndex( (c) => c < 0 || 1 < c) < 0;
}