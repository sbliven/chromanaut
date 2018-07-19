import 'mocha';
import {SelectionManager} from '../../src/chromanaut/selection';
import {ColorCircle} from '../../src/chromanaut/viewport';
import {distance2} from '../../src/chromanaut/util';
import {Color} from '../../src/chromanaut/color';
import {hsl} from 'color-space';
import {expect} from 'chai';
import {JSDOM, DOMWindow} from 'jsdom';

function makeCanvas(width: number, height: number): HTMLCanvasElement {
    
    // Create DOM
    const dom: JSDOM = new JSDOM(`<!DOCTYPE html><html><body><canvas id="canvas" width="${width}" height="${height}"></canvas></body></html>`),
          window: DOMWindow = dom.window;
    
    // Copy the new DOM variables to global scope
    function copyProps(src: any, target: any) {
        const props = Object.getOwnPropertyNames(src)
            .filter(prop => typeof target[prop] === 'undefined')
            .reduce((result, prop) => ({
                ...result,
                [prop]: Object.getOwnPropertyDescriptor(src, prop),
            }), {});
        Object.defineProperties(target, props);
    }

    const globalAny:any = global;
    globalAny.window = window;
    globalAny.document = window.document;
    globalAny.navigator = {
        userAgent: 'node.js',
    };
    copyProps(window, globalAny);

    // Return canvas
    let canvas: HTMLCanvasElement | null = window.document.querySelector("canvas");
    if(canvas !== null) {
        return canvas;
    } else {
        throw new Error("Can't create canvas");
    }
}

function assertExists<T>(val: T|null): T {
    expect(val).to.not.be.null;
    if(val !== null) {
        return val;
    } else {
        throw "Null wasn't caught by chia";
    }
}

describe('chromanaut/viewport.js', function() {
   
    describe('ColorCircle', function() {
        let canvas: HTMLCanvasElement;
        before(function() {
            canvas = makeCanvas(100,100);
        });
        after(function() {
            // TODO restore globals
        });
        
        const red = [0, 100, 50],
            cyan = [180, 100, 50],
            yellowgreen = [90, 100, 50],
            purple = [270, 100, 50];
        const redpos = [1, 0.5],
              cyanpos = [0, 0.5],
              yellowgpos = [0.5, 0],
              purplepos = [0.5, 1];

        it('getbounds', function() {
            let canvas = makeCanvas(100,100);
            let selection = new SelectionManager(red, hsl);
            
            expect(window.document).to.not.be.undefined;
            
            let circle = new ColorCircle(selection, hsl, canvas, 0, 1);

            expect(circle.getBounds()).to.eql([0,0,100,100]);
        });

        it('posFromColor', function() {
            // circle of saturated colors
            let canvas = makeCanvas(100,100);
            let selection = new SelectionManager(red, hsl);
            
            expect(window.document).to.not.be.undefined;
            
            let circle = new ColorCircle(selection, hsl, canvas, 0, 1);
            
            let result: Color = assertExists(circle.posFromColor(red));
            let expected = redpos;
            expect(distance2(result, expected)).to.be.lessThan(1e-5);
            
            result = assertExists(circle.posFromColor(cyan));
            expected = cyanpos;
            expect(distance2(result, expected)).to.be.lessThan(1e-5);

            result = assertExists(circle.posFromColor(yellowgreen));
            expected = yellowgpos;
            expect(distance2(result, expected)).to.be.lessThan(1e-5);
            
            result = assertExists(circle.posFromColor(purple));
            expected = purplepos;
            expect(distance2(result, expected)).to.be.lessThan(1e-5);
        });
        
        it('colorFromPos', function() {
            let canvas = makeCanvas(100,100);
            let selection = new SelectionManager(red, hsl);
            
            expect(window.document).to.not.be.undefined;
            
            let circle = new ColorCircle(selection, hsl, canvas, 0, 1);
            
            let [x, y] = redpos;
            let expected = red;
            let result: Color = assertExists(circle.colorFromPos(x, y));
            expect(distance2(result, expected)).to.be.lessThan(1e-5);

            [x, y] = cyanpos;
            expected = cyan;
            result = assertExists(circle.colorFromPos(x, y));
            expect(distance2(result, expected)).to.be.lessThan(1e-5);

            [x, y] = yellowgpos;
            expected = yellowgreen;
            result = assertExists(circle.colorFromPos(x, y));
            expect(distance2(result, expected)).to.be.lessThan(1e-5);

            [x, y] = purplepos;
            expected = purple;
            result = assertExists(circle.colorFromPos(x, y));
            expect(distance2(result, expected)).to.be.lessThan(1e-5);
            

        })
    });
});