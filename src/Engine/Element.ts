import Dimension from "./Dimension";

export default class Element{
    dimension:Dimension

    constructor(dimension:Dimension){
        this.dimension = dimension
    }

    Draw(){
        console.log("Not implemented drawing method")
    }

}