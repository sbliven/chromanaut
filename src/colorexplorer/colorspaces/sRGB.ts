//import * as cs from 'color-space';
import {Color3} from "../color";
import {ColorSpace} from "./colorspace";


export class SRGBSpace implements ColorSpace<Color3> {
    readonly name = "sRGB";
    
    constructor() {
        
    }
    /**
     * Apply Inverse sRGB companding
     */
    protected static linearize(color: Color3|null): Color3|null {
        if(color == null) {
            return null;
        }
        let compander = function(v:number):number {
            return v <= 0.04045
                ? v/12.92
                : Math.pow((v+0.055)/1.055,2.4);
        }
        return color.map(compander) as Color3;
    }
    toXYZ(color: Color3 | null): Color3 | null {
        return color;
    }
    fromXYZ(xyz: Color3 | null): Color3 | null {
        return xyz;
    }
}