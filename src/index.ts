import { Renderer } from "./Renderer"
import ImportedScene from "./Scene"

export namespace VideoEditR{
    export type bootstrapOptions = {
        resolution: {width:number, height:number}
        fps:number
        scenes: sceneGenerator[],
    }
    export type sceneGenerator = (scene:Scene) => Generator< undefined | (()=>Generator<undefined, void, unknown>) , void, unknown>;
    export type Scene = ImportedScene;
}

declare global{
    interface Window {
        Renderer:Renderer
        ctx:CanvasRenderingContext2D
    }
}
window.Renderer = new Renderer();

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            if(e.shiftKey){
                window.Renderer.prevScene()
            }else{
                window.Renderer.prevFrame()
            }
            break;
        case 'ArrowRight':
            if(e.shiftKey){
                window.Renderer.nextScene()
            }else{
                window.Renderer.nextFrame()
            }
            break;
        case '1':case '2':case '3':case '4':case '5':case '6':case '7':case '8':case '9':
            window.Renderer.typeNumber(parseInt(e.key))
            break;
        case 'Backspace':
            window.Renderer.typeNumberBackspace()
            break;
        case 'F12':
            e.preventDefault()
            if(e.shiftKey){
                window.Renderer.Render("gif")
            }else{
                window.Renderer.Render("mp4")
            }
            break;
        default: break;
    }
})