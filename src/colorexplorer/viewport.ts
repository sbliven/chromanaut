import {SelectionManager} from "./colorexplorer";
import {Color, Color3, inRange, ColorMapping, sRGBtransform, rgb2css} from "./color";

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

/**
 * A view of the current selection space
 * @param C Colorspace of this viewport
 */
interface Viewport {
    /**
     * Update the graphics of this viewport.
     *
     * Typically called by event handlers listening for changes to the data.
     */
    update(): void;
}

export class Swatch<S extends Color> implements Viewport {
    constructor(protected model: SelectionManager<S>,
                protected toRGB: sRGBtransform<S>,
                protected canvas: HTMLElement) {
        model.addEventListener("colorselected", this.update.bind(this));
    }
    update(): void {
        console.log("updating selection");
        let selected: S | null = this.model.selection;
        let color: Color3 | null = this.toRGB(selected);
        if( color === null ) {
            this.canvas.style.background = "#ffffff00";
        } else {
            this.canvas.style.background = rgb2css(color);
        }
    }
}

export interface ViewportAesthetics {
    /// x, y, width, height with respect to the canvas. Defaults to the full canvas
    boundingBox?: [number,number,number,number];
    /// selection cursor type. Default "circle"
    cursor?: "none"|"circle"|"crosshair";
}
/**
 * A slice of color space across one of the axes
 *
 * @param C ColorSpace of the underlying SelectionManager
 */
abstract class AxisAlignedViewport<C extends Color, S extends Color> implements Viewport {
    protected aesthetics: ViewportAesthetics;
    
    constructor(protected model: SelectionManager<S>,
                protected fromSelection: ColorMapping<S,C>,
                protected toSelection: ColorMapping<C,S>,
                protected toRGB: sRGBtransform<C>,
                protected canvas: HTMLCanvasElement,
                aesthetics?: ViewportAesthetics) {
        model.addEventListener("colorselected", this.update.bind(this));
        canvas.addEventListener('mousemove', this.moveHandler.bind(this));
        canvas.addEventListener('click', this.clickHandler.bind(this));
        this.aesthetics = aesthetics || {};
    }

    update(): void {
        let ctx: CanvasRenderingContext2D | null = this.canvas.getContext("2d");
        if(ctx != null) {
            // Main gradient area
            let bb: [number,number,number,number] = this.getBounds();
            let x0 = bb[0],
                y0 = bb[1],
                w = bb[2],
                h = bb[3];
            let imgdata: ImageData = ctx.getImageData(x0,y0,w,h);
            let data: Uint8ClampedArray = imgdata.data;
            for(let y=0; y< h; y++){
                for(let x=0; x<w; x++){
                    // Get color from subclass
                    let coord: C | null = this.colorFromPos(x/w,y/h);
                    
                    let color: Color3 | null = this.toRGB(coord);
                    
                    let pos = (y*w + x) * 4;
                    if( color != null && inRange(color)) {
                        data[pos  ] = color[0]*255;
                        data[pos+1] = color[1]*255;
                        data[pos+2] = color[2]*255;
                        data[pos+3] = 255;
                    } else {
                        // null color -> translucent
                        data[pos  ] = 255;
                        data[pos+1] = 255;
                        data[pos+2] = 255;
                        data[pos+3] = 0;
                    }
                }
            }
            ctx.putImageData(imgdata, x0, y0);
            this.overlay(ctx, bb);
        }
    }
    
    overlay(ctx: CanvasRenderingContext2D, boundingBox: [number,number,number,number]): void {}
    
    /**
     * Set the aesthetics for this viewport
     *
     * @param aesthetics Object with new aesthetics properties
     * @param update Should existing aesthetics be retained if not specified? default: true
     */
    setAesthetics(aesthetics: ViewportAesthetics, update?: boolean): void {
        if((update === undefined || update) && this.aesthetics) {
            // update existing aesthetics
            Object.assign(this.aesthetics,aesthetics);
        } else {
            // override
            this.aesthetics = aesthetics;
        }
        this.update();
    }
    /**
     * Get the current aesthetics
     */
    getAesthetics(): ViewportAesthetics {
        return this.aesthetics;
    }

    /**
     * Get the bounding box for this widget relative to the parent canvas.
     *
     * The box is set using aesthetics.boundingBox and defaults to the full canvas.
     * @return [x,y,width,height]
     */
    getBounds(): [number, number, number, number] {
        return (this.aesthetics && this.aesthetics.boundingBox) || 
                        [0,0,this.canvas.width,this.canvas.height]
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
     * @return x, y fractional pixel coordinate (origin in the top-left, 0-1)
     */
    abstract posFromColor(color: C): [number, number] | null;

    /**
     * Converts a pixel coordinate to a visualizationSpace color
     * This is the inverse of posFromColor
     *
     * Pixels start with 0,0 in the top left and go to (width, height)
     * With the default aesthetics, colors start with (0,0,*) in the bottom left
     * and (1,1,*) in the top right.
     *
     * @param x pixel column index in [0, 1)
     * @param y pixel row index in [0, 1)
     * @return a color, with axes orthogonal to this slice taken from the selected color
     */
    abstract colorFromPos(x: number, y: number): C | null;

    /**
     * Handle mouse motion events
     */
    moveHandler(e: MouseEvent) {
        if( e.buttons) {
            let bb = this.getBounds(),
                x = (e.offsetX - bb[0])/bb[2],
                y = (e.offsetY - bb[1])/bb[3];
                
            let color = this.colorFromPos(x,y);
            let selection = this.toSelection(color);
            if( selection !== null) {
                this.model.selection = selection;
            }
        }
        //console.log("Moved to " + e.offsetX + ", " + e.offsetY+" button: "+e.button+" buttons: "+e.buttons);
        
    }
    /**
     * Handle click events
     */
    clickHandler(e: MouseEvent) {
        let bb = this.getBounds(),
            x = (e.offsetX - bb[0])/bb[2],
            y = (e.offsetY - bb[1])/bb[3];

        let color = this.colorFromPos(x,y);
        let selection = this.toSelection(color);
        if( selection !== null) {
            this.model.selection = selection;
        }
        //console.log("clicked at " + e.offsetX + ", " + e.offsetY);
        //console.log("         = " + color);
    }
}

/**
 * A 2D viewport showing a slice through color space
 */
export class ColorSlice<C extends Color, S extends Color> extends AxisAlignedViewport<C,S>{
    xaxis: number;
    yaxis: number;

    constructor(model: SelectionManager<S>,
                fromSelection: ColorMapping<S,C>,
                toSelection: ColorMapping<C,S>,
                toRGB: sRGBtransform<C>,
                canvas: HTMLCanvasElement,
                xaxis?: number, yaxis?: number,
                aesthetics?: ViewportAesthetics) {
        super(model, fromSelection, toSelection, toRGB, canvas, aesthetics);
        this.xaxis = xaxis != undefined ? xaxis : 0;
        this.yaxis = yaxis != undefined ? yaxis : 1;
        this.update();
    }
    
    posFromColor(color: C): [number, number] | null {
        let x = color[this.xaxis],
            y = 1 - color[this.yaxis];
        return [x,y];
    }
    colorFromPos(x: number, y: number): C | null {
        let coord: C | null = this.fromSelection(this.model.selection);
        if( coord === null) {
            return null;
        }
        coord = coord.slice() as C; // clone
        coord[this.xaxis] = x;
        coord[this.yaxis] = 1-y;
        return coord;
    }
}

/**
 * A viewport showing a single color axis as a slider
 */
export class ColorStrip<C extends Color, S extends Color> extends AxisAlignedViewport<C,S> {
    axis: number;
    orientation: "vertical" | "horizontal";
    
    constructor(model: SelectionManager<S>,
                 fromSelection: ColorMapping<S,C>,
                 toSelection: ColorMapping<C,S>,
                 toRGB: sRGBtransform<C>,
                 canvas: HTMLCanvasElement,
                 axis?: number,
                 orientation?: "vertical" | "horizontal",
                 aesthetics?: ViewportAesthetics) {
        super(model, fromSelection, toSelection, toRGB, canvas, aesthetics)
        this.axis = axis != undefined ? axis : 0;
        this.orientation = orientation || "horizontal";
        this.update();
    }

    posFromColor(color: C): [number, number] | null {
        let x = 0;
        let y = 0;
        if( this.orientation == "horizontal") {
            x = color[this.axis];
        } else {
            y = 1 - color[this.axis];
        }
        return [x,y];
    }
    colorFromPos(x: number, y: number): C | null {
        let coord: C | null = this.fromSelection(this.model.selection);
        if( coord === null) {
            return null;
        }
        coord = coord.slice() as C; // clone
        if( this.orientation == "horizontal") {
            coord[this.axis] = x;
        } else {
            coord[this.axis] = 1 - y;
        }
        return coord;
    }
}

/**
 * Viewport using cylindrical coordinates
 */
export class ColorCircle<C extends Color, S extends Color> extends AxisAlignedViewport<C,S>{
    radialAxis: number;
    thetaAxis: number;
    clipToCircle: boolean;

    constructor(model: SelectionManager<S>,
                fromSelection: ColorMapping<S,C>,
                toSelection: ColorMapping<C,S>,
                toRGB: sRGBtransform<C>,
                canvas: HTMLCanvasElement,
                thetaAxis?: number, radialAxis?: number,
                aesthetics?: ViewportAesthetics,
                clipToCircle?: boolean) {
        super(model, fromSelection, toSelection, toRGB, canvas, aesthetics);
        this.radialAxis = radialAxis != undefined ? radialAxis : 0;
        this.thetaAxis = thetaAxis != undefined ? thetaAxis : 1;
        this.clipToCircle = clipToCircle != undefined ? clipToCircle : true;
        this.update();
    }
    
    posFromColor(color: C): [number, number] | null {
        let [x0,y0,w,h] = this.getBounds(),
            // rescale to preserve aspect ratio
            sx = Math.min(w,h)/w,
            sy = Math.min(w,h)/h,
            r = color[this.radialAxis],
            t = color[this.thetaAxis]*2*Math.PI;
        if(this.clipToCircle && r>1) {
            r = 1;
        }
        let x = (1/2 + r*sx*Math.cos(t))*sx,
            y = (1/2 - r*sy*Math.sin(t))*sy;
        return [x,y];
    }
    colorFromPos(x: number, y: number): C | null {
        let [x0,y0,w,h] = this.getBounds(),
            // rescale to preserve aspect ratio
            sx = Math.min(w,h)/w/2,
            sy = Math.min(w,h)/h/2,

            dx = (x - 1/2)/sx,
            dy = (1/2 - y)/sy,
            r = Math.sqrt( dx*dx + dy*dy),
            t = Math.atan2(dy, dx) /2/Math.PI;
        // normalize ranges
        if( t < 0 ) t+=1;
        
        let coord: C | null = this.fromSelection(this.model.selection);
        if( coord === null) {
            return null;
        }
        coord = coord.slice() as C; // clone
        coord[this.radialAxis] = r;
        coord[this.thetaAxis] = t;
        return coord;
    }
    
    overlay(ctx: CanvasRenderingContext2D, bb: [number,number,number,number]): void {
        let w = bb[2],
            h = bb[3],
            cx = bb[0] + w/2,
            cy = bb[1] + h/2,
            r = Math.min(w,h)/2;
        ctx.lineWidth = 1;

        // Draw bounding box, for debugging
        //ctx.beginPath()
        //ctx.rect(bb[0],bb[1],w,h);
        //ctx.stroke();

        // Circle boundary
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, 2*Math.PI);
        ctx.stroke();
    }
}

