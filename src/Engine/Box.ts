import Dimension from "./Dimension";
import Element from "./Element";
import Color from "./Color";

export default class Box extends Element{
    background:Color


    constructor(dimension:Dimension, background:Color){
        super(dimension)
        this.background = background
    }

    Draw(){
        window.ctx.fillStyle = this.background.toString()
        window.ctx.fillRect(this.dimension.x, this.dimension.y, this.dimension.width, this.dimension.height)
    }

}