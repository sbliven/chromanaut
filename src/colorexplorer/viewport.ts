
//interface Projection2D<C extends Color> {
//    project(xy: Color2 | null): C | null;
//}
//
//class AxisSlice3 implements Projection2D<Color3> {
//    private readonly xaxis: number;
//    private readonly yaxis: number;
//    private readonly setpoint: Color3;
//    
//    constructor(xaxis?: number, yaxis?: number, setpoint?: Color3) {
//        this.xaxis = xaxis != undefined ? xaxis : 0;
//        this.yaxis = yaxis != undefined ? yaxis : 1;
//        this.setpoint = setpoint != undefined ? setpoint : [1,1,1];
//    }
//    project(coord: Color2 | null): Color3 | null {
//        if( coord == null) {
//            return null;
//        }
//        let proj: Color3 = this.setpoint.slice() as Color3; // clone
//        proj[this.xaxis] = coord[0];
//        proj[this.yaxis] = coord[1];
//        return proj;
//    }
//}

interface Viewport<C extends Color> {
    update(): void;
}

class ColorSlice<C extends Color> implements Viewport<C>{
    xaxis: number;
    yaxis: number;
    //setpoint: C;
    //private axisSpace: ColorMapping<C, Color3>,

    constructor(private model: VisualizerSpace<C>,
                 private canvas: HTMLCanvasElement,
                 xaxis?: number, yaxis?: number,
                public aesthetics?: any) {
        this.xaxis = xaxis != undefined ? xaxis : 0;
        this.yaxis = yaxis != undefined ? yaxis : 1;
        
        model.addEventListener("colorselected", this.update.bind(this));
        this.update();
        
        canvas.addEventListener('mousemove', this.moveHandler.bind(this));
        canvas.addEventListener('click', this.clickHandler.bind(this));
    }
    

    update(): void {
        let ctx: CanvasRenderingContext2D | null = this.canvas.getContext("2d");
        if(ctx != null) {
            let imgdata: ImageData = ctx.getImageData(0,0, this.canvas.width, this.canvas.height);
            let data: Uint8ClampedArray = imgdata.data;
            for(let y=0; y< this.canvas.height; y++){
                for(let x=0; x<this.canvas.width; x++){
                    let coord = this.colorFromPos(x,y);
                    
                    let color = this.model.getRGB(coord);
                    
                    let pos = (y*this.canvas.width + x) * 4;
                    if( color != null) {
                        data[pos  ] = color[0]*256;
                        data[pos+1] = color[1]*256;
                        data[pos+2] = color[2]*256;
                        data[pos+3] = 255;
                    } else {
                        // null color -> translucent
                        data[pos  ] = 256;
                        data[pos+1] = 256;
                        data[pos+2] = 256;
                        data[pos+3] = 0;
                    }
                }
            }
            ctx.putImageData(imgdata, 0,0);
        }
    }
    
    /**
     * Convert a visualizationSpace color to a pixel coordinate.
     * This is the inverse of colorFromPos.
     *
     * With the default aesthetics, colors start with (0,0,*) in the bottom left
     * and (1,1,*) in the top right (ignoring axes orthogonal to this slice).
     * Pixels start with 0,0 in the top left and go to (width, height).
     *
     * @param color
     * @return x, y pixel coordinate
     */
    posFromColor(color: C): [number, number] | null {
        let x = Math.floor(color[this.xaxis] * this.canvas.width);
        let y = Math.floor((1 - color[this.yaxis]) * this.canvas.width);
        return [x,y];
    }
    /**
     * Converts a pixel coordinate to a visualizationSpace color
     * This is the inverse of posFromColor
     *
     * Pixels start with 0,0 in the top left and go to (width, height)
     * With the default aesthetics, colors start with (0,0,*) in the bottom left
     * and (1,1,*) in the top right.
     *
     * @param x pixel column index in [0, width)
     * @param y pixel row index in [0, height)
     * @return a color, with axes orthogonal to this slice taken from the selected color
     */
    colorFromPos(x: number, y: number): C | null {
        let coord: C = this.model.selection.slice() as C; // clone
        coord[this.xaxis] = x/this.canvas.width;
        coord[this.yaxis] = 1-y/this.canvas.height;
        return coord;
    }
    /**
     * Handle mouse motion events
     */
    moveHandler(e: MouseEvent) {
        if( e.buttons) {
            let color = this.colorFromPos(e.offsetX, e.offsetY);
            if( color !== null) {
                this.model.selection = color;
            }
        }
        //console.log("Moved to " + e.offsetX + ", " + e.offsetY+" button: "+e.button+" buttons: "+e.buttons);
        
    }
    /**
     * Handle click events
     */
    clickHandler(e: MouseEvent) {
        let color = this.colorFromPos(e.offsetX, e.offsetY);
        if( color !== null) {
            this.model.selection = color;
        }
        //console.log("clicked at " + e.offsetX + ", " + e.offsetY);
        //console.log("         = " + color);
    }
}

class ColorStrip<C extends Color> implements Viewport<C> {
    axis: number;
    orientation: "vertical" | "horizontal";
    
    constructor(private model: VisualizerSpace<C>,
                 private canvas: HTMLCanvasElement,
                 axis?: number,
                 orientation?: "vertical" | "horizontal",
                 public aesthetics?: any) {
        this.axis = axis != undefined ? axis : 0;
        this.orientation = orientation || "horizontal";
        
        model.addEventListener("colorselected", this.update.bind(this));
        this.update();

        canvas.addEventListener('mousemove', this.moveHandler.bind(this));
        canvas.addEventListener('click', this.clickHandler.bind(this));
    }

    update(): void {
        let ctx: CanvasRenderingContext2D | null= this.canvas.getContext("2d");
        if(ctx != null) {
            let imgdata: ImageData = ctx.getImageData(0,0, this.canvas.width, this.canvas.height);
            let data: Uint8ClampedArray = imgdata.data;
            for(let y=0; y< this.canvas.height; y++){
                for(let x=0; x<this.canvas.width; x++){
                    let coord = this.colorFromPos(x,y);

                    let color = this.model.getRGB(coord);
                    
                    let pos = (y*this.canvas.width + x) * 4;
                    if( color != null) {
                        data[pos  ] = color[0]*256;
                        data[pos+1] = color[1]*256;
                        data[pos+2] = color[2]*256;
                        data[pos+3] = 255;
                    } else {
                        // null color -> translucent
                        data[pos  ] = 256;
                        data[pos+1] = 256;
                        data[pos+2] = 256;
                        data[pos+3] = 0;
                    }
                }
            }
            ctx.putImageData(imgdata, 0,0);
        }
    }

    /**
     * Convert a visualizationSpace color to a pixel coordinate.
     * This is the inverse of colorFromPos.
     *
     * With the default aesthetics, colors start with (0,0,*) in the bottom left
     * and (1,1,*) in the top right (ignoring axes orthogonal to this slice).
     * Pixels start with 0,0 in the top left and go to (width, height).
     *
     * Depending on the orientation, either the x or y coordinate will be 0.
     *
     * @param color
     * @return x, y pixel coordinate
     */
    posFromColor(color: C): [number, number] | null {
        let x = 0;
        let y = 0;
        if( this.orientation == "horizontal") {
            x = Math.floor(color[this.axis] * this.canvas.width);
        } else {
            y = Math.floor((1 - color[this.axis]) * this.canvas.width);
        }
        return [x,y];
    }
    /**
     * Converts a pixel coordinate to a visualizationSpace color
     * This is the inverse of posFromColor
     *
     * Pixels start with 0,0 in the top left and go to (width, height)
     * With the default aesthetics, colors start with (0,0,*) in the bottom left
     * and (1,1,*) in the top right.
     *
     * @param x pixel column index in [0, width)
     * @param y pixel row index in [0, height)
     * @return a color, with axes orthogonal to this slice taken from the selected color
     */
    colorFromPos(x: number, y: number): C | null {
        let coord: C = this.model.selection.slice() as C; // clone
        if( this.orientation == "horizontal") {
            coord[this.axis] = x / this.canvas.width;
        } else {
            coord[this.axis] = 1 - y/this.canvas.width;
        }
        return coord;
    }
    /**
     * Handle mouse motion events
     */
    moveHandler(e: MouseEvent) {
        if( e.buttons) {
            let color = this.colorFromPos(e.offsetX, e.offsetY);
            if( color !== null) {
                this.model.selection = color;
            }
        }
        //console.log("Moved to " + e.offsetX + ", " + e.offsetY+" button: "+e.button+" buttons: "+e.buttons);
        
    }
    /**
     * Handle click events
     */
    clickHandler(e: MouseEvent) {
        let color = this.colorFromPos(e.offsetX, e.offsetY);
        if( color !== null) {
            this.model.selection = color;
        }
        //console.log("clicked at " + e.offsetX + ", " + e.offsetY);
        //console.log("         = " + color);
    }
}