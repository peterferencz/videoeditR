import Element from "./Engine/Element";
import { VideoEditR } from "./index";

export default class Scene{
    private generator:VideoEditR.sceneGenerator
    private duration:number
    private elements:Element[]

    constructor(generator:VideoEditR.sceneGenerator){
        this.generator = generator;
        this.elements = []
        this.duration = this.getduration()
    }

    private GeneratorFunctionType = (function*(){yield undefined;}).constructor;
    private getduration(){
        const generator = this.generator(this)
        let pendingGenerators:(Generator<undefined, void, unknown>)[] = []
        let currentLength = 0

        let generatorResult = generator.next()
        do{
            if (<any>generatorResult.value instanceof this.GeneratorFunctionType) {
                pendingGenerators.push((generatorResult.value)!())
            }
    
            currentLength++
            //Step our current generator, and every generator in the stack
            generatorResult = generator.next()
            pendingGenerators = pendingGenerators.filter((generator) => {
                return !(generator.next().done)
            })
        } while(!(generatorResult.done && pendingGenerators.length == 0))

        return currentLength;
    }
    getGenerator(){
        return this.generator;
    }

    AddElement(element:Element){
        this.elements.push(element)
    }
    ClearElements(){
        this.elements = []
    }

    getDuration(){
        return this.duration
    }

    Draw(){
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i].Draw();
        }
    }
}