
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
    display(canvas: HTMLCanvasElement): void;
}

class ColorSlice<C extends Color> implements Viewport<C>{
    //axisSpace: ColorSpace<C>;
    xaxis: number;
    yaxis: number;
    //setpoint: C;

    constructor(private axisSpace: ColorMapping<C, Color3>, public setpoint: C,
                 xaxis?: number, yaxis?: number) {
        this.xaxis = xaxis != undefined ? xaxis : 0;
        this.yaxis = yaxis != undefined ? yaxis : 1;
    }

    display(canvas: HTMLCanvasElement): void {
        let ctx: CanvasRenderingContext2D | null= canvas.getContext("2d");
        if(ctx != null) {
            let imgdata: ImageData = ctx.getImageData(0,0, canvas.width, canvas.height);
            let data: Uint8ClampedArray = imgdata.data;
            let coord: C = this.setpoint.slice() as C; // clone
            for(let y=0; y< canvas.height; y++){
                for(let x=0; x<canvas.width; x++){
                    coord[this.xaxis] = x/canvas.width;
                    coord[this.yaxis] = 1-y/canvas.height;
                    
                    let color = this.axisSpace(coord);
                    
                    let pos = (y*canvas.width + x) * 4;
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
    
//    /**
//     * gets a color in sRGB
//     */
//    getColor(coord: C): Color3 | null {
//        return randomColor3();
//    }
    
}

class ColorStrip<C extends Color> implements Viewport<C> {
    axis: number;
    orientation: "vertical" | "horizontal";
    
    constructor(private axisSpace: ColorMapping<C, Color3>, public setpoint: C,
                 axis?: number, orientation?: "vertical" | "horizontal") {
        this.axis = axis != undefined ? axis : 0;
        this.orientation = orientation || "horizontal";
    }

    display(canvas: HTMLCanvasElement): void {
        let ctx: CanvasRenderingContext2D | null= canvas.getContext("2d");
        if(ctx != null) {
            let imgdata: ImageData = ctx.getImageData(0,0, canvas.width, canvas.height);
            let data: Uint8ClampedArray = imgdata.data;
            let coord: C = this.setpoint.slice() as C; // clone
            for(let y=0; y< canvas.height; y++){
                for(let x=0; x<canvas.width; x++){
                    let frac = this.orientation == "vertical" ? 1-y/canvas.height : x/canvas.width;
                    coord[this.axis] = frac;
                    
                    let color = this.axisSpace(coord);
                    
                    let pos = (y*canvas.width + x) * 4;
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
}