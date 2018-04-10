//import {Color3} from "../color";
//import {distance2} from "../util";
//import {ColorSpace} from "./colorspace";

class IdentitySpace implements ColorSpace<Color3> {
    name = "identity";
    toXYZ(color: Color3 | null): Color3 | null {
        return color;
    }
    fromXYZ(xyz: Color3 | null): Color3 | null {
        return xyz;
    }
}

colorspaces[IdentitySpace.name] = new IdentitySpace();
