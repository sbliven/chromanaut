type Color = number[];
type Color3 = [number,number,number];
type Color2 = [number,number];
type Color4 = [number,number,number,number];

function randomColor3(): Color3 {
    return [Math.random(), Math.random(), Math.random()];
}

interface ColorMapping<S extends Color, T extends Color> {
    (src: S): T;
}

function inRange<C extends Color>(color: C) {
    return color.findIndex( (c) => c < 0 || 1 < c) < 0;
}