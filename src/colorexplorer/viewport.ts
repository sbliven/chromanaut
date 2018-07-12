import {SelectionManager} from "./colorexplorer";
import {Color, rgb2css, inGamut, normalize, unnormalize} from "./color";
import {colorspace, rgb} from "color-space";

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
 */
interface Viewport {
    /**
     * Update the graphics of this viewport.
     *
     * Typically called by event handlers listening for changes to the data.
     */
    update(): void;
}

/**
 * Properties affecting the display of some viewports
 */
export interface ViewportAesthetics {
    /// x, y, width, height with respect to the canvas. Defaults to the full canvas
    boundingBox?: [number,number,number,number];
    /// selection cursor type. Default "circle"
    cursor?: "none"|"circle"|"crosshair";
}

/**
 * Paint a canvas uniformly with the selected color
 */
export class Swatch implements Viewport {
    constructor(protected model: SelectionManager,
                protected canvas: HTMLElement) {
        model.addEventListener("colorselected", this.update.bind(this));
    }
    update(): void {
        console.log("updating selection");
        let selected: Color | null = this.model.selection;
        // convert from model colorspace to RGB
        let color: Color | null = this.model.space.rgb(selected);
        if( color === null ) {
            this.canvas.style.background = "#ffffff00";
        } else {
            this.canvas.style.background = rgb2css(color);
        }
    }
}


/**
 * A slice of color space across one of the axes
 */
abstract class AxisAlignedViewport implements Viewport {
    protected aesthetics: ViewportAesthetics;
    
    constructor(protected model: SelectionManager,
                protected space: colorspace,
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
                    let coord: Color | null = this.colorFromPos(x/w,y/h);
                    
                    // convert to RGB
                    let color: Color | null = this.space.rgb(coord);
                    
                    let pos = (y*w + x) * 4;
                    if( color != null && inGamut(rgb, color)) {
                        data[pos  ] = color[0];
                        data[pos+1] = color[1];
                        data[pos+2] = color[2];
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
     * Convert a color in this viewport's colorspace to a pixel coordinate.
     * This is the inverse of colorFromPos.
     *
     * With the default aesthetics, colors start with (0,0,*) in the bottom left
     * and (1,1,*) in the top right (ignoring axes orthogonal to this slice).
     * Pixels start with 0,0 in the top left and go to (width, height).
     *
     * @param color
     * @return x, y fractional pixel coordinate (origin in the top-left, 0-1)
     */
    abstract posFromColor(color: Color): [number, number] | null;

    /**
     * Converts a pixel coordinate to a color in this viewport's colorspace
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
    abstract colorFromPos(x: number, y: number): Color | null;

    /**
     * Handle mouse motion events
     */
    moveHandler(e: MouseEvent) {
        if( e.buttons) {
            let bb = this.getBounds(),
                x = (e.offsetX - bb[0])/bb[2],
                y = (e.offsetY - bb[1])/bb[3];
                
            let color: Color|null = this.colorFromPos(x,y);
            // convert from viewport colorspace to model colorspace
            let selection: Color|null = this.space[this.model.space.name](color);
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
        // convert from viewport colorspace to model colorspace
        let selection = this.space[this.model.space.name](color);
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
export class ColorSlice extends AxisAlignedViewport{
    xaxis: number;
    yaxis: number;

    constructor(model: SelectionManager,
                space: colorspace,
                canvas: HTMLCanvasElement,
                xaxis?: number, yaxis?: number,
                aesthetics?: ViewportAesthetics) {
        super(model, space, canvas, aesthetics);
        this.xaxis = xaxis != undefined ? xaxis : 0;
        this.yaxis = yaxis != undefined ? yaxis : 1;
        this.update();
    }
    
    posFromColor(color: Color): [number, number] | null {
        let norm = normalize(this.space, color),
            x = norm[this.xaxis],
            y = 1 - norm[this.yaxis];
        return [x,y];
    }
    colorFromPos(x: number, y: number): Color | null {
        // Convert selection to viewport colorspace
        let coord: Color | null = this.model.space[this.space.name](this.model.selection);
        if( coord === null) {
            return null;
        }
        let norm = normalize(this.space, coord); // clone
        
        norm[this.xaxis] = x;
        norm[this.yaxis] = 1-y;
        return unnormalize(this.space, norm);
    }
}

/**
 * A viewport showing a single color axis as a slider
 */
export class ColorStrip extends AxisAlignedViewport {
    axis: number;
    orientation: "vertical" | "horizontal";
    
    constructor(model: SelectionManager,
                 space: colorspace,
                 canvas: HTMLCanvasElement,
                 axis?: number,
                 orientation?: "vertical" | "horizontal",
                 aesthetics?: ViewportAesthetics) {
        super(model, space, canvas, aesthetics)
        this.axis = axis != undefined ? axis : 0;
        this.orientation = orientation || "horizontal";
        this.update();
    }

    posFromColor(color: Color): [number, number] | null {
        let x = 0;
        let y = 0;
        let norm = normalize(this.space, color);
        if( this.orientation == "horizontal") {
            x = norm[this.axis];
        } else {
            y = 1 - norm[this.axis];
        }
        return [x,y];
    }
    colorFromPos(x: number, y: number): Color | null {
        let coord: Color | null = this.model.space[this.space.name](this.model.selection);
        if( coord === null) {
            return null;
        }
        let norm = normalize(this.space, coord); // clone
        if( this.orientation == "horizontal") {
            norm[this.axis] = x;
        } else {
            norm[this.axis] = 1 - y;
        }
        return unnormalize(this.space, norm);
    }
}

/**
 * Viewport using cylindrical coordinates
 */
export class ColorCircle extends AxisAlignedViewport{
    radialAxis: number;
    thetaAxis: number;
    clipToCircle: boolean;

    constructor(model: SelectionManager,
                space: colorspace,
                canvas: HTMLCanvasElement,
                thetaAxis?: number, radialAxis?: number,
                aesthetics?: ViewportAesthetics,
                clipToCircle?: boolean) {
        super(model, space, canvas, aesthetics);
        this.radialAxis = radialAxis != undefined ? radialAxis : 0;
        this.thetaAxis = thetaAxis != undefined ? thetaAxis : 1;
        this.clipToCircle = clipToCircle != undefined ? clipToCircle : true;
        this.update();
    }
    
    posFromColor(color: Color): [number, number] | null {
        let [x0,y0,w,h] = this.getBounds(),
            // rescale to preserve aspect ratio
            sx = Math.min(w,h)/w,
            sy = Math.min(w,h)/h,
            norm = normalize(this.space, color),
            r = norm[this.radialAxis],
            t = norm[this.thetaAxis]*2*Math.PI;
        if(this.clipToCircle && r>1) {
            r = 1;
        }
        let x = (1/2 + r*sx*Math.cos(t))*sx,
            y = (1/2 - r*sy*Math.sin(t))*sy;
        return [x,y];
    }
    colorFromPos(x: number, y: number): Color | null {
        let [x0,y0,w,h] = this.getBounds(),
            // rescale to preserve aspect ratio
            sx = Math.min(w,h)/w/2,
            sy = Math.min(w,h)/h/2,

            dx = (x - 1/2)/sx,
            dy = (1/2 - y)/sy,
            r = Math.sqrt( dx*dx + dy*dy),
            t = Math.atan2(dy, dx) /2/Math.PI; //angle theta
        // normalize ranges
        if( t < 0 ) t+=1;
        
        let coord: Color | null = this.model.space[this.space.name](this.model.selection);
        if( coord === null) {
            return null;
        }
        let norm = normalize(this.space, coord); // clone
        norm[this.radialAxis] = r;
        norm[this.thetaAxis] = t;
        return unnormalize(this.space, norm);
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

