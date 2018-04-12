function rgbPicker(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement) {
    //let space = colorspaces[IdentitySpace.name];
    let vspace = new VisualizerSpace<Color3>([0,0,0]);
    
    let view1 = new ColorStrip(vspace, canvas1, 2);
    
    let view2 = new ColorSlice(vspace, canvas2, 0, 1);

    return {
        "space": vspace,
        "viewports": [view1, view2]
    };
}