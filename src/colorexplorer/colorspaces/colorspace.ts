import {Color, Color3} from "../color";

/**
 * A color space based on CIEXYZ or equivalent spaces
 */
export interface ColorSpace<C extends Color> {
    readonly name: string;
    toXYZ(color: C | null): Color3 | null;
    fromXYZ(xyz: Color3 | null): C | null;
}

export let colorspaces: {[name: string]: ColorSpace<Color>} = {};
