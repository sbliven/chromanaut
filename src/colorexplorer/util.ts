//import {Color3} from "./color";

function distance2(a: Color3, b: Color3): number {
    let sum = 0;
    for(let i=0;i<3;i++) {
        let d = a[i] - b[i];
        sum += d*d;
    }
    return sum;
}
function distance(a: Color3, b: Color3): number {
    return Math.sqrt(distance2(a,b));
}