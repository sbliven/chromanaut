import {Color, Color3} from "../color";

export interface ColorSpace<C extends Color> {
    name: string;
    toXYZ(color: C | null): Color3 | null;
    fromXYZ(xyz: Color3 | null): C | null;
}

export let colorspaces: {[name: string]: ColorSpace<Color>} = {};
