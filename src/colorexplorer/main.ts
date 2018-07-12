import {SelectionManager} from "./colorexplorer";
import {ColorStrip, ColorCircle, ColorSlice, ViewportAesthetics} from './viewport';
import * as spaces from "color-space";

export function rgbPicker(canvas: HTMLCanvasElement, selection?: SelectionManager) {
    if(selection === undefined) {
        selection = new SelectionManager([0,0,0], spaces.rgb);
    }
    
    let stripWidth = 15;
    
    // Strip across bottom (blue)
    let aesthetics1: ViewportAesthetics = {
        boundingBox: [0, canvas.height - stripWidth, canvas.width, stripWidth]
    };
    let view1 = new ColorStrip(selection, spaces.rgb,
                               canvas, 2, 'horizontal', aesthetics1);
    
    // Slice in main part of canvas
    let aesthetics2: ViewportAesthetics = {
        boundingBox: [0, 0, canvas.width, canvas.height - stripWidth]
    };
    let view2 = new ColorSlice(selection, spaces.rgb, 
                               canvas, 0, 1, aesthetics2);

    return {
        "space": selection,
        "viewports": [view1, view2]
    };
}

export function hslPicker(canvas1: HTMLCanvasElement, selection?: SelectionManager) {
    if(selection === undefined) {
        // RGB
        selection = new SelectionManager([0,0,0], spaces.hsl);
    }
    
    let stripWidth = 15;
    
    // Strip along right side
    let aesthetics1: ViewportAesthetics = {boundingBox: [canvas1.width-stripWidth, 0, stripWidth, canvas1.height]};
    let view1 = new ColorStrip(selection, spaces.hsl, canvas1, 2, "vertical", aesthetics1);
    
    // Circle in main part of canvas
    let inset = 0;
    let aesthetics2: ViewportAesthetics = {boundingBox: [inset, inset, canvas1.width-stripWidth-2*inset, canvas1.height-2*inset]};
    let view2 = new ColorCircle(selection, spaces.hsl, canvas1, 0, 1, aesthetics2);
    return {
        "space": selection,
        "viewports": [view1, view2]
    };
}