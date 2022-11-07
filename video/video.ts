import Box from "../src/Engine/Box";
import Color from "../src/Engine/Color";
import Dimension from "../src/Engine/Dimension";
import { VideoEditR } from "../src/index";

const resolution = {
    width: 1920,
    height: 1080
}

window.Renderer.bootstrap({
    resolution: resolution,
    scenes: [ test1, test2, test3 ],
    fps:1
});

function* test1(scene:VideoEditR.Scene){
    scene.AddElement(new Box(new Dimension(0,0,100,100),new Color(255,0,0)))
    yield* wait(5)
}
function* test2(scene:VideoEditR.Scene){
    scene.AddElement(new Box(new Dimension(0,0,100,100),new Color(0,255,0)))
    yield* wait(5)
}
function* test3(scene:VideoEditR.Scene){
    scene.AddElement(new Box(new Dimension(0,0,100,100),new Color(0,0,255)))
    yield* wait(5)
}

function* intro(scene:VideoEditR.Scene) {

    const xRes = 160
    const yRes = 90

    for (let y = 0; y < yRes; y++) {
        for (let x = 0; x < xRes; x++) {
            const box = new Box(new Dimension(x* resolution.width/xRes,y*resolution.height/yRes,100,100),
                new Color(x * xRes/255,y*yRes/255,0))
            scene.AddElement(box)
            yield;
        }
    }

}
function* main(scene:VideoEditR.Scene) {
    // console.log("Main scene")
    // yield function* () {
    //     console.log("nested function - 1")
    //     yield;
    //     console.log("nested function - 2")
    // }
    // yield;
    // yield* wait(5);

    const box = new Box(new Dimension(0,0,100,100), new Color(0,255,0))
    scene.AddElement(box)
    yield;
}

function* wait(i:number){
    while (i > 0) {
        i--
        yield;
    }
}