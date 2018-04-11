class ColorExplorer<A extends Color,S extends Color> {
    viewport: Viewport<A>;
    
    constructor(public axis: ColorSpace<A>, public subject: ColorSpace<S>, setPoint: A) {
        this.viewport = new ColorSlice<A>(function(col: A) {return randomColor3()},setPoint);
    }
    
    show(canvas: HTMLCanvasElement) {
        
    } 
    
}
