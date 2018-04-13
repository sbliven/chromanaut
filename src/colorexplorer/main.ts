function rgbPicker(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement, vspace?: VisualizerSpace<Color3>) {
    //let space = colorspaces[IdentitySpace.name];
    if(vspace === undefined) {
        vspace = new VisualizerSpace<Color3>([0,0,0]);
    }
    
    let view1 = new ColorStrip(vspace, canvas1, 2);
    
    let view2 = new ColorSlice(vspace, canvas2, 0, 1);

    return {
        "space": vspace,
        "viewports": [view1, view2]
    };
}

function hslPicker(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement, vspace?: VisualizerSpace<Color3>) {
    //let space = colorspaces[IdentitySpace.name];
    if(vspace === undefined) {
        vspace = new VisualizerSpace<Color3>([0,0,0]);
    }
    
    let view1 = new ColorStrip(vspace, canvas1, 1, "vertical");
    
    let view2 = new ColorCircle(vspace, canvas2, 0, 2);
    return {
        "space": vspace,
        "viewports": [view1, view2]
    };
}