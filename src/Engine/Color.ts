export default class Color{
    r:number
    g:number
    b:number
    a:number

    constructor(r:number,g:number,b:number,a:number = 255){
        this.r = clamp(r, 0, 255)
        this.g = clamp(g, 0, 255)
        this.b = clamp(b, 0, 255)
        this.a = clamp(a, 0, 255)
    }

    toString(){
        return `rgba(${this.r},${this.g},${this.b},${this.a})`
    }
}

function clamp(n:number, min:number, max:number) {
    return Math.max(min, Math.min(n, max))
}