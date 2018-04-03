//import {Color, Color3} from "../color";

interface ColorSpace<C extends Color> {
    toXYZ(color: C | null): Color3 | null;
    fromXYZ(xyz: Color3 | null): C | null;
}