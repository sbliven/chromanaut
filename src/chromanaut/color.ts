import {colorspace} from "color-space";

export type Color = number[];

export function randomColor3(): Color {
    return [Math.random(), Math.random(), Math.random()];
}

/**
 * Convert an RGB tuple (in [0,255]) to a CSS color string
 */
export function rgb2css(rgb: Color): string {
    if(rgb.length != 3) {
        throw "Expected RGB color";
    }
    let r = Math.floor(rgb[0]),
        g = Math.floor(rgb[1]),
        b = Math.floor(rgb[2]);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

/**
 * Check if a color is within the gamut for a colorspace.
 *
 * @param space colorspace
 * @param color input color
 * @return boolean: all color coordinates are between the space's min and max
 */
export function inGamut(space: colorspace, color: Color): boolean {
    if(color.length != space.min.length){
        return false;
    }
    for(let i=0;i<color.length;i++) {
        if( space.min[i] > color[i] || color[i] > space.max[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Linearly normalize a color in [min,max] to [0,1] range
 *
 * Inverse of unnormalize
 */
export function normalize(space: colorspace, color: Color): Color {
    if(color.length != space.min.length){
        throw "Mismatch between color and colorspace";
    }
    let norm = [];
    for(let i=0;i<color.length;i++) {
        let n = (color[i] - space.min[i])/(space.max[i] - space.min[i]);
        norm.push(n);
    }
    return norm;
}
/**
 * Linearly scale a color in [0,1] back to [min,max] range
 *
 * Inverse of normalize
 */
export function unnormalize(space: colorspace, color: Color): Color {
    if(color.length != space.min.length){
        throw "Mismatch between color and colorspace";
    }
    let unnorm = [];
    for(let i=0;i<color.length;i++) {
        let n = color[i]*(space.max[i] - space.min[i]) + space.min[i];
        unnorm.push(n);
    }
    return unnorm;

}