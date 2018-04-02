

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



function drawRainbow(canvas: HTMLCanvasElement) {
    let ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if(ctx != null) {
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(0,0,150,75);
    }
};



/**
 * Test image. Inserts a red blurb into #testImage1
 */
function redImage(container: HTMLElement) {
    let width = 60,
        height = 60,
        buffer = new Uint8ClampedArray(width * height * 4); // have enough bytes
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            let pos = (y * width + x) * 4; // position in buffer based on x and y
            buffer[pos  ] = 255;           // some R value [0, 255]
            buffer[pos+1] = 0;           // some G value
            buffer[pos+2] = 128;           // some B value
            buffer[pos+3] = 255;           // set alpha channel
        }
    }
    // create off-screen canvas element
    let canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    if(ctx != null) {

        canvas.width = width;
        canvas.height = height;

        // create imageData object
        let idata = ctx.createImageData(width, height);
        // set our buffer as source
        idata.data.set(buffer);

        // update canvas with new data
        ctx.putImageData(idata, 0, 0);

        let dataUri = canvas.toDataURL(); // produces a PNG file

        let img = document.createElement('img');
        img.setAttribute('src', dataUri);
        img.setAttribute('class','img-fluid');

        container.appendChild(img);
    }
};
