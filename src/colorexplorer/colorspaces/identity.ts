import {Color, Color3} from "../color";
import {ColorSpace, colorspaces} from "./colorspace";

export class IdentitySpace implements ColorSpace<Color3> {
    name = "identity";
    toXYZ(color: Color3 | null): Color3 | null {
        return color;
    }
    fromXYZ(xyz: Color3 | null): Color3 | null {
        return xyz;
    }
}

colorspaces[IdentitySpace.name] = new IdentitySpace();

export function identitySource<C extends Color>(color: C | null): Color3 | null {
    if( color === null) {
        return null;
    }
    return color.slice(0, 3) as Color3;
}
