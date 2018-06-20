import {SelectionManager} from "./colorexplorer";
import {Color3} from "./color";
import {ColorStrip, ColorCircle, ColorSlice} from './viewport';
import {identitySource} from "./colorspaces/identity";
import {hsl2rgb, rgb2hsl} from "./colorspaces/hue";

export function rgbPicker(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement, selection?: SelectionManager<Color3>) {
    //let space = colorspaces[IdentitySpace.name];
    if(selection === undefined) {
        selection = new SelectionManager<Color3>([0,0,0]);
    }
    
    let view1 = new ColorStrip(selection, identitySource, identitySource, identitySource, canvas1, 2);
    
    let view2 = new ColorSlice(selection, identitySource, identitySource, identitySource, canvas2, 0, 1);

    return {
        "space": selection,
        "viewports": [view1, view2]
    };
}

export function hslPicker(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement, selection?: SelectionManager<Color3>) {
    //let space = colorspaces[IdentitySpace.name];
    if(selection === undefined) {
        // RGB
        selection = new SelectionManager<Color3>([0,0,0]);
    }
    
    // HSL strip, RGB selection
    let view1 = new ColorStrip(selection, rgb2hsl, hsl2rgb, hsl2rgb, canvas1, 2, "vertical");
    
    let view2 = new ColorCircle(selection, rgb2hsl, hsl2rgb, hsl2rgb, canvas2, 0, 1);
//    let view2 = new ColorSlice(selection, identitySource, identitySource, hsl2rgb, canvas2, 2, 0);
    return {
        "space": selection,
        "viewports": [view1, view2]
    };
}