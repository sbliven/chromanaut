class Viewport {

    constructor(public canvas: HTMLCanvasElement) {}

    display(canvas: HTMLCanvasElement) {
        let ctx: CanvasRenderingContext2D | null= canvas.getContext("2d");
        if(ctx != null) {
            let imgdata: ImageData = ctx.getImageData(0,0, canvas.width, canvas.height);
            let data = imgdata.data;
            for(let y=0; y< canvas.height; y++){
                for(let x=0; x<canvas.width; x++){
                    let pos = (y*canvas.width + x) * 4;
                    data[pos  ] = 255;
                    data[pos+1] = 0;
                    data[pos+2] = 0;
                    data[pos+3] = 255;   
                }
            }
            ctx.putImageData(imgdata, 0,0);
        }
    }
    
}