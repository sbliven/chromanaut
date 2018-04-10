//import {Color3} from "../color";
//import {distance2} from "../util";
//import {ColorSpace} from "./colorspace";

class CubeSpace implements ColorSpace<Color3> {
    name: string = "cube";
    
    toXYZ(color: Color3 | null): Color3 | null {
        if(color == null) {return null;}
        // Round all values to 0 or 1
        return [ color[0] < 0.5 ? 0 : 1,
                 color[1] < 0.5 ? 0 : 1,
                 color[2] < 0.5 ? 0 : 1
               ];
    }
    fromXYZ(xyz: Color3 | null): Color3 | null {
        if(xyz == null) {return null;}
        // Round all values to 0 or 1
        return [ xyz[0] < 0.5 ? 0 : 1,
                 xyz[1] < 0.5 ? 0 : 1,
                 xyz[2] < 0.5 ? 0 : 1
               ];
    }
}

colorspaces[CubeSpace.name] = new CubeSpace();
