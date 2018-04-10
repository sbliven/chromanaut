//import {Color, Color3} from "../color";

interface ColorSpace<C extends Color> {
    name: string;
    toXYZ(color: C | null): Color3 | null;
    fromXYZ(xyz: Color3 | null): C | null;
}

let colorspaces: {[name: string]: ColorSpace<Color>} = {};
