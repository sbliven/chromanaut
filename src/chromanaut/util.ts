/**
 * Euclidean distance squared between two arrays
 */
function distance2(a: number[], b: number[]): number {
    if(a.length != b.length) {
        throw "Input lengths don't match";
    }
    let sum = 0;
    for(let i=0;i<a.length;i++) {
        let d = a[i] - b[i];
        sum += d*d;
    }
    return sum;
}
/**
 * Euclidean distance between two arrays
 */
function distance(a: number[], b: number[]): number {
    return Math.sqrt(distance2(a,b));
}
